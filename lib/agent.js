/**
 * FILEPATH: lib/agent.js
 * DESCRIPTION: Functions called by ChatGPT to interface with the real world.
 * AUTHOR: Jaime Peñalba Estébanez
 * DATE: Sat Jun 21 18:23:14 2023 +0200
 * LICENSE: GPLv3
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from 'fs';

const execPromise = promisify(exec);


export function write_files(files) {
    for (let i = 0; i < files.length; i++) {
        const filename = files[i].filename;
        const content = files[i].content;
        console.log(`Writing file ${filename}`);
        fs.writeFileSync(filename, content);
    }
}


export async function runCmd(command) {
    let res = undefined;

    try {
        res = await execPromise(command, {timeout: 10000});
    } catch (err) {
        return { stdout: err.stdout, stderr: err.stderr, error: err };
    }

    return res;
}
