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

    const finalActivitiesObjectCopy = { ...finalActivitiesObject };

    if (!finalActivitiesObjectCopy[symbol]) finalActivitiesObjectCopy[symbol] = {};
    if (!finalActivitiesObjectCopy[symbol].buy) finalActivitiesObjectCopy[symbol].buy = getActivitiesBySymbol(boughtActivities, symbol);
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

const getSellPriceAndQuantityByYear = (sell, exchangeRates) => sell.reduce((accumulator, { price, tradeDate, quantity }) => {
  const yearOfCurrentTransaction = moment(tradeDate).year();
  const priceInHUFSoFar = !accumulator[yearOfCurrentTransaction] ? 0: accumulator[yearOfCurrentTransaction].priceInHUF;
  const quantitySoFar = !accumulator[yearOfCurrentTransaction] ? 0: accumulator[yearOfCurrentTransaction].quantity;
  return {
    ...accumulator,
    [yearOfCurrentTransaction]: getPriceInHUFAndQuantity(price, tradeDate, quantity, priceInHUFSoFar, quantitySoFar, exchangeRates),
  };
}, {});

const getBuyPriceAndQuantityByYear = (buy, sellData, exchangeRates) => {
  const sellYears = Object.keys(sellData);
  const [firstYear] = sellYears;
  let isFinished = false;
  return buy.reduce((accumulator, { id, price, tradeDate, quantity }) => {
    if (isFinished) return accumulator;
    const buyItemsSoFar = Object.entries(accumulator);
    const [latestYear, buyDataSoFar] = buyItemsSoFar[buyItemsSoFar.length - 1];
    const { quantity: soldQuantity } = sellData[latestYear];
    const quantitySoFar = new BigNumber(buyDataSoFar.quantity);
    const quantitySum = quantitySoFar.plus(quantity);
    const newQuantityNum = quantitySum.toNumber();

    if (quantitySum.isLessThan(soldQuantity)) {
      return {
        ...accumulator,
        [latestYear]: getPriceInHUFAndQuantity(price, tradeDate, quantity, buyDataSoFar.priceInHUF, quantitySoFar, exchangeRates),
      };
    }

    const remainingForNextYearQuantity = quantitySum.minus(soldQuantity).toNumber();
    const sold = new BigNumber(soldQuantity);
    const remainingForThisYearQuantity = sold.minus(quantitySoFar).toNumber();

    const indexOfLatestYear = sellYears.indexOf(latestYear);
    const newYear = sellYears[indexOfLatestYear + 1];

    if (!newYear) {
      isFinished = true;
      return {
        ...accumulator,
        [latestYear]: getPriceInHUFAndQuantity(price, tradeDate, remainingForThisYearQuantity, buyDataSoFar.priceInHUF, quantitySoFar, exchangeRates),
      };
    }
  
    return {
      ...accumulator,
      [latestYear]: getPriceInHUFAndQuantity(price, tradeDate, remainingForThisYearQuantity, buyDataSoFar.priceInHUF, quantitySoFar, exchangeRates),
      [newYear]: getPriceInHUFAndQuantity(price, tradeDate, remainingForNextYearQuantity, 0, 0, exchangeRates),
    };
  }, {
    [firstYear]: { quantity: 0, priceInHUF: 0 },
  });
};

const getPerformanceByYear = (buy, sell, exchangeRates) => {
  const sellData = getSellPriceAndQuantityByYear(sell, exchangeRates);
  const buyData = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
  return Object.entries(sellData).reduce((accumulator, [year, { quantity: sellQuantity, priceInHUF: sellPrice }]) => {
    const { quantity: buyQuantity, priceInHUF: buyPrice } = buyData[year];
    const sellPriceNum = new BigNumber(sellPrice);
    return {
      ...accumulator,
      [year]: {
        buyPriceInHUF: buyPrice,
        difference: sellPriceNum.minus(buyPrice).toNumber(),
        sellPriceInHUF: sellPrice,
      }
    };
  }, {});
};

const getActivityPerformanceData = (soldActivities, exchangeRates) =>
  Object.entries(soldActivities).map(([symbol, { buy, sell }]) => {
    const performanceByYear = getPerformanceByYear(buy, sell, exchangeRates);
    return {
      [symbol]: performanceByYear,
    };
  });

const getAllPerformanceData = activityPerformanceData => activityPerformanceData.reduce((accumulator, current) => {
  const [symbol] = Object.keys(current);
  const newObj = { ...accumulator };
  newObj[symbol] = current[symbol];
  return newObj;
}, {});

const getFinalPerformance = (performanceData, selectedYear) => Object
  .entries(performanceData)
  .reduce((accumulator, [currentSymbol, performanceDataByYear]) => {
    const { difference = 0 } = performanceDataByYear[selectedYear] || {};
    const acc = new BigNumber(accumulator);
    return acc.plus(difference).toNumber();
  }, 0);

const getTaxAmount = (finalPerformance) => {
  if (finalPerformance <= 0) return 0;
  const performance = new BigNumber(finalPerformance);
  return performance.multipliedBy(0.15).toNumber();
};

const getClosestSplitData = (tradeDate, splitData) => splitData.reduce((closestSoFar, currentSplit) => {
  const date = moment(tradeDate);
  const currentDiff = date.diff(closestSoFar.date, 'days');
  const newDiff = date.diff(currentSplit.date, 'days');
  return newDiff < currentDiff ? { ...currentSplit } : { ...closestSoFar };
}, splitData[0]);

const adjustTransaction = (transaction, splitData) => {
  const { tradeDate, quantity, price, amount } = transaction;
  const { date, ratio } = getClosestSplitData(tradeDate, splitData);
  if (moment(tradeDate).isBefore(date)) return { ...transaction };
  const quantityNum = new BigNumber(quantity);
  const priceNum = new BigNumber(price);
  return {
    ...transaction,
    splitAdjustedQuantity: quantity,
    splitAdjustedPrice: price,
    quantity: quantityNum.dividedBy(ratio).toString(),
    price: priceNum.multipliedBy(ratio).toString(),
  };
};

const getAdjustedActivities = (soldActivities, stockSplits) => {
  Object.entries(stockSplits).forEach(([symbol, splitData]) => {
    const stock = soldActivities[symbol];
    if (!stock) return;
    const { buy = [], sell = [] } = stock;
    stock.buy = buy.map(transaction => adjustTransaction(transaction, splitData));
    stock.sell = sell.map(transaction => adjustTransaction(transaction, splitData));
  });
  return soldActivities;
};

const getPerformance = (soldActivities, exchangeRates, stockSplits) => {
  const adjustedActivities = getAdjustedActivities(soldActivities, stockSplits);
  return getAllPerformanceData(getActivityPerformanceData(adjustedActivities, exchangeRates));
};

const getFinalData = (revolutFinalPerformance, trading212FinalPerformance) => {
  const revolutPerformance = new BigNumber(revolutFinalPerformance);
  const finalPerformance = revolutPerformance.plus(trading212FinalPerformance).toNumber();
  return {
    finalPerformance,
    finalTaxAmount: getTaxAmount(finalPerformance),
  };
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
  getBuyPriceAndQuantityByYear,
  getFinalPerformance,
  getAdjustedActivities,
  getPerformance,
  getFinalData,
};
