const fs = require('fs');
const pdf = require('pdf-parse');
const moment = require('moment');
const BigNumber = require('bignumber.js');
const { promisify } = require('util');
const { getAmount } = require('./common');
 
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

const getQuantity = (row) => {
  const [firstChunk = ''] = row.split(' at ');
  const chunks = firstChunk.split(' ');
  return chunks[chunks.length - 1];
};

const getPrice = (row) => {
  const [, secondChunk = ''] = row.split(' at ');
  const chunks = secondChunk.split(' ');
  return chunks[0];
};

const getActivities = async (dataBuffer) => {
  try {
    const { text = '' } = await pdf(dataBuffer) || {};
    const activityRows = text.split('\n');
    const activities = activityRows
      .filter(row => row.includes('BUY') || row.includes('SELL'))
      .map((row) => {
        const tradeDate = moment(row.substring(0,10), 'MM/DD/YYYY').format('YYYY-MM-DD');
        const currency = row.substring(20,23);
        const activityType = row.includes('BUY') ? 'BUY' : 'SELL';
        const symbol = getSymbol(row, activityType);
        const quantity = getQuantity(row);
        const price = getPrice(row);
        const amount = getAmount(activityType, quantity, price);
        return { tradeDate, currency, activityType, symbol, quantity, price, amount, isRevolut: true };
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
