const moment = require('moment');
const BigNumber = require('bignumber.js');

const getAmount = (activityType, quantityString, priceString) => {
  const quantity = new BigNumber(quantityString);
  const price = new BigNumber(priceString);
  const amount = quantity.multipliedBy(price).toNumber();
  if (activityType === 'BUY') return amount;
  const amountBigN = new BigNumber(amount);
  return amountBigN.multipliedBy('-1').toNumber();
};

const getActivitiesByActivityType = (activities, type) => activities.filter(({ activityType }) => activityType === type);
const getActivitiesBySymbol = (activities, givenSymbol) => activities.filter(({ symbol }) => symbol === givenSymbol);

const sortByDate = ({ tradeDate: tradeDateA }, { tradeDate: tradeDateB }) => {
  if (moment(tradeDateA).isBefore(tradeDateB)) return -1;
  if (moment(tradeDateB).isBefore(tradeDateA)) return 1;
  return 0;
};

const getBuyActivitiesThatWereSoldLater = (activities) => {
  const soldActivities = getActivitiesByActivityType(activities, 'SELL');
  const boughtActivities = getActivitiesByActivityType(activities, 'BUY');
  const buyActivitiesThatWereSoldLater = soldActivities.reduce((finalActivitiesObject, currentSoldActivity) => {
    const { id, symbol } = currentSoldActivity;
    const boughtActivitiesFilteredBySymbol = getActivitiesBySymbol(boughtActivities, symbol);

    const finalActivitiesObjectCopy = { ...finalActivitiesObject };

    if (!finalActivitiesObjectCopy[symbol]) finalActivitiesObjectCopy[symbol] = {};
    if (!finalActivitiesObjectCopy[symbol].buy) finalActivitiesObjectCopy[symbol].buy = boughtActivitiesFilteredBySymbol;
    if (!finalActivitiesObjectCopy[symbol].sell) finalActivitiesObjectCopy[symbol].sell = [currentSoldActivity];
    if (!finalActivitiesObjectCopy[symbol].sell.find((activity) => activity.id === id)) finalActivitiesObjectCopy[symbol].sell.push(currentSoldActivity);

    return finalActivitiesObjectCopy;
  }, {});

  Object.entries(buyActivitiesThatWereSoldLater).forEach(([symbol, data]) => {
    data.buy.sort(sortByDate);
    data.sell.sort(sortByDate);
  });

  return buyActivitiesThatWereSoldLater;
};

const mapActivityDate = ({ tradeDate }) => moment(tradeDate, 'YYYY-MM-DD').format('YYYYMMDD');

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

const getAllActivityDates = (soldActivities) => {
  const dates = getActivityDates(soldActivities);
  return [...new Set([...dates])].sort();
};

const getActivityPriceInHUF = (price, activityDate, quantity, exchangeRates) => {
  const currentPrice = new BigNumber(price);
  const tradeDate = moment(activityDate, 'YYYY-MM-DD').format('YYYYMMDD');
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
    if (accumulator.lastIndexToKeep !== -1) return accumulator;
    const quantitySoFar = new BigNumber(accumulator.quantity);
    const quantitySum = quantitySoFar.plus(quantity);
    const newQuantity = quantitySoFar.plus(quantity).toNumber();
    if (quantitySum.isLessThan(soldQuantity)) return { quantity: newQuantity, lastIndexToKeep: -1 };
    return { quantity: newQuantity, lastIndexToKeep: index };
  }, { quantity: 0, lastIndexToKeep: -1 });
  return lastIndexToKeep === -1 ? buy.length - 1 : lastIndexToKeep;
};

const getBoughtPriceInHUF = (buy, lastIndexToKeep, soldQuantity, exchangeRates) => {
  const importantBuys = buy.slice(0, lastIndexToKeep + 1);
  const { priceInHUF: boughtPriceInHUF } = importantBuys.reduce((accumulator, currentActivity, index) => {
    if (index < lastIndexToKeep) {
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
  { quantity: 0, priceInHUF: 0 }
);

const getActivityPerformanceData = (soldActivities, exchangeRates) => {
  const symbols = Object.keys(soldActivities);
  return symbols.map((symbol) => {
    const { buy, sell } = soldActivities[symbol];
    const { quantity: soldQuantity, priceInHUF: soldPriceInHUF } = getSoldQuantityAndSoldPriceInHUF(sell, exchangeRates);
    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const returnObj = {};
    const soldPrice = new BigNumber(soldPriceInHUF);
    returnObj[symbol] = { soldPriceInHUF, boughtPriceInHUF, difference: soldPrice.minus(boughtPriceInHUF).toNumber() };
    return returnObj;
  });
};

const getAllPerformanceData = activityPerformanceData => activityPerformanceData.reduce((accumulator, current) => {
  const [symbol] = Object.keys(current);
  const newObj = { ...accumulator };
  newObj[symbol] = current[symbol];
  return newObj;
}, {});

const getTaxAmount = (performanceData) => {
  const symbols = Object.keys(performanceData);
  const finalPerformance = symbols.reduce((accumulator, currentSymbol) => {
    const { difference } = performanceData[currentSymbol];
    const acc = new BigNumber(accumulator);
    return acc.plus(difference).toNumber();
  }, 0);
  if (finalPerformance <= 0) return 0;
  const performance = new BigNumber(finalPerformance);
  return performance.multipliedBy(0.15).toNumber();
};


module.exports = {
  getAmount,
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getAllPerformanceData,
  getActivityPerformanceData,
  getTaxAmount,
  getActivityPriceInHUF,
  getPriceInHUFAndQuantity,
  getBoughtPriceInHUF,
  getLastIndexToKeep,
  getSoldQuantityAndSoldPriceInHUF,
};
