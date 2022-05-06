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
  const path = !isRevolut ? `./trading212/${filename}` : `./revolut/${filename}`;
  fs.createReadStream(path)
    .pipe(csv({ mapHeaders: mapHeaders(isRevolut) }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      resolve(results);
    });
});

const getTransactions = async (isRevolut) => {
  const filenames = fs.readdirSync(!isRevolut ? './trading212' : './revolut');
  const filesPromises = filenames
    .filter(filename => filename.includes('.csv'))
    .map(filename => readCsv(isRevolut, filename));
  const allTransactions = await Promise.all(filesPromises);
  const transactions = allTransactions.flat();
  return transactions;
};

const filterRevolutActivities = ({ activityType }) => activityType.toLowerCase().includes('trade') || activityType.toLowerCase().includes('sell')
const filterTrading212Activities = ({ activityType }) => activityType.toLowerCase().includes('buy') || activityType.toLowerCase().includes('sell')

const getActivityType = (activityType, isRevolut) => {
  if (!isRevolut) return activityType.toLowerCase().includes('buy') ? 'BUY' : 'SELL';
  return activityType.toLowerCase().includes('trade') ? 'BUY' : 'SELL';
};

const mapRevolutActivities = ({ activityType, tradeDate, symbol, currency, quantity, price }, index) => ({
  activityType: getActivityType(activityType, true),
  tradeDate: moment(tradeDate).format('YYYY-MM-DD'),
  symbol,
  currency,
  quantity,
  price: price.substring(1),
  amount: getAmount(getActivityType(activityType, true), quantity, price.substring(1)),
  isRevolut: true,
  id: index + 1,
})

const mapTrading212Activities = ({ activityType, tradeDate, symbol, currency, quantity, price }, index) => ({
  activityType: getActivityType(activityType),
  tradeDate: moment(tradeDate).format('YYYY-MM-DD'),
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
