const fs = require('fs');
const moment = require('moment');
const csv = require('csv-parser');
const { getAmount } = require('./utils');

const readCsv = (path) => new Promise((resolve) => {
  const results = [];
  fs.createReadStream(`./trading212/${path}`)
    .pipe(csv({
      mapHeaders: ({ header, index }) => {
        if (header === 'Action') return 'activityType';
        if (header === 'Time') return 'tradeDate';
        if (header === 'Ticker') return 'symbol';
        if (header === 'Currency (Price / share)') return 'currency';
        if (header === 'No. of shares') return 'quantity';
        if (header === 'Price / share') return 'price';
        return header;
      }
    }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      resolve(results);
    });
});

const getActivitiesFromTrading212 = async () => {
  try {
    const filenames = fs.readdirSync('./trading212'); 
    const filesPromises = filenames.map(readCsv);
    const allTrading212Transactions = await Promise.all(filesPromises);
    const trading212Transactions = allTrading212Transactions.flat();
    return trading212Transactions.map(({ activityType, tradeDate, symbol, currency, quantity, price, amount }) => ({
      activityType: activityType.toLowerCase().includes('buy') ? 'BUY' : 'SELL',
      tradeDate: moment(tradeDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      symbol,
      currency,
      quantity,
      price,
      amount: getAmount(activityType, quantity, price),
      isRevolut: false,
    }));
  } catch (error) {
    console.error('getTrading212Data error', error);
  }
};

module.exports = { getActivitiesFromTrading212 };
