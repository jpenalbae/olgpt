/**
 * FILEPATH: lib/ol.js
 * DESCRIPTION: Oompa Loompa code. Mostly the program core and OpenAI API calls.
 * AUTHOR: Jaime Peñalba Estébanez
 * DATE: Sat Jun 20 17:53:41 2023 +0200
 * LICENSE: GPLv3
 */

// TODO
// - Count the total number of tokens used.

import fs from 'fs';

import { Configuration, OpenAIApi } from "openai";
import { write_files, runCmd } from './agent.js';
import { getMessage } from "./messages.js";

export let model = 'gpt-3.5-turbo-16k-0613';
export let temperature = 0.1;


const f_write_files = {
    name: "write_files",
    description: "Writes a set of files with the given names and contents.",
    parameters: {
        type: "object",
        properties: {
            files: {
                type: "array",
                description: "Array containing each filename and content to write.",
                items: {
                    type: "object",
                    required: ["filename", "content"],
                    properties: {
                        filename: {
                            type: "string",
                            description: "The filename to create."
                        },
                        content: {
                            type: "string",
                            description: "The file content."
                        }
                    }
                }
            }
        },
        required: ["files"],
    }
};

const f_compile_code = {
    name: "compile_code",
    description: "Compiles a program using the given command.",
    parameters: {
        type: "object",
        properties: {
            needs_compile: {
                type: "boolean",
                description: "Whether the code needs to be compiled."
            },
            command: {
                type: "string",
                description: "The command to run to build the code."
            }
        },
        required: ["needs_compile"]
    }
}

const f_run_code = {
    name: "run_code",
    description: "Runs a program using the given command.",
    parameters: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "The command to run the program."
            },
            needs_exec: {
                type: "boolean",
                description: "Whether the file needs execution permissions before executing."
            }
        },
        required: ["command", "needs_exec"]
    }
}


async function chatCompletion(messages, options) {
    let res;
    let args = undefined;

    const completion = {
        model: model,
        temperature: temperature,
        messages: messages
    };

    if (options.functions)
        completion.functions = options.functions;

    if (options.function_call)
        completion.function_call = { name: options.function_call };

    res = await openai.createChatCompletion(completion);

    const message = res.data.choices[0].message;

    if (options.function_call && message.function_call)
        args = JSON.parse(message.function_call.arguments);

    if (options.append_message)
        messages.push(message);

    return { message: message, args: args };
}


export async function genCode(messages) {
    let res;

    res = await chatCompletion(messages, {
        functions: [f_write_files],
        function_call: "write_files",
        append_message: true
    });

    write_files(res.args.files);

    messages.push({ 
        role: 'function',
        name: 'write_files',
        content: JSON.stringify({sucess: true})
    });

    return messages;
}

export async function buildCode(messages, dry_run=false) {
    let res;
    let runRes = {success: true};

    messages.push(getMessage('user', 'compile'));

    res = await chatCompletion(messages, {
        functions: [f_compile_code],
        function_call: "compile_code",
        append_message: true
    });

    if (!dry_run) {
        if (res.args.needs_compile)
            runRes = await runCmd(res.args.command);

        messages.push({
            role: 'function',
            name: 'compile_code',
            content: JSON.stringify(runRes)
        });
    } else {
        console.log('[*] Compile')
        console.log(' - needs compile: ' + res.args.needs_compile);
        console.log(' - command: ' + res.args.command);
    }

    return { messages: messages, exec: runRes };
}

export async function runCode(messages, dry_run=false) {
    let res;
    let runRes = {success: true};

    messages.push(getMessage('user', 'run'));

    res = await chatCompletion(messages, {
        functions: [f_run_code],
        function_call: "run_code",
        append_message: true
    });

    if (!dry_run) {
        if (res.args.needs_exec)
            fs.chmodSync(res.args.command.split(' ')[0], 0o755);

        runRes = await runCmd(res.args.command);

        messages.push({
            role: 'function',
            name: 'run_code',
            content: JSON.stringify(runRes)
        });
    } else {
        console.log('[*] Run')
        console.log(' - needs exec: ' + res.args.needs_exec);
        console.log(' - command: ' + res.args.command);
    }

    return { messages: messages, exec: runRes };
}



// check for env var OPENAI_API_KEY
if (!process.env.OPENAI_API_KEY) {
    console.log('Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

