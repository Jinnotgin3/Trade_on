const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const TradeRecord = require('./models/TradeRecord');
const MatchHistory = require('./models/MatchHistory');
const OutreachMessage = require('./models/OutreachMessage');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'supersecret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper: Call AI with Retry Logic for 503 errors
const callAI = async (prompt, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
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

// API: Register User
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'supersecret', { expiresIn: '1h' });
    res.json({ token, username });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists or error' });
  }
});

// API: Login User
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, 'supersecret', { expiresIn: '1h' });
    res.json({ token, username, userId: user._id, country: user.country, commodity: user.commodity, flow: user.flow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Onboarding Data
app.post('/api/onboarding', authenticateToken, async (req, res) => {
  const { country, commodity, flow } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, { country, commodity, flow }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get initial data (commodities, countries)
app.get('/api/metadata', async (req, res) => {
  try {
    const countries = await TradeRecord.distinct('country_or_area');
    const commodities = await TradeRecord.distinct('commodity');
    console.log(`[Metadata] Found ${countries.length} countries and ${commodities.length} commodities`);
    res.json({ countries, commodities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Matchmaking using ML-inspired features from EDA
app.post('/api/match', authenticateToken, async (req, res) => {
  const { country, commodity, flow } = req.body;
  if (!country || !commodity || !flow) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const targetFlow = flow === 'Export' ? 'Import' : 'Export';

  try {
    // 1. Get all trade records for this commodity
    const commodityRecords = await TradeRecord.find({
      commodity: { $regex: new RegExp(commodity, 'i') },
      country_or_area: { $ne: country }
    });

    // 2. Group by country to calculate features (EDA inspired)
    const countryStats = {};
    commodityRecords.forEach(rec => {
      if (!countryStats[rec.country_or_area]) {
        countryStats[rec.country_or_area] = { imports: 0, exports: 0 };
      }
      if (rec.flow === 'Import') countryStats[rec.country_or_area].imports += rec.trade_usd;
      if (rec.flow === 'Export') countryStats[rec.country_or_area].exports += rec.trade_usd;
    });

    // 3. Calculate Scores for potential partners
    const recommendations = Object.entries(countryStats).map(([name, stats]) => {
      const demandGap = stats.imports - stats.exports;
      const importRatio = stats.imports / (stats.exports + 1);
      const dependency = demandGap / (stats.imports + 1);

      // Calculate a combined compatibility score (0-100)
      // Logic: Prefer countries with high demand (imports) and low competition (exports)
      let compatibility = 0;
      if (flow === 'Export') {
        // We want buyers (High Imports, Low Exports)
        compatibility = (importRatio > 1 ? 50 : 20) + (dependency > 0 ? 30 : 10) + (Math.min(20, (stats.imports / 1e7)));
      } else {
        // We want suppliers (High Exports, Low Imports)
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
          locationBias: `${Math.floor(Math.random() * 20) + 70}%`, // Mocked for now
          volumeScore: `${Math.min(100, Math.round((stats.imports / 1e8) * 100))}/100`
        }
      };
    });

    // 4. Adaptive Learning: Boost based on past likes
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
    console.error('Match error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Rank countries for a commodity (Need Help feature)
app.post('/api/rank', async (req, res) => {
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
    console.error('Rank error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: On-demand AI Analysis for a specific Swipe Card
app.post('/api/analyze-card', authenticateToken, async (req, res) => {
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
    console.error('Analyze-card error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Outreach Email
app.post('/api/generate-outreach', authenticateToken, async (req, res) => {
  const { target_country, commodity, flow, score, tone } = req.body;
  if (!target_country || !commodity || !flow) {
    return res.status(400).json({ error: 'Missing parameters' });
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
    console.error('Outreach error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Save Outreach Message
app.post('/api/send-outreach', authenticateToken, async (req, res) => {
  const { target_country, commodity, messageContent, tone } = req.body;

  if (!target_country || !commodity || !messageContent) {
    return res.status(400).json({ error: 'Missing parameters' });
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
    console.error('Save message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get Outreach Messages
app.get('/api/outreach-messages', authenticateToken, async (req, res) => {
  try {
    const messages = await OutreachMessage.find({ userId: req.user.userId }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Record a Swipe and generate XAI
app.post('/api/swipe', authenticateToken, async (req, res) => {
  const { user_country, target_country, commodity, flow, score, status } = req.body;

  if (!user_country || !target_country || !commodity || !status) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Generate XAI Reason using Gemini if the status is 'liked'
    let xai_reason = "User did not show interest.";

    if (status === 'liked') {
      const prompt = `You are an Explainable AI for a global trade matchmaking system. 
      A user from ${user_country} who wants to ${flow} ${commodity} just matched with ${target_country}.
      The historical trade volume for ${target_country} regarding this commodity is $${score}.
      Write a 2-sentence explanation of why this is a strong match, sounding professional and data-driven.`;

      const result = await callAI(prompt);
      xai_reason = result;
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
    console.error('Swipe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get Match History with XAI
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const history = await MatchHistory.find({ userId: req.user.userId, status: 'liked' }).sort('-createdAt');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Analyze User Portfolio
app.get('/api/analyze-portfolio', authenticateToken, async (req, res) => {
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
    console.error('Analyze-portfolio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Detailed Stats for Dashboard
app.get('/api/stats', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
