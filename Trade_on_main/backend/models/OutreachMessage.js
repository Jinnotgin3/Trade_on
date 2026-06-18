const mongoose = require('mongoose');

const outreachMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_country: { type: String, required: true },
  commodity: { type: String, required: true },
  messageContent: { type: String, required: true },
  tone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OutreachMessage', outreachMessageSchema);
