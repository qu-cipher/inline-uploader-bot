import Database from "better-sqlite3";
import { DB_MEDIA_TB, DB_USERS_TB } from "../txt.js";
import type { UploadState } from "../types.js";

/**
 * SQLite database object
 * Creates `database.db` file in project's root directory if not exist
 */
const db: Database.Database = new Database("database.db", {
    // verbose: console.log,
});

/**
 * Runs SQL queries
 * @param query 
 */
function runQuery(query: string) {
    db.prepare(query).run();
}

/**
 * Initializes database schema
 */
function initializeDatabase() {
    // Users table
    runQuery(DB_USERS_TB);

    // Media table
    runQuery(DB_MEDIA_TB);
}

/**
 * Function to register a user inside database
 * @param telegramId 
 * @param username 
 */
function insertUser(telegramId: number, username?: string) {
    db.prepare(
        `INSERT INTO users(telegram_id, username) 
        VALUES (?, ?) 
        ON CONFLICT(telegram_id) 
        DO UPDATE SET username = excluded.username;`,
    ).run(telegramId, username);
}

/**
 * Function to save file inside database
 * @see UploadState
 * @param uploader 
 * @param upData 
 */
function insertMedia(uploader: number, upData: UploadState) {
    db.prepare(
        `INSERT OR IGNORE INTO media (uploaded_by, title, tags, file_id, file_type) VALUES (?, ?, ?, ?, ?);`,
    ).run(uploader, upData.title, upData.tags, upData.fileId, upData.fileType);
}

/**
 * Function to list 10 latest files saved in database
 */
function list10Latest() {
    return db.prepare(
        `SELECT * FROM media ORDER BY created_at DESC LIMIT 10`
    ).all();
}

/**
 * Function to search for media saved in database based on text query from user
 * @param query 
 * @returns list of items available
 */
function searchMedia(query: string) {
    const searchTerm = `%${query}%`;
    
    return db.prepare(`
        SELECT * FROM media 
        WHERE title LIKE ? OR tags LIKE ?
        ORDER BY 
            CASE 
                WHEN title LIKE ? THEN 1
                WHEN tags LIKE ? THEN 2
                ELSE 3
            END,
            id DESC
    `).all(searchTerm, searchTerm, searchTerm, searchTerm);
}

export { db, runQuery, initializeDatabase, insertUser, insertMedia, list10Latest, searchMedia };
