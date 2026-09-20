const mongoose = require('mongoose');

const tradeRecordSchema = new mongoose.Schema({
  country_or_area: { type: String, required: true },
  year: { type: Number, required: true },
  commodity: { type: String, required: true },
  flow: { type: String, required: true },
  trade_usd: { type: Number, required: true }
});

tradeRecordSchema.index({ country_or_area: 1, commodity: 1, flow: 1 });

module.exports = mongoose.model('TradeRecord', tradeRecordSchema);
