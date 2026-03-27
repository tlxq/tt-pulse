const git = require('./agent/src/collectors/git.js');
require('dotenv').config({ path: './agent/.env' });

async function test() {
    console.log('Testing Git Global Collector...');
    const result = await git.collect();
    console.log('Result:', result);
}

test();
