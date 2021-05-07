const assert = require('assert');
const { getBuyActivitiesThatWereSoldLater } = require('../utils');

describe('getBuyActivitiesThatWereSoldLater', () => {
  it('Test #1', () => {
    const activities = [];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #2', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #3', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'SQ',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #4', () => {
    const activities = [
      {
        id: 1,
        activityType: 'SELL',
        symbol: 'TSLA',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'SQ',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);
    const expected = {
      TSLA: {
        buy: [],
        sell: [
          {
            id: 1,
            activityType: 'SELL',
            symbol: 'TSLA'
          },
        ],
      },
    };
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #5', () => {
    const activities = [
      {
        id: 1,
        activityType: 'SELL',
        symbol: 'TSLA',
      },
      {
        id: 2,
        activityType: 'SELL',
        symbol: 'SQ',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);
    const expected = {
      TSLA: {
        buy: [],
        sell: [
          {
            id: 1,
            activityType: 'SELL',
            symbol: 'TSLA'
          },
        ],
      },
      SQ: {
        buy: [],
        sell: [
          {
            id: 2,
            activityType: 'SELL',
            symbol: 'SQ'
          },
        ],
      },
    };
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #6', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'SQ',
      },
      {
        id: 4,
        activityType: 'SELL',
        symbol: 'TSLA',
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'SQ',
      },
      {
        id: 6,
        activityType: 'SELL',
        symbol: 'TSLA',
      },
      {
        id: 7,
        activityType: 'SELL',
        symbol: 'SQ',
      },
    ];

    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities);

    const expected = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA'
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA'
          }
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA'
          },
          {
            id: 6,
            activityType: 'SELL',
            symbol: 'TSLA'
          }
        ]
      },
      SQ: {
        buy: [
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'SQ'
          },
          {
            id: 5,
            activityType: 'BUY',
            symbol: 'SQ'
          }
        ],
        sell: [
          {
            id: 7,
            activityType: 'SELL',
            symbol: 'SQ'
          }
        ]
      }
    };

    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });
});
