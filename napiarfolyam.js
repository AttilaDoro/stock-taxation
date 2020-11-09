const axios = require('axios');
const { parseString } = require('xml2js');
const { promisify } = require('util');

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

module.exports = { getMnbKozepArfolyamByDate };
