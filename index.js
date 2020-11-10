const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDate } = require('./napiarfolyam');

getMnbKozepArfolyamByDate('20201030').then((mnbKozepArfolyam) => console.log(mnbKozepArfolyam));
Promise.all([getActivitiesFromRevolut(), getActivitiesFromTrading212()])
  .then(([activitiesFromRevolut, activitiesFromTrading212]) => {
    const activities = [...activitiesFromRevolut, ...activitiesFromTrading212];
    console.log(activities.filter(({ direction, activityType }) => direction === 'Sell' || activityType === 'SELL'));
  })
  .catch((error) => console.error(error));
