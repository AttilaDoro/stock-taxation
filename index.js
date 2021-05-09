const moment = require('moment');
const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDates } = require('./napiarfolyam');
const {
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getAllPerformanceData,
  getActivityPerformanceData,
  getTaxAmount,
} = require('./utils');

console.log('Starting...');
Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const activities = [...activitiesFromRevolut, ...activitiesFromTrading212].map((activity, index) => ({ ...activity, id: index + 1 }));
    const year = process.argv[2] || (moment().year() - 1);
    const selectedYear = parseInt(year, 10);
    const soldActivities = getBuyActivitiesThatWereSoldLater(activities, selectedYear);
    const activityDates = getAllActivityDates(soldActivities);
    getMnbKozepArfolyamByDates(activityDates).then((exchangeRates) => {
      const performanceData = getAllPerformanceData(getActivityPerformanceData(soldActivities, exchangeRates));
      const taxAmount = getTaxAmount(performanceData);
      console.log(performanceData);
      console.log('*******************');
      console.log('TAX AMOUNT: ', taxAmount);
      console.log('*******************');
    });
  })
  .catch((error) => console.error(error));
