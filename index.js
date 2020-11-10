const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDate } = require('./napiarfolyam');

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

// getMnbKozepArfolyamByDate('20201030').then((mnbKozepArfolyam) => console.log(mnbKozepArfolyam));
Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    // const majom = getBuyActivitiesThatWereSoldLater(activitiesFromRevolut, true);
    const kutya = getBuyActivitiesThatWereSoldLater(activitiesFromTrading212, false);
    console.log(JSON.stringify(kutya, null, 2));
  })
  .catch((error) => console.error(error));
