const moment = require('moment');

const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDates } = require('./napiarfolyam');

const getRevolutActivitiesByActivityType = (activitiesFromRevolut, type) => activitiesFromRevolut.filter(({ activityType }) => activityType === type);
const getTrading212ActivitiesByDirection = (activitiesFromTrading212, givenDirection) => activitiesFromTrading212.filter(({ direction }) => direction === givenDirection);
const getActivitiesBySymbol = (activities, givenSymbol) => activities.filter(({ symbol }) => symbol === givenSymbol);

const getBuyActivitiesThatWereSoldLater = (activities, isRevolut) => {
  const soldActivities = !isRevolut ? getTrading212ActivitiesByDirection(activities, 'Sell') : getRevolutActivitiesByActivityType(activities, 'SELL');
  const boughtActivities = !isRevolut ? getTrading212ActivitiesByDirection(activities, 'Buy') : getRevolutActivitiesByActivityType(activities, 'BUY');
  return soldActivities.reduce((finalActivitiesObject, currentSoldActivity) => {
    const { id, symbol } = currentSoldActivity;
    const boughtActivitiesFilteredBySymbol = getActivitiesBySymbol(boughtActivities, symbol);

    const finalActivitiesObjectCopy = { ...finalActivitiesObject };

    if (!finalActivitiesObjectCopy[symbol]) finalActivitiesObjectCopy[symbol] = {};
    if (!finalActivitiesObjectCopy[symbol].buy) finalActivitiesObjectCopy[symbol].buy = boughtActivitiesFilteredBySymbol;
    if (!finalActivitiesObjectCopy[symbol].sell) finalActivitiesObjectCopy[symbol].sell = [currentSoldActivity];
    if (!finalActivitiesObjectCopy[symbol].sell.find((activity) => activity.id === id)) finalActivitiesObjectCopy[symbol].sell.push(currentSoldActivity);

    return finalActivitiesObjectCopy;
  }, {});
};

const mapActivityDate = ({ tradeDate, tradingDay }) => {
  if (tradeDate) return moment(tradeDate, 'MM/DD/YYYY').format('YYYYMMDD');
  return moment(tradingDay, 'DD-MM-YYYY').format('YYYYMMDD');
};

const getActivityDates = (activities) => {
  const symbols = Object.keys(activities);
  const allDates = symbols.map((symbol) => {
    const { buy, sell } = activities[symbol];
    const buyDates = buy.map(mapActivityDate);
    const sellDates = sell.map(mapActivityDate);
    return [...buyDates, ...sellDates];
  });
  return [...new Set(allDates.flat())];
};

const getAllActivityDates = (soldRevolutActivities, soldTrading212Activities) => {
  const revolutDates = getActivityDates(soldRevolutActivities);
  const trading212Dates = getActivityDates(soldTrading212Activities);
  return [...new Set([...revolutDates, ...trading212Dates])].sort();
};

Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const soldRevolutActivities = getBuyActivitiesThatWereSoldLater(activitiesFromRevolut, true);
    const soldTrading212Activities = getBuyActivitiesThatWereSoldLater(activitiesFromTrading212, false);
    const activityDates = getAllActivityDates(soldRevolutActivities, soldTrading212Activities);
    getMnbKozepArfolyamByDates(activityDates).then((exchangeRates) => {
      console.log(exchangeRates);
    });
    // console.log(JSON.stringify(soldRevolutActivities, null, 2));
    // console.log(JSON.stringify(soldTrading212Activities, null, 2));
  })
  .catch((error) => console.error(error));
