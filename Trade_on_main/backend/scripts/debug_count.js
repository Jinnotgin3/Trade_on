const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const TradeRecord = require('../models/TradeRecord');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const commodity = 'Wheat pellets';
  const records = await TradeRecord.find({ commodity: { $regex: new RegExp(commodity, 'i') } });
  
  const countries = [...new Set(records.map(r => r.country_or_area))];
  console.log('Countries trading', commodity, ':', countries);
  process.exit(0);
}
test();
