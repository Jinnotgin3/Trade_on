const mongoose = require('mongoose');
const xlsx = require('xlsx');
require('dotenv').config({ path: '../.env' });
const TradeRecord = require('../models/TradeRecord');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    console.log('Reading Excel file...');
    const workbook = xlsx.readFile('../../commodity_trade_statistics_final.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse the data
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // The first row might be empty or wrong headers, let's look for "country_or_area"
    let headerRowIdx = 0;
    for (let i=0; i<rawData.length; i++) {
        if (rawData[i][0] === 'country_or_area') {
            headerRowIdx = i;
            break;
        }
    }

    const recordsToInsert = [];
    for (let i = headerRowIdx + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length < 5) continue;

      const trade_usd = Number(row[4]);
      const year = Number(row[1]);

      if (!isNaN(trade_usd) && !isNaN(year)) {
        recordsToInsert.push({
          country_or_area: String(row[0]),
          year: year,
          commodity: String(row[2]),
          flow: String(row[3]),
          trade_usd: trade_usd
        });
      }
    }

    console.log(`Parsed ${recordsToInsert.length} valid records. Clearing existing TradeRecords...`);
    await TradeRecord.deleteMany({});
    
    console.log('Inserting into MongoDB...');
    const result = await TradeRecord.insertMany(recordsToInsert);
    console.log(`Successfully inserted ${result.length} records.`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
