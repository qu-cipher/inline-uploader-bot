import { Bot, InlineQueryResultBuilder } from "grammy";
import {
    ASK_FOR_FILE,
    ASK_FOR_TAGS,
    ASK_FOR_TITLE,
    I_UPLOAD,
    INLINE_BUTTON,
    WELCOME_MESSAGE,
} from "./txt.js";
import { INIT_KEYBOARD } from "./keyboards.js";
import { start as LogStart, info, warn, error, debug } from "./logger.js";
import {
    initializeDatabase,
    insertMedia,
    insertUser,
    list10Latest,
    searchMedia,
} from "./database/database.js";
import type { UploadState } from "./types.js";
import type { InlineQueryResult } from "grammy/types";

// Starting
LogStart();

info("Configuring database...");
initializeDatabase();

info("Configuring bot...");
const bot = new Bot("<BIT-TOKEN>");

// for tracking users' steps while uploading
const uploadState = new Map<number, UploadState>();

/**
 * /start command
 */
bot.command("start", async (ctx) => {
    // register user in database
    insertUser(ctx.chatId, ctx.from?.username);
    return await ctx.reply(WELCOME_MESSAGE, {
        parse_mode: "Markdown",
        reply_markup: INIT_KEYBOARD,
    });
});

/**
 * Handling "Upload" command
 * Handling "title" input
 * Handling "tags" input
 */
bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;

    // upload state
    if (ctx.message.text === I_UPLOAD) {
        // refresh the state
        uploadState.delete(userId);

        // set the state, ask for file
        uploadState.set(userId, { step: "file" });
        await ctx.reply(ASK_FOR_FILE, {
            reply_markup: { remove_keyboard: true },
        });
        return;
    }

    // understand which uploading step (title | tags) user is
    const uss = uploadState.get(userId || 0);
    if (!uss) return; // user isn't in memory
    const textData = ctx.msg.text; // text message (data) user have sent

    // if user has to send a title for file
    if (uss.step === "title") {
        uss.title = textData;
        uss.step = "tags";

        await ctx.reply(ASK_FOR_TAGS);
        return;
    }

    // if user has to send tags for file (format: tag1 | tag2 | ...)
    if (uss.step === "tags") {
        uss.tags = textData
            .split("|")
            .map((d) => d.trim())
            .filter(Boolean)
            .join(" "); // turn them into this format: tag1 tag2 tag3 ...

        // save file inside database (file_id)
        insertMedia(userId, uss);

        // remove user from upload memory
        uploadState.delete(userId);
        await ctx.reply("Your file uploaded successfully! /start again.");
    }
});

/**
 * File handler
 */
bot.on([":voice", ":video", ":photo", ":document", ":audio"], async (ctx) => {
    const uss = uploadState.get(ctx.from?.id || 0);
    if (!uss || uss.step != "file") return;             // if user is in memory and they're in file uploading phase

    
    let fileId: string;                 // File's id in Telegram's dataset
    let type: UploadState["fileType"];  // File's type (photo, video, voice, audio, document)

    if (ctx.msg.photo) {
        fileId = ctx.msg.photo.at(-1)!.file_id;
        type = "photo";
    } else if (ctx.msg.video) {
        fileId = ctx.msg.video.file_id;
        type = "video";
    } else if (ctx.msg.voice) {
        fileId = ctx.msg.voice.file_id;
        type = "voice";
    } else if (ctx.msg.audio) {
        fileId = ctx.msg.audio.file_id;
        type = "audio";
    } else if (ctx.msg.document) {
        fileId = ctx.msg.document.file_id;
        type = "document";
    } else return;

    // set file data
    uss.fileId = fileId;
    uss.fileType = type;
    uss.step = "title";

    // ask user for a title
    await ctx.reply(ASK_FOR_TITLE);
});

/**
 * Inline mode
 * For searching for media saved in bot through inline queries (@botusername ...)
 */
bot.inlineQuery(/.*/, async (ctx) => {
    const searchQuery = ctx.inlineQuery.query.trim();
    let rows; // Data from database

    if (searchQuery.length != 0) {
        // user searched for something
        rows = searchMedia(searchQuery);
    } else {
        // no query entered
        // list 10 latest media uploaded (saved in Database)
        rows = list10Latest();
    }

    // return a list of InlineQueryResult objects
    const results = rows.map((media: any) => {
        if (media.file_type === "photo") {
            return InlineQueryResultBuilder.photoCached(
                media.id,
                media.file_id,
                { title: media.title, description: media.tags },
            );
        } else if (media.file_type === "video") {
            return InlineQueryResultBuilder.videoCached(
                media.id,
                media.title,
                media.file_id,
                { description: media.tags },
            );
        } else if (media.file_type === "voice") {
            return InlineQueryResultBuilder.voiceCached(
                media.id,
                media.title,
                media.file_id,
            );
        } else if (media.file_type === "audio") {
            return InlineQueryResultBuilder.audioCached(
                media.id,
                media.file_id,
            );
        } else if (media.file_type === "document") {
            return InlineQueryResultBuilder.documentCached(
                media.id,
                media.title,
                media.file_id,
                { description: media.tags },
            );
        }
    }) as InlineQueryResult[];

    // list results to user
    await ctx.answerInlineQuery(results, {
        cache_time: 0,
        button: { text: INLINE_BUTTON, start_parameter: "upload" },
    });
});

info("Starting bot...");
bot.start();