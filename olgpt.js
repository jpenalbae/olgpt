import { Configuration, OpenAIApi } from "openai";
import { GPTTokens } from 'gpt-tokens';
import fs from 'fs';


const model = 'gpt-3.5-turbo-16k-0613';
//const model = 'gpt-3.5-turbo';
const temperature = 0.1;



function write_files(filenames, contents) {
    for (let i = 0; i < filenames.length; i++) {
        console.log(`Writing file ${filenames[i]}`);
        fs.writeFileSync(filenames[i], contents[i]);
    }
}


// check for env var OPENAI_API_KEY
if (!process.env.OPENAI_API_KEY) {
    console.log('Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}


const userPrompt = fs.readFileSync('prompt.md', 'utf8');

fs.rmSync('output', { recursive: true, force: true });
fs.mkdirSync('output', { recursive: false, force: true });
process.chdir('output');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let res;

res = await openai.createChatCompletion({
    model: model,
    messages: [
        {
            role: "system",
            content: `You are an AI developer which will generate code for the
            user based on their description. When generating the code you
            might write as many files a required to complete the task.`
        },
        {
            role: "user",
            content: userPrompt
        },
    ],
    functions: [
        {
            name: "write_files",
            description: "Writes a set of files with the given names and contents.",
            parameters: {
                type: "object",
                properties: {
                    filenames: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array containing each filename."
                    },
                    contents: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array containing the content of each file."
                    }
                },
                required: ["filename", "content"]
            },
            function_call: ""
        }
    ]
});

// console.log(res.data.choices);
// console.log(res.data.choices[0].message);

if (res.data.choices[0].message.function_call.name === 'write_files') {
    const fcall = res.data.choices[0].message.function_call;
    const argument = JSON.parse(fcall.arguments);
    write_files(argument.filenames, argument.contents);
    console.log('Files written. Check the output directory.');
} else {
    console.log('Unexpected response from GPT-3');
    console.log('res.data.choices[0].message');
}


