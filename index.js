const moment = require('moment');
const BigNumber = require('bignumber.js');

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

const getActivityPriceInHUF = (activityPrice, activityDate, quantity, exchangeRates) => {
  const currentPrice = new BigNumber(activityPrice);
  const tradeDate = moment(activityDate, 'MM/DD/YYYY').format('YYYYMMDD');
  return currentPrice.multipliedBy(exchangeRates[tradeDate]).multipliedBy(quantity);
};

const getSumPrice = (price, tradeDate, quantity, priceSoFarInHUF, exchangeRates) => {
  const currentPriceInHUF = getActivityPriceInHUF(price, tradeDate, quantity, exchangeRates);
  return currentPriceInHUF.plus(priceSoFarInHUF).toNumber();
};

const getSumQuantity = (quantity, quantitySoFar) => {
  const currentQuantity = new BigNumber(quantity);
  return currentQuantity.plus(quantitySoFar).toNumber();
};

const getPriceInHUFAndQuantity = (currentPrice, currentTradeDate, currentQuantity, priceInHUFSoFar, quantitySoFar, exchangeRates) => {
  const priceInHUF = getSumPrice(currentPrice, currentTradeDate, currentQuantity, priceInHUFSoFar, exchangeRates);
  const quantity = getSumQuantity(currentQuantity, quantitySoFar);
  return { quantity, priceInHUF };
};

const getLastIndexToKeep = (buy, soldQuantity) => {
  const { lastIndexToKeep } = buy.reduce((accumulator, { quantity }, index) => {
    const nextItem = buy[index + 1];
    if (!nextItem) return accumulator;
    const quantitySoFar = new BigNumber(accumulator.quantity);
    const quantitySum = quantitySoFar.plus(quantity).plus(nextItem.quantity);
    return { quantity: quantitySoFar.plus(quantity).toNumber(), lastIndexToKeep: quantitySum.isLessThanOrEqualTo(soldQuantity) ? index + 1 : accumulator.lastIndexToKeep };
  }, { quantity: 0, lastIndexToKeep: 0 });
  return lastIndexToKeep;
};

const getBoughtPriceInHUF = (buy, lastIndexToKeep, soldQuantity, exchangeRates) => {
  const importantBuys = buy.slice(0, lastIndexToKeep + 1);
  const { priceInHUF: boughtPriceInHUF } = importantBuys.reduce((accumulator, currentActivity, index) => {
    if (index < lastIndexToKeep || importantBuys.length === buy.length) {
      return getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradeDate, currentActivity.quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates);
    }
    const sold = new BigNumber(soldQuantity);
    const remainder = sold.minus(accumulator.quantity).toNumber();
    return getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradeDate, remainder, accumulator.priceInHUF, accumulator.quantity, exchangeRates);
  }, { quantity: 0, priceInHUF: 0 });
  return boughtPriceInHUF;
};

const getSoldQuantityAndSoldPriceInHUF = (sell, exchangeRates) => sell.reduce(
  (accumulator, { price, tradeDate, quantity }) => getPriceInHUFAndQuantity(price, tradeDate, quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates),
  { quantity: 0, priceInHUF: 0 });

const getDunno = (soldActivities, exchangeRates) =>  {
  const symbols = Object.keys(soldActivities);
  return symbols.map((symbol) => {
    const { buy, sell } = soldActivities[symbol];
    const { quantity: soldQuantity, priceInHUF: soldPriceInHUF } = getSoldQuantityAndSoldPriceInHUF(sell, exchangeRates);
    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const returnObj = {};
    returnObj[symbol] = { soldPriceInHUF, boughtPriceInHUF };
    return returnObj;
  });
};

Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const soldRevolutActivities = getBuyActivitiesThatWereSoldLater(activitiesFromRevolut, true);
    const soldTrading212Activities = getBuyActivitiesThatWereSoldLater(activitiesFromTrading212, false);
    const activityDates = getAllActivityDates(soldRevolutActivities, soldTrading212Activities);
    getMnbKozepArfolyamByDates(activityDates).then((exchangeRates) => {
      console.log(exchangeRates);
      const dunno = getDunno(soldRevolutActivities, exchangeRates);
      console.log(dunno);
    });
    console.log(JSON.stringify(soldRevolutActivities, null, 2));
    console.log(JSON.stringify(soldTrading212Activities, null, 2));
  })
  .catch((error) => console.error(error));
