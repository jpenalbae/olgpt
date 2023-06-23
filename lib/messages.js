/**
 * FILEPATH: lib/messages.js
 * DESCRIPTION: Read and prepare prompts used for messages.
 * AUTHOR: Jaime Peñalba Estébanez
 * DATE: Thu Thu Jun 22 19:49:35 2023 +0200
 * LICENSE: GPLv3
 */

import fs from 'fs';
import path from 'path';

const msgs = {};

const basedir = new URL('./../messages', import.meta.url).pathname;
fs.readdirSync(basedir).forEach(file => {
    if (file.endsWith('.md')) {
        const name = file.slice(0, -3);
        msgs[name] = fs.readFileSync(path.join(basedir, file), 'utf8');
    }
});

export function getMessage(role, msg_name) {
    return {
        role: role,
        content: msgs[msg_name]
    };
}


