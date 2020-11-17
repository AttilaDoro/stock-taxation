const axios = require('axios');
const { parseString } = require('xml2js');
const { promisify } = require('util');

const getMnbKozepArfolyamByDate = async (date) => {
  try {
    const { data } = await axios.get(`http://api.napiarfolyam.hu/?valuta=usd&valutanem=deviza&datum=${date}`);
    const parse = promisify(parseString);
    const { arfolyamok = {} } = await parse(data);
    const { deviza = [] } = arfolyamok;
    const { item = [] } = deviza[0] || {};
    const { kozep = [] } = item.find(({ bank }) => bank[0] === 'mnb');
    const arfolyamObj = {};
    arfolyamObj[date] = kozep[0];
    return arfolyamObj;
  } catch (error) {
    console.error('api call error', error);
  }
};

const getMnbKozepArfolyamByDates = (dates) => {
  const datePromises = dates.map(getMnbKozepArfolyamByDate);
  return Promise.all(datePromises);
};

module.exports = { getMnbKozepArfolyamByDates };
