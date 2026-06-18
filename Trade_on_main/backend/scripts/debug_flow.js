const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const TradeRecord = require('../models/TradeRecord');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const commodity = 'Wheat pellets';
  const records = await TradeRecord.find({ commodity: { $regex: new RegExp(commodity, 'i') } });
  
  records.forEach(r => {
    console.log(`${r.country_or_area} - ${r.flow} - ${r.trade_usd}`);
  });
  process.exit(0);
}
test();
