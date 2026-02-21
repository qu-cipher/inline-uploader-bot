import chalk from "chalk";
import { C_START } from "./txt.js";
const log = console.log;

/**
 * 
 * First log message
 * 
 */
function start() {
    log(chalk.greenBright(C_START));
}

/**
 * Logs `info` messages with blue font color
 * @param msg 
 */
function info(msg: string) {
    log(chalk.blue(`${chalk.bold("[INFO]")} ${msg}`));
}

/**
 * Logs `warning` messages with yellow (or orange - based on terminal version) font color
 * @param msg 
 */
function warn(msg: string) {
    log(chalk.yellow(`${chalk.bold("[WARN]")} ${msg}`));
}

/**
 * Logs `error` messages with red font color
 * @param msg 
 */
function error(msg: string) {
    log(chalk.red(`${chalk.bold("[ERROR]")} ${msg}`));
}

/**
 * Logs `debug` messages with magenta (or violet) font color
 * @param msg 
 */
function debug(msg: string) {
    log(chalk.magenta(`${chalk.bold("[DEBUG]")} ${msg}`));
}

export { start, info, warn, error, debug }