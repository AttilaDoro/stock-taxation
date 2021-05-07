const assert = require('assert');
const { getBuyActivitiesThatWereSoldLater } = require('../utils');

describe('getBuyActivitiesThatWereSoldLater', () => {
  const activities = [
    {
      id: 1,
      activityType: 'BUY',
      symbol: 'TSLA',
    }
  ];

  const asdf = getBuyActivitiesThatWereSoldLater(activities);
  console.log({ asdf });

  it('should return -1 when the value is not present', () => {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
});
