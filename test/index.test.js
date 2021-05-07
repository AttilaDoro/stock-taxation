const assert = require('assert');
const { getBuyActivitiesThatWereSoldLater, getAllActivityDates } = require('../utils');

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

describe('getAllActivityDates', () => {

  it('Test #1', () => {
    const soldActivities = {};
    const allActivityDates = getAllActivityDates(soldActivities);
    const expected = [];
    assert.deepEqual(expected, allActivityDates);
  });

  it('Test #2', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-05-20',
          },
        ],
        sell: [
          {
            id: 2,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2021-10-19',
          },
        ],
      },
    };
    const allActivityDates = getAllActivityDates(soldActivities);
    const expected = ['20210520', '20211019'];
    assert.deepEqual(expected, allActivityDates);
  });

  it('Test #3', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-05-20',
          },
        ],
        sell: [
          {
            id: 2,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2021-10-19',
          },
        ],
      },
      SQ: {
        buy: [
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-03-12',
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2021-11-11',
          },
        ],
      },
    };
    const allActivityDates = getAllActivityDates(soldActivities);
    const expected = ['20210312', '20210520', '20211019', '20211111'];
    assert.deepEqual(expected, allActivityDates);
  });

  it('Test #3', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-05-20',
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-06-20',
          },
        ],
        sell: [
          {
            id: 3,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2021-10-19',
          },
        ],
      },
      SQ: {
        buy: [
          {
            id: 4,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-03-12',
          },
          {
            id: 5,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2021-05-20',
          },
        ],
        sell: [
          {
            id: 6,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2021-11-11',
          },
        ],
      },
    };
    const allActivityDates = getAllActivityDates(soldActivities);
    const expected = ['20210312', '20210520', '20210620', '20211019', '20211111'];
    assert.deepEqual(expected, allActivityDates);
  });

});
