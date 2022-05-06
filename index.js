const moment = require('moment');
const { getMnbKozepArfolyamByDates } = require('./napiarfolyam');
const { getStockSplits } = require('./stocksplit');
const {
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getTaxAmount,
  getFinalPerformance,
  getPerformance,
  getFinalData,
} = require('./utils');
const { getActivitiesFromFile } = require('./csvreader');

console.log('Started');
console.log('Computing...');
Promise.all([getActivitiesFromFile(true), getActivitiesFromFile(false)])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const year = process.argv[2] || (moment().year() - 1);
    const selectedYear = parseInt(year, 10);
    const soldRevolutActivities = getBuyActivitiesThatWereSoldLater(activitiesFromRevolut);
    const soldTrading212Activities = getBuyActivitiesThatWereSoldLater(activitiesFromTrading212);
    const allSoldActivities = getBuyActivitiesThatWereSoldLater([...activitiesFromRevolut, ...activitiesFromTrading212]);
    const activityDates = getAllActivityDates(allSoldActivities);
    Promise.all([getMnbKozepArfolyamByDates(activityDates), getStockSplits(allSoldActivities, activityDates[0])]).then(([exchangeRates, stockSplits]) => {
      const revolutPerformanceData = getPerformance(soldRevolutActivities, exchangeRates, stockSplits);
      const trading212PerformanceData = getPerformance(soldTrading212Activities, exchangeRates, stockSplits);
      const revolutFinalPerformance = getFinalPerformance(revolutPerformanceData, selectedYear);
      const trading212FinalPerformance = getFinalPerformance(trading212PerformanceData, selectedYear);
      const revolutTaxAmount = getTaxAmount(revolutFinalPerformance);
      const trading212TaxAmount = getTaxAmount(trading212FinalPerformance);
      const { finalPerformance, finalTaxAmount } = getFinalData(revolutFinalPerformance, trading212FinalPerformance);

      console.log(revolutPerformanceData);
      console.log(trading212PerformanceData);
      console.log('');
      console.log('********************************************');
      console.log(`REVOLUT PERFORMANCE FOR ${selectedYear}: ${revolutFinalPerformance} Ft`);
      console.log(`REVOLUT TAX AMOUNT FOR ${selectedYear}: ${revolutTaxAmount} Ft`);
      console.log('********************************************');
      console.log(`TRADING212 PERFORMANCE FOR ${selectedYear}: ${trading212FinalPerformance} Ft`);
      console.log(`TRADING212 TAX AMOUNT FOR ${selectedYear}: ${trading212TaxAmount} Ft`);
      console.log('********************************************');
      console.log('');
      console.log(`FINAL PERFORMANCE FOR ${selectedYear}: ${finalPerformance} Ft`);
      console.log(`FINAL TAX AMOUNT FOR ${selectedYear}: ${finalTaxAmount} Ft`);
      console.log('');
    });
  })
  .catch((error) => console.error(error));
