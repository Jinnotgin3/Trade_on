const express = require('express');
const OutreachMessage = require('../models/OutreachMessage');
const authenticateToken = require('../middlewares/authMiddleware');
const { callAI } = require('../services/aiService');

const router = express.Router();

// API: Generate Outreach Email
router.post('/generate-outreach', authenticateToken, async (req, res, next) => {
  const { target_country, commodity, flow, score, tone } = req.body;
  
  if (!target_country || !commodity || !flow || score === undefined) {
    return res.status(400).json({ error: 'Missing parameters (target_country, commodity, flow, score)' });
  }

  try {
    const toneInstruction = tone ? `Tone of the email should be ${tone}.` : 'Tone should be Formal.';
    const prompt = `You are a high-level B2B trade negotiator. A user wants to ${flow} the commodity "${commodity}" to a prime partner in ${target_country}.
    The trade potential is estimated at $${score.toLocaleString()}.
    
    Task: Write a high-converting, personalized outreach email.
    
    Tone Requirements: ${tone || 'Formal'}
    - If Formal: Use professional, respectful language, emphasizing reliability and long-term partnership.
    - If Friendly: Use a warm, approachable tone, focusing on mutual growth and a shared passion for the industry.
    - If Direct: Be concise, data-driven, and focus on the immediate ROI and trade volumes.
    
    Email Structure:
    1. A punchy, relevant subject line mentioning "${commodity}" and "${target_country}".
    2. A greeting.
    3. A hook mentioning the specific trade opportunity for ${commodity}.
    4. A clear call to action.
    5. Signature as "[Your Name] | Swipe-to-Export AI Assisted Outreach".`;

    const result = await callAI(prompt);
    res.json({ email: result });
  } catch (error) {
    next(error);
  }
});

// API: Save Outreach Message
router.post('/send-outreach', authenticateToken, async (req, res, next) => {
  const { target_country, commodity, messageContent, tone } = req.body;

  if (!target_country || !commodity || !messageContent) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const message = new OutreachMessage({
      userId: req.user.userId,
      target_country,
      commodity,
      messageContent,
      tone
    });

    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
});

// API: Get Outreach Messages
router.get('/outreach-messages', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await OutreachMessage.find({ userId: req.user.userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
      
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
