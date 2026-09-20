const express = require('express');
const TradeRecord = require('../models/TradeRecord');
const MatchHistory = require('../models/MatchHistory');
const authenticateToken = require('../middlewares/authMiddleware');
const { callAI } = require('../services/aiService');

const router = express.Router();

// API: Get initial data (commodities, countries) - Public
router.get('/metadata', async (req, res, next) => {
  try {
    const countries = await TradeRecord.distinct('country_or_area');
    const commodities = await TradeRecord.distinct('commodity');
    res.json({ countries, commodities });
  } catch (error) {
    next(error);
  }
});

// API: Matchmaking using MongoDB Aggregation
router.post('/match', authenticateToken, async (req, res, next) => {
  const { country, commodity, flow } = req.body;
  if (!country || !commodity || !flow) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const targetFlow = flow === 'Export' ? 'Import' : 'Export';

  try {
    // 1. Group by country to calculate features using MongoDB aggregation (Optimized)
    const pipeline = [
      {
        $match: {
          commodity: { $regex: new RegExp(commodity, 'i') },
          country_or_area: { $ne: country }
        }
      },
      {
        $group: {
          _id: '$country_or_area',
          imports: { $sum: { $cond: [{ $eq: ['$flow', 'Import'] }, '$trade_usd', 0] } },
          exports: { $sum: { $cond: [{ $eq: ['$flow', 'Export'] }, '$trade_usd', 0] } }
        }
      }
    ];

    const countryStats = await TradeRecord.aggregate(pipeline);

    // 2. Calculate Scores for potential partners
    let recommendations = countryStats.map((stats) => {
      const name = stats._id;
      const demandGap = stats.imports - stats.exports;
      const importRatio = stats.imports / (stats.exports + 1);
      const dependency = demandGap / (stats.imports + 1);

      let compatibility = 0;
      if (flow === 'Export') {
        // We want buyers (High Imports)
        if (stats.imports === 0) return null;
        compatibility = (importRatio > 1 ? 50 : 20) + (dependency > 0 ? 30 : 10) + (Math.min(20, (stats.imports / 1e7)));
      } else {
        // We want suppliers (High Exports)
        if (stats.exports === 0) return null;
        const supplyGap = stats.exports - stats.imports;
        compatibility = (stats.exports > stats.imports ? 50 : 20) + (Math.min(50, (stats.exports / 1e7)));
      }

      // Cap at 99%
      const finalScore = Math.min(99, Math.max(60, Math.round(compatibility)));

      return {
        target_country: name,
        commodity,
        flow: targetFlow,
        score: stats.imports || stats.exports,
        compatibility: finalScore,
        metrics: {
          productMatch: `${finalScore}%`,
          locationBias: `${Math.floor(Math.random() * 20) + 70}%`, // Mocked
          volumeScore: `${Math.min(100, Math.round(((flow === 'Export' ? stats.imports : stats.exports) / 1e8) * 100))}/100`
        }
      };
    }).filter(rec => rec !== null);

    // 3. Adaptive Learning: Boost based on past likes
    const pastLikes = await MatchHistory.find({ userId: req.user.userId, status: 'liked' });
    const likedCountries = pastLikes.map(h => h.target_country);

    recommendations.forEach(rec => {
      if (likedCountries.includes(rec.target_country)) {
        rec.compatibility = Math.min(99, rec.compatibility + 5);
        rec.metrics.productMatch = `${rec.compatibility}%`;
      }
    });

    // Sort by compatibility
    recommendations.sort((a, b) => b.compatibility - a.compatibility);

    res.json(recommendations.slice(0, 10));
  } catch (error) {
    next(error);
  }
});

// API: Rank countries for a commodity
router.post('/rank', authenticateToken, async (req, res, next) => {
  const { commodity, flow } = req.body;
  if (!commodity || !flow) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const targetFlow = flow === 'Export' ? 'Import' : 'Export';

  try {
    const topCountries = await TradeRecord.aggregate([
      { $match: { commodity: commodity, flow: targetFlow } },
      { $group: { _id: '$country_or_area', totalTradeUsd: { $sum: '$trade_usd' } } },
      { $sort: { totalTradeUsd: -1 } },
      { $limit: 5 }
    ]);

    const countryDataList = topCountries.map((c, i) => `${i + 1}. ${c._id} ($${(c.totalTradeUsd / 1e6).toFixed(1)}M)`).join(', ');

    const prompt = `Act as a quirky, genius global trade strategist. The user is from a specific country and wants to ${flow} "${commodity}". 
    Based on our database, the top countries that ${targetFlow} this commodity are: ${countryDataList}.
    Write a highly creative, engaging, and readable 3-sentence guide. Tell them EXACTLY who they should export/import to from this list, why it's a golden opportunity, and make it sound like an insider secret to help them easily decide!`;

    const result = await callAI(prompt);
    res.json({ ranking: result, topCountries });
  } catch (error) {
    next(error);
  }
});

// API: On-demand AI Analysis for a specific Swipe Card
router.post('/analyze-card', authenticateToken, async (req, res, next) => {
  const { user_country, target_country, commodity, flow, score } = req.body;
  if (!target_country || !commodity || !flow) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const prompt = `You are an AI Trade Advisor. A user from ${user_country || 'a country'} wants to ${flow} "${commodity}". 
    They are considering ${target_country}, which has a historical trade volume of $${score} for this. 
    Explain why this is a good match using this EXACT format:
    
    👉 WHY this buyer is suggested:
    - [Reason 1 relating to product demand]
    - [Reason 2 relating to trade volume or location]`;

    const result = await callAI(prompt);
    res.json({ analysis: result });
  } catch (error) {
    next(error);
  }
});

// API: Record a Swipe and generate XAI
router.post('/swipe', authenticateToken, async (req, res, next) => {
  const { user_country, target_country, commodity, flow, score, status } = req.body;

  if (!user_country || !target_country || !commodity || !status) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    let xai_reason = "User did not show interest.";

    if (status === 'liked') {
      const prompt = `You are an Explainable AI for a global trade matchmaking system. 
      A user from ${user_country} who wants to ${flow} ${commodity} just matched with ${target_country}.
      The historical trade volume for ${target_country} regarding this commodity is $${score}.
      Write a 2-sentence explanation of why this is a strong match, sounding professional and data-driven.`;

      xai_reason = await callAI(prompt);
    }

    const match = new MatchHistory({
      userId: req.user.userId,
      user_country,
      target_country,
      commodity,
      flow,
      score,
      xai_reason,
      status
    });

    await match.save();
    res.json(match);
  } catch (error) {
    next(error);
  }
});

// API: Get Match History with XAI (with pagination)
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await MatchHistory.find({ userId: req.user.userId, status: 'liked' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
      
    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
