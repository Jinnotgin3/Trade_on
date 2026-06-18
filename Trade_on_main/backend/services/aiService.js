const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

// Lazy initialization to ensure env vars are loaded before using
const getModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("WARNING: GEMINI_API_KEY is not set.");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  }
  return model;
};

// Helper: Call AI with Retry Logic for 503 errors
const callAI = async (prompt, retries = 3, delay = 2000) => {
  const aiModel = getModel();
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await aiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      if (error.status === 503 && i < retries - 1) {
        console.log(`AI 503 Error (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

module.exports = {
  callAI,
};
