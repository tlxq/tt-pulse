require('dotenv').config({ path: './.env.local' });

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    console.log("Fetching from:", url.replace(process.env.GEMINI_API_KEY, "REDACTED"));
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error("Google API Error:", JSON.stringify(data.error, null, 2));
    } else {
        console.log("Full Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

listModels();
