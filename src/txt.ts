import chalk from "chalk";

/* Text messages */
export const WELCOME_MESSAGE = `✅ Welcome to quantum's media uploader bot!

🌐 Here, you can upload your videos, pictures or sounds with their unique titles and tags.
⁉️ Uploaded media can be used in any chat through inline command; e.g. \`@quploader_bot <search_query>\`

🔸 Made with ♥️ by @Q1tumC`;
export const ASK_FOR_FILE = 'Send the file to upload.';
export const ASK_FOR_TITLE = 'Send title for your file.';
export const ASK_FOR_TAGS = 'Send tags for your file (seperate with `|`)';

/* Inline Query Results Button */
export const INLINE_BUTTON = "📤 Upload a file 📤"

/* Keyboard buttons */
export const I_UPLOAD = "📤 Upload a file";

/* SQL Queries */
export const DB_USERS_TB = `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id BIGINT NOT NULL UNIQUE,
    username TEXT,
    is_whitelisted BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
export const DB_MEDIA_TB = `CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploaded_by BIGINT NOT NULL,
    title TEXT NOT NULL,
    tags TEXT NOT NULL,
    file_id TEXT NOT NULL UNIQUE,
    file_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(telegram_id) ON DELETE SET NULL 
);`;

/* Console */
export const C_START = `
    ██████           
  ███░░░░███       ☢ This is ${chalk.bgGreen("Q1TUM")} 
 ███    ░░███      
░███     ░███      ${chalk.bold.yellow('➢ Project:')} Quantum's Media Uploader Bot
░███   ██░███      ${chalk.bold.yellow('➢ Version:')} 2584.12.00
░░███ ░░████       ${chalk.bold.yellow('➢ Repo:')} #####
 ░░░██████░██      ${chalk.bold.yellow('➢ Lisence:')} MIT
   ░░░░░░ ░░         
`;