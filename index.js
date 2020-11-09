/* const fs = require('fs');
const pdf = require('pdf-parse');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const { parseString } = require('xml2js');
const { promisify } = require('util');
 
const dataBuffer = fs.readFileSync('./2020-09.pdf');

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

const getAmount = (activityType, quantityString, priceString) => {
  const quantity = new BigNumber(quantityString);
  const price = new BigNumber(priceString);
  const amount = quantity.multipliedBy(price).toNumber();
  if (activityType === 'BUY') return amount;
  const amountBigN = new BigNumber(amount);
  return amountBigN.multipliedBy('-1').toNumber();
};

const getActivities = async () => {
  try {
    const data = await pdf(dataBuffer);
    const activityTable = data.text.split('ACTIVITY');
    const activityRows = activityTable[1].split('\n');
    const activities = activityRows
      .filter(row => row.includes('BUY') || row.includes('SELL'))
      .map((row) => {
        const tradeDate = row.substring(0,10);
        const settleDate = row.substring(10,20);
        const currency = row.substring(20,23);
        const activityType = row.includes('BUY') ? 'BUY' : 'SELL';
        const symbol = getSymbol(row, activityType);
        const quantity = getQuantity(row);
        const price = getPrice(row);
        const amount = getAmount(activityType, quantity, price);
        return { tradeDate, settleDate, currency, activityType, symbol, quantity, price, amount };
      });
    return activities;
  } catch (error) {
    console.error('PDF error', error);
  }
};

const getMnbKozepArfolyamByDate = async (date) => {
  try {
    const response = await axios.get(`http://api.napiarfolyam.hu/?valuta=usd&valutanem=deviza&datum=${date}`);
    const parse = promisify(parseString);
    const { arfolyamok = {} } = await parse(response.data);
    const { deviza = [] } = arfolyamok;
    const { item = [] } = deviza[0] || {};
    const { kozep = [] } = item.find(({ bank }) => bank[0] === 'mnb');
    return kozep[0];
  } catch (error) {
    console.error('api call error', error);
  }
};

getMnbKozepArfolyamByDate('20201030').then((mnbKozepArfolyam) => {
  console.log(mnbKozepArfolyam)
});

getActivities().then(activities => console.log(activities));
 */



















