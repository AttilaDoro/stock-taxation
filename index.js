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

const getActivityPriceInHUF = (activityPrice, activityDate, quantity, exchangeRates, isRevolut) => {
  const price = isRevolut ? activityPrice : activityPrice.split(' USD')[0];
  const currentPrice = new BigNumber(price);
  const tradeDate = moment(activityDate, isRevolut ? 'MM/DD/YYYY' : 'DD-MM-YYYY').format('YYYYMMDD');
  return currentPrice.multipliedBy(exchangeRates[tradeDate]).multipliedBy(quantity);
};

const getSumPrice = (price, tradeDate, quantity, priceSoFarInHUF, exchangeRates, isRevolut) => {
  const currentPriceInHUF = getActivityPriceInHUF(price, tradeDate, quantity, exchangeRates, isRevolut);
  return currentPriceInHUF.plus(priceSoFarInHUF).toNumber();
};

const getSumQuantity = (quantity, quantitySoFar) => {
  const currentQuantity = new BigNumber(quantity);
  return currentQuantity.plus(quantitySoFar).toNumber();
};

const getPriceInHUFAndQuantity = (currentPrice, currentTradeDate, currentQuantity, priceInHUFSoFar, quantitySoFar, exchangeRates, isRevolut) => {
  const priceInHUF = getSumPrice(currentPrice, currentTradeDate, currentQuantity, priceInHUFSoFar, exchangeRates, isRevolut);
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

const getBoughtPriceInHUF = (buy, lastIndexToKeep, soldQuantity, exchangeRates, isRevolut) => {
  const importantBuys = buy.slice(0, lastIndexToKeep + 1);
  const { priceInHUF: boughtPriceInHUF } = importantBuys.reduce((accumulator, currentActivity, index) => {
    if (index < lastIndexToKeep || importantBuys.length === buy.length) {
      return isRevolut
        ? getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradeDate, currentActivity.quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut)
        : getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradingDay, currentActivity.quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut);
    }
    const sold = new BigNumber(soldQuantity);
    const remainder = sold.minus(accumulator.quantity).toNumber();
    return isRevolut
      ? getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradeDate, remainder, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut)
      : getPriceInHUFAndQuantity(currentActivity.price, currentActivity.tradingDay, remainder, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut);
  }, { quantity: 0, priceInHUF: 0 });
  return boughtPriceInHUF;
};

const getSoldQuantityAndSoldPriceInHUF = (sell, exchangeRates, isRevolut) => {
  if (isRevolut) {
    return sell.reduce(
      (accumulator, { price, tradeDate, quantity }) => getPriceInHUFAndQuantity(price, tradeDate, quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut),
      { quantity: 0, priceInHUF: 0 });
  }
  return sell.reduce(
    (accumulator, { price, tradingDay, quantity }) => getPriceInHUFAndQuantity(price, tradingDay, quantity, accumulator.priceInHUF, accumulator.quantity, exchangeRates, isRevolut),
    { quantity: 0, priceInHUF: 0 });
};

const getActivityPerformanceData = (soldActivities, exchangeRates, isRevolut) => {
  const symbols = Object.keys(soldActivities);
  return symbols.map((symbol) => {
    const { buy, sell } = soldActivities[symbol];
    const { quantity: soldQuantity, priceInHUF: soldPriceInHUF } = getSoldQuantityAndSoldPriceInHUF(sell, exchangeRates, isRevolut);
    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates, isRevolut);
    const returnObj = {};
    const soldPrice = new BigNumber(soldPriceInHUF);
    returnObj[symbol] = { soldPriceInHUF, boughtPriceInHUF, difference: soldPrice.minus(boughtPriceInHUF).toNumber() };
    return returnObj;
  });
};

const getAllPerformanceData = (revolutPerformanceData, trading212PerformanceData) => [...revolutPerformanceData, ...trading212PerformanceData]
  .reduce((accumulator, current) => {
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

Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const soldRevolutActivities = getBuyActivitiesThatWereSoldLater(activitiesFromRevolut, true);
    const soldTrading212Activities = getBuyActivitiesThatWereSoldLater(activitiesFromTrading212, false);
    const activityDates = getAllActivityDates(soldRevolutActivities, soldTrading212Activities);
    getMnbKozepArfolyamByDates(activityDates).then((exchangeRates) => {
      const revolutPerformanceData = getActivityPerformanceData(soldRevolutActivities, exchangeRates, true);
      const trading212PerformanceData = getActivityPerformanceData(soldTrading212Activities, exchangeRates);
      const performanceData = getAllPerformanceData(revolutPerformanceData, trading212PerformanceData);
      const taxAmount = getTaxAmount(performanceData);
      console.log(performanceData);
      console.log('*******************');
      console.log('TAX AMOUNT: ', taxAmount);
      console.log('*******************');
    });
  })
  .catch((error) => console.error(error));
