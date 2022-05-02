const fs = require('fs');
const moment = require('moment');
const csv = require('csv-parser');
const { getAmount } = require('./utils');

const mapHeaders = (isRevolut) => !isRevolut
  ? ({ header }) => {
    if (header === 'Action') return 'activityType';
    if (header === 'Time') return 'tradeDate';
    if (header === 'Ticker') return 'symbol';
    if (header === 'Currency (Price / share)') return 'currency';
    if (header === 'No. of shares') return 'quantity';
    if (header === 'Price / share') return 'price';
    return header;
  }
  : ({ header }) => {
    if (header === 'Date') return 'tradeDate';
    if (header === 'Ticker') return 'symbol';
    if (header === 'Type') return 'activityType';
    if (header === 'Currency') return 'currency';
    if (header === 'Quantity') return 'quantity';
    if (header === 'Price per share') return 'price';
    return header;
  };

const readCsv = (isRevolut, filename) => new Promise((resolve) => {
  const results = [];
  const path = !isRevolut ? `./trading212/${filename}` : './revolut/revolut.csv';
  fs.createReadStream(path)
    .pipe(csv({ mapHeaders: mapHeaders(isRevolut) }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      resolve(results);
    });
});

const getTransactions = async (isRevolut) => {
  if (!isRevolut) {
    const filenames = fs.readdirSync('./trading212');
    const filesPromises = filenames
      .filter(filename => filename.includes('.csv'))
      .map(filename => readCsv(isRevolut, filename));
    const allTrading212Transactions = await Promise.all(filesPromises);
    const trading212Transactions = allTrading212Transactions.flat();
    return trading212Transactions;
  }
  return readCsv(isRevolut);
};

const filterRevolutActivities = ({ activityType }) => activityType === 'BUY' || activityType === 'SELL';
const filterTrading212Activities = ({ activityType }) => activityType === 'Market buy' || activityType === 'Market sell';

const getActivityType = activityType => activityType.toLowerCase().includes('buy') ? 'BUY' : 'SELL';

const mapRevolutActivities = ({ activityType, tradeDate, symbol, currency, quantity, price }, index) => ({
  activityType,
  tradeDate: moment(tradeDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
  symbol,
  currency,
  quantity,
  price,
  amount: getAmount(activityType, quantity, price),
  isRevolut: true,
  id: index + 1,
})

const mapTrading212Activities = ({ activityType, tradeDate, symbol, currency, quantity, price }, index) => ({
  activityType: getActivityType(activityType),
  tradeDate: moment(tradeDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
  symbol,
  currency,
  quantity,
  price,
  amount: getAmount(getActivityType(activityType), quantity, price),
  isRevolut: false,
  id: index + 1,
})

const getActivitiesFromFile = async (isRevolut) => {
  try {
    const transactions = await getTransactions(isRevolut);
    return transactions
      .filter(!isRevolut ? filterTrading212Activities : filterRevolutActivities)
      .map(!isRevolut ? mapTrading212Activities : mapRevolutActivities);
  } catch (error) {
    console.error('getActivitiesFromFile error', error);
  }
};

module.exports = { getActivitiesFromFile };
