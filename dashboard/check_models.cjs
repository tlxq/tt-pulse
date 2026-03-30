/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("Fetching from:", url.replace(apiKey, "REDACTED"));

    try {
        const response = await axios.get(url);
        const data = response.data;
        console.log("Full Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error fetching models:", error.response ? error.response.data : error.message);
    }
}

checkModels();
