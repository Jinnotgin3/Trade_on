const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_country: { type: String, required: true },
  target_country: { type: String, required: true },
  commodity: { type: String, required: true },
  flow: { type: String, required: true },
  score: { type: Number, required: true },
  xai_reason: { type: String, required: true },
  status: { type: String, enum: ['liked', 'disliked', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
