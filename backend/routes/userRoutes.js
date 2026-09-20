const express = require('express');
const User = require('../models/User');
const MatchHistory = require('../models/MatchHistory');
const OutreachMessage = require('../models/OutreachMessage');
const authenticateToken = require('../middlewares/authMiddleware');
const { callAI } = require('../services/aiService');

const router = express.Router();

// Middleware applied explicitly to each route

// API: Update Onboarding Data
router.post('/onboarding', authenticateToken, async (req, res, next) => {
  const { country, commodity, flow } = req.body;
  
  if (!country || !commodity || !flow) {
    return res.status(400).json({ error: 'Country, commodity, and flow are required' });
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.userId, { country, commodity, flow }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// API: Analyze User Portfolio
router.get('/analyze-portfolio', authenticateToken, async (req, res, next) => {
  try {
    const history = await MatchHistory.find({ userId: req.user.userId, status: 'liked' });
    if (history.length === 0) {
      return res.json({ analysis: "You don't have any saved matches yet to analyze." });
    }

    const summary = history.map(h => `${h.flow} ${h.commodity} with ${h.target_country}`).join(', ');
    const prompt = `You are an AI Portfolio Strategist. The user has agreed to the following trade deals: ${summary}.
    Write a cohesive, 3-sentence executive summary of their overall global trade portfolio. What is their strategic focus, and are they well-diversified?`;

    const result = await callAI(prompt);
    res.json({ analysis: result });
  } catch (error) {
    next(error);
  }
});

// API: Detailed Stats for Dashboard
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [history, messages] = await Promise.all([
      MatchHistory.find({ userId }),
      OutreachMessage.find({ userId })
    ]);

    const rightSwipes = history.filter(h => h.status === 'liked').length;
    const leftSwipes = history.filter(h => h.status === 'disliked').length;
    const totalViewed = history.length;

    const regions = history.filter(h => h.status === 'liked').reduce((acc, h) => {
      acc[h.target_country] = (acc[h.target_country] || 0) + 1;
      return acc;
    }, {});

    const topRegions = Object.entries(regions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalViewed,
      rightSwipes,
      leftSwipes,
      ratio: totalViewed > 0 ? Math.round((rightSwipes / totalViewed) * 100) : 0,
      outreachCount: messages.length,
      topRegions
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
