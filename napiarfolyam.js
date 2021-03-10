const axios = require('axios');
const moment = require('moment');
const { parseString } = require('xml2js');
const { promisify } = require('util');

const getMnbKozepArfolyamByDate = async (date) => {
  try {
    const { data } = await axios.get(`http://api.napiarfolyam.hu/?valuta=usd&valutanem=deviza&datum=${date}`);
    const parse = promisify(parseString);
    const { arfolyamok = {} } = await parse(data);
    const { deviza = [] } = arfolyamok;
    const { item = [] } = deviza[0] || {};
    const mnb = item.find(({ bank }) => bank[0] === 'mnb');
    if (!mnb) {
      const newDate = moment(date).subtract(1, 'day').format('YYYYMMDD');
      const result = await getMnbKozepArfolyamByDate(newDate);
      const newArfolyamObj = {};
      newArfolyamObj[date] = result[newDate];
      return newArfolyamObj;
    }
    const { kozep = [] } = mnb;
    const arfolyamObj = {};
    arfolyamObj[date] = kozep[0];
    return arfolyamObj;
  } catch (error) {
    console.error('api call error', error);
  }
};

const getMnbKozepArfolyamByDates = async (dates) => {
  const datePromises = dates.map(getMnbKozepArfolyamByDate);
  try {
    const exchangeRates = await Promise.all(datePromises);
    return exchangeRates.reduce((accumulator, currentExchangeRate) => ({ ...accumulator, ...currentExchangeRate }), {});
  } catch (error) {
    console.error('getMnbKozepArfolyamByDates error', error);
  }
};

module.exports = { getMnbKozepArfolyamByDates };
