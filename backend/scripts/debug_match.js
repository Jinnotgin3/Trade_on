const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const TradeRecord = require('../models/TradeRecord');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const commodity = 'wheat';
  const country = 'India';
  const flow = 'Export';
  const targetFlow = 'Import';
  const pipeline = [
    { $match: { commodity: { $regex: new RegExp(commodity, 'i') }, country_or_area: { $ne: country } } },
    { $group: { _id: '$country_or_area', imports: { $sum: { $cond: [{ $eq: ['$flow', 'Import'] }, '$trade_usd', 0] } }, exports: { $sum: { $cond: [{ $eq: ['$flow', 'Export'] }, '$trade_usd', 0] } } } }
  ];
  const countryStats = await TradeRecord.aggregate(pipeline);

  const recommendations = countryStats.map((stats) => {
      const name = stats._id;
      const demandGap = stats.imports - stats.exports;
      const importRatio = stats.imports / (stats.exports + 1);
      const dependency = demandGap / (stats.imports + 1);

      let compatibility = 0;
      if (flow === 'Export') {
        compatibility = (importRatio > 1 ? 50 : 20) + (dependency > 0 ? 30 : 10) + (Math.min(20, (stats.imports / 1e7)));
      } else {
        const supplyGap = stats.exports - stats.imports;
        compatibility = (stats.exports > stats.imports ? 50 : 20) + (Math.min(50, (stats.exports / 1e7)));
      }

      const finalScore = Math.min(99, Math.max(60, Math.round(compatibility)));

      return {
        target_country: name,
        commodity,
        flow: targetFlow,
        score: stats.imports || stats.exports,
        compatibility: finalScore,
      };
    });

  recommendations.sort((a, b) => b.compatibility - a.compatibility);
  console.log(recommendations);
  process.exit(0);
}
test();
