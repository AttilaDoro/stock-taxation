const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDate } = require('./napiarfolyam');

const getOnlySoldRevolutActivities = activitiesFromRevolut => activitiesFromRevolut.filter(({ activityType }) => activityType === 'SELL');
const getOnlyBoughtRevolutActivities = activitiesFromRevolut => activitiesFromRevolut.filter(({ activityType }) => activityType === 'BUY');

const getOnlySoldTrading212Activities = activitiesFromTrading212 => activitiesFromTrading212.filter(({ direction }) => direction === 'Sell');
const getOnlyBoughtTrading212Activities = activitiesFromTrading212 => activitiesFromTrading212.filter(({ direction }) => direction === 'Buy');

const getActivitiesBySymbol = (activities, givenSymbol) => activities.filter(({ symbol }) => symbol === givenSymbol);

const getRevolutBuyActivitiesThatWereSoldLater = (activitiesFromRevolut) => {
  const soldRevolutActivities = getOnlySoldRevolutActivities(activitiesFromRevolut);
  const boughtRevolutActivities = getOnlyBoughtRevolutActivities(activitiesFromRevolut);
  return soldRevolutActivities.reduce((finalActivitiesObject, currentSoldActivity) => {
    const { id, symbol } = currentSoldActivity;
    const boughtRevolutActivitiesFilteredBySymbol = getActivitiesBySymbol(boughtRevolutActivities, symbol);

    const finalActivitiesObjectCopy = { ...finalActivitiesObject };

    if (!finalActivitiesObjectCopy[symbol]) finalActivitiesObjectCopy[symbol] = {};
    if (!finalActivitiesObjectCopy[symbol].buy) finalActivitiesObjectCopy[symbol].buy = boughtRevolutActivitiesFilteredBySymbol;
    if (!finalActivitiesObjectCopy[symbol].sell) finalActivitiesObjectCopy[symbol].sell = [currentSoldActivity];
    if (!finalActivitiesObjectCopy[symbol].sell.find((activity) => activity.id === id)) finalActivitiesObjectCopy[symbol].sell.push(currentSoldActivity);

    return finalActivitiesObjectCopy;
  }, {});
};

const getTrading212BuyActivitiesThatWereSoldLater = (activitiesFromTrading212) => {
  const soldTrading212Activities = getOnlySoldTrading212Activities(activitiesFromTrading212);
  const boughtTrading212Activities = getOnlyBoughtTrading212Activities(activitiesFromTrading212);
  return soldTrading212Activities.reduce((finalActivitiesObject, currentSoldActivity) => {
    const { id, symbol } = currentSoldActivity;
    const boughtTrading212ActivitiesFilteredBySymbol = getActivitiesBySymbol(boughtTrading212Activities, symbol);

    const finalActivitiesObjectCopy = { ...finalActivitiesObject };

    if (!finalActivitiesObjectCopy[symbol]) finalActivitiesObjectCopy[symbol] = {};
    if (!finalActivitiesObjectCopy[symbol].buy) finalActivitiesObjectCopy[symbol].buy = boughtTrading212ActivitiesFilteredBySymbol;
    if (!finalActivitiesObjectCopy[symbol].sell) finalActivitiesObjectCopy[symbol].sell = [currentSoldActivity];
    if (!finalActivitiesObjectCopy[symbol].sell.find((activity) => activity.id === id)) finalActivitiesObjectCopy[symbol].sell.push(currentSoldActivity);

    return finalActivitiesObjectCopy;
  }, {});
};

// getMnbKozepArfolyamByDate('20201030').then((mnbKozepArfolyam) => console.log(mnbKozepArfolyam));
Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    // const majom = getRevolutBuyActivitiesThatWereSoldLater(activitiesFromRevolut);
    const kutya = getTrading212BuyActivitiesThatWereSoldLater(activitiesFromTrading212);
    console.log(JSON.stringify(kutya, null, 2));
  })
  .catch((error) => console.error(error));
