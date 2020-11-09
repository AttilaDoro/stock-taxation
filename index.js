const { getActivitiesFromTrading212 } = require('./trading212');
const { getActivitiesFromRevolut } = require('./revolut');
const { getMnbKozepArfolyamByDate } = require('./napiarfolyam');

getMnbKozepArfolyamByDate('20201030').then((mnbKozepArfolyam) => console.log(mnbKozepArfolyam));
getActivitiesFromRevolut().then(activities => console.log(activities));
getActivitiesFromTrading212().then(activities => console.log(activities));

