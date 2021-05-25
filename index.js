const moment = require('moment');
const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDates } = require('./napiarfolyam');
const { getStockSplits } = require('./stocksplit');
const {
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getAllPerformanceData,
  getActivityPerformanceData,
  getTaxAmount,
  getFinalPerformance,
  getAdjustedActivities,
} = require('./utils');

console.log('Starting...');
Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const activities = [...activitiesFromRevolut, ...activitiesFromTrading212].map((activity, index) => ({ ...activity, id: index + 1 }));
    const year = process.argv[2] || (moment().year() - 1);
    const selectedYear = parseInt(year, 10);
    const soldActivities = getBuyActivitiesThatWereSoldLater(activities);
    const activityDates = getAllActivityDates(soldActivities);
    Promise.all([getMnbKozepArfolyamByDates(activityDates), getStockSplits(soldActivities, activityDates[0])]).then(([exchangeRates, stockSplits]) => {
      const adjustedActivities = getAdjustedActivities(soldActivities, stockSplits);
      const performanceData = getAllPerformanceData(getActivityPerformanceData(adjustedActivities, exchangeRates));
      const finalPerformance = getFinalPerformance(performanceData, selectedYear);
      const taxAmount = getTaxAmount(finalPerformance);
      console.log(performanceData);
      console.log('*******************');
      console.log(`BALANCE FOR ${selectedYear}: ${finalPerformance} Ft`);
      console.log(`TAX AMOUNT FOR ${selectedYear}: ${taxAmount} Ft`);
      console.log('*******************');
    });
  })
  .catch((error) => console.error(error));
