/**
 * FILEPATH: olgpt.js
 * DESCRIPTION: Main file for Oompa Loompa GPT.
 * AUTHOR: Jaime Peñalba Estébanez
 * DATE: Sat Jun 17 01:48:37 2023 +0200
 * LICENSE: GPLv3
 */

import path from 'path';
import fs from 'fs';
import { ArgumentParser } from 'argparse';
import { getMessage } from "./lib/messages.js";
import { genCode, buildCode, runCode } from './lib/ol.js';

const basedir = new URL('./', import.meta.url).pathname;


// if the first argument is a file, use it as the user prompt
// otherwise, use the default prompt
let userPrompt;
if (process.argv.length > 2)
    userPrompt = fs.readFileSync(process.argv[2], 'utf8');
    //userPrompt = process.argv[2];
else
    userPrompt = fs.readFileSync(path.join(basedir, 'prompt.md'), 'utf8');

fs.rmSync('output', { recursive: true, force: true });
fs.mkdirSync('output', { recursive: false, force: true });
process.chdir('output');


let messages = [
    getMessage('system', 'main'),
    { role: 'user', content: userPrompt }
];


let res;

await genCode(messages);
res = await buildCode(messages);
console.log(res.exec);
res = await runCode(messages);
console.log(res.exec);

