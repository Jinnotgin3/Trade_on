require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No GEMINI_API_KEY found in .env');
        return;
    }
    console.log('Using API Key (first 5 chars):', apiKey.substring(0, 5) + '...');
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        console.log('Response:', result.response.text());
    } catch (error) {
        console.error('Gemini Error:', error.message);
        if (error.message.includes('429')) {
            console.log('Suggestion: You are hitting rate limits. If you are on the free tier, wait a minute or upgrade.');
        } else if (error.message.includes('400')) {
            console.log('Suggestion: The model name might be incorrect or the request is malformed.');
        } else if (error.message.includes('API key not valid')) {
            console.log('Suggestion: Your API key is invalid.');
        }
    }
}

testGemini();
