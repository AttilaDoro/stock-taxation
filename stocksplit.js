const axios = require('axios');
const moment = require('moment');
const BigNumber = require('bignumber.js');

const getStockSplits = async (soldActivities, date) => {
  try {
    const firstDate = moment(date, 'YYYYMMDD').format('YYYY-MM-DD');
    const { data = {} } = await axios.get(`https://api.nasdaq.com/api/calendar/splits?date=${firstDate}`);
    const { data: splitData = {} } = data;
    const { rows = [] } = splitData;
    const symbols = Object.keys(soldActivities);
    const splittedStocks = rows
      .filter(({ symbol, executionDate }) => symbols.includes(symbol) && moment(executionDate, 'MM/DD/YYYY').isBefore(moment()))
      .map(({ symbol, ratio, executionDate }) => {
        const [num1 = 1, num2 = 1] = ratio.split(' : ');
        const firstNum = new BigNumber(num1);
        return {
          symbol,
          ratio: firstNum.dividedBy(num2).toNumber(),
          date: moment(executionDate, 'MM/DD/YYYY').format('YYYY-MM-DD'),
        };
      })
      .reduce((accumulator, currentSplit) => {
        const { symbol } = currentSplit;
        if (!accumulator[symbol]) accumulator[symbol] = [];
        accumulator[symbol].push({ ...currentSplit });
        return { ...accumulator };
      }, {});
    return splittedStocks;
  } catch (error) {
    console.error('api call error', error);
  }
};

module.exports = { getStockSplits };
