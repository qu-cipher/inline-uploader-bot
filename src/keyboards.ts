import { Keyboard } from "grammy";
import {
    I_UPLOAD,
} from "./txt.js";

/* Text keyboards */
export const INIT_KEYBOARD = new Keyboard()
    .text(I_UPLOAD)
    .resized();
