require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK doesn't have a direct listModels, we need to use fetch or check docs.
        // Actually, let's just try 'gemini-1.5-flash' again but check the exact string.
        // Or try 'gemini-1.0-pro'.
        console.log("Attempting to call a model...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
