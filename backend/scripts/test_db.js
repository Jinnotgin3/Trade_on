const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const TradeRecord = require('./models/TradeRecord');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await TradeRecord.countDocuments();
  console.log('Count:', count);
  const countries = await TradeRecord.distinct('country_or_area');
  console.log('Countries:', countries.length);
  process.exit(0);
}
test();
