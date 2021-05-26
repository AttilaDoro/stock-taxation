const fs = require('fs');
const pdf = require('pdf-parse');
const moment = require('moment');
const BigNumber = require('bignumber.js');
const { promisify } = require('util');
const { getAmount } = require('./utils');
 
const getAllFiles = () => {
  const filenames = fs.readdirSync('./revolut'); 
  const readFile = promisify(fs.readFile);
  const filesPromises = filenames.map(file => readFile(`./revolut/${file}`));
  return Promise.all(filesPromises);
};

const getSymbol = (row, activityType) => {
  const indexStart = 23 + activityType.length;
  const remainder = row.substring(indexStart);
  const [symbol] = remainder.split(' - ');
  return symbol;
};

const isValidNum = (number) => {
  const bigNum = new BigNumber(number);
  return !bigNum.isNaN();
};

const getAmountFromString = (row) => {
  const chunks = row.split('(');
  const lastChunk = chunks[chunks.length - 1];
  const [amount] = lastChunk.split(')');

  if (isValidNum(amount)) return amount;

  throw new Error('INVALID AMOUNT (revolut)');
};

const getPriceAndQuantityWithMagic = (row) => {
  const amount = getAmountFromString(row);
  const [firstChunk = ''] = row.split('(');
  const chunks = firstChunk.split(' ');
  const lastChunk = chunks[chunks.length - 1];
  const numbersFromString = [...lastChunk].filter(character => !isNaN(parseInt(character, 10)) || character === '.');
  let price = '';
  let quantity = '';

  numbersFromString.reduce((numSoFar, currentNum, index) => {
    const numbersString = numbersFromString.slice(index).join('');
    const numSoFarBigNum = new BigNumber(numSoFar);
    if (numSoFarBigNum.multipliedBy(numbersString).isEqualTo(amount)) {
      price = numSoFar;
      quantity = numbersString;
    }
    return `${numSoFar}${currentNum}`;
  }, '');

  return { price, quantity };
};

const getQuantity = (row) => {
  const [firstChunk = ''] = row.split(' at ');
  const chunks = firstChunk.split(' ');
  const quantity = chunks[chunks.length - 1];
  
  if (isValidNum(quantity)) return quantity;

  const { quantity: newQuantity } = getPriceAndQuantityWithMagic(row);
  if (isValidNum(newQuantity)) return newQuantity;

  throw new Error('INVALID QUANTITY (revolut)');
};

const getPrice = (row) => {
  const [, secondChunk = ''] = row.split(' at ');
  const chunks = secondChunk.split(' ');
  const price = chunks[0];

  if (isValidNum(price)) return price;
  
  const { price: newPrice } = getPriceAndQuantityWithMagic(row);
  if (isValidNum(newPrice)) return newPrice;
  
  throw new Error('INVALID PRICE (revolut)');
};

const getActivities = async (dataBuffer) => {
  try {
    const { text = '' } = await pdf(dataBuffer) || {};
    const activityRows = text.split('\n');
    const activities = activityRows
      .filter(row => row.includes('BUY') || row.includes('SELL'))
      .map((row, index) => {
        const tradeDate = moment(row.substring(0, 10), 'MM/DD/YYYY').format('YYYY-MM-DD');
        const currency = row.substring(20, 23);
        const activityType = row.includes('BUY') ? 'BUY' : 'SELL';
        const symbol = getSymbol(row, activityType);
        const quantity = getQuantity(row);
        const price = getPrice(row);
        const amount = getAmount(activityType, quantity, price);
        return { tradeDate, currency, activityType, symbol, quantity, price, amount, isRevolut: true, id: index + 1 };
      });
    return activities;
  } catch (error) {
    console.error('getActivities error', error);
  }
};

const getActivitiesFromRevolut = async () => {
  try {
    const dataBuffers = await getAllFiles();
    const allActivities = await Promise.all(dataBuffers.map(getActivities));
    return allActivities.flat();
  } catch (error) {
    console.error('getActivitiesFromRevolut error', error);
  }
};

module.exports = { getActivitiesFromRevolut };
