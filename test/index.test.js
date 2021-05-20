const assert = require('assert');
const {
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getActivityPriceInHUF,
  getPriceInHUFAndQuantity,
  getAmount,
  getActivityPerformanceData,
  getTaxAmount,
  getBuyPriceAndQuantityByYear,
} = require('../utils');

describe('getBuyActivitiesThatWereSoldLater', () => {

  it('Test #1', () => {
    const activities = [];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #2', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #3', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);
    const expected = {};
    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #4', () => {
    const activities = [
      {
        id: 1,
        activityType: 'SELL',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);
    const expected = {
      TSLA: {
        buy: [],
        sell: [
          {
            id: 1,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
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
        tradeDate: '2020-10-01',
      },
      {
        id: 2,
        activityType: 'SELL',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
    ];
    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);
    const expected = {
      TSLA: {
        buy: [],
        sell: [
          {
            id: 1,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
          },
        ],
      },
      SQ: {
        buy: [],
        sell: [
          {
            id: 2,
            activityType: 'SELL',
            symbol: 'SQ',
            tradeDate: '2020-10-01',
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
        tradeDate: '2020-10-01',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
      {
        id: 4,
        activityType: 'SELL',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
      {
        id: 6,
        activityType: 'SELL',
        symbol: 'TSLA',
        tradeDate: '2020-10-01',
      },
      {
        id: 7,
        activityType: 'SELL',
        symbol: 'SQ',
        tradeDate: '2020-10-01',
      },
    ];

    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);

    const expected = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
          }
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
          },
          {
            id: 6,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-01',
          }
        ]
      },
      SQ: {
        buy: [
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'SQ',
            tradeDate: '2020-10-01',
          },
          {
            id: 5,
            activityType: 'BUY',
            symbol: 'SQ',
            tradeDate: '2020-10-01',
          }
        ],
        sell: [
          {
            id: 7,
            activityType: 'SELL',
            symbol: 'SQ',
            tradeDate: '2020-10-01',
          }
        ]
      }
    };

    assert.deepEqual(expected, buyActivitiesThatWereSoldLater);
  });

  it('Test #7', () => {
    const activities = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-10-11',
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-10-05',
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-28',
      },
      {
        id: 4,
        activityType: 'SELL',
        symbol: 'TSLA',
        tradeDate: '2020-10-22',
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'SQ',
        tradeDate: '2020-10-03',
      },
      {
        id: 6,
        activityType: 'SELL',
        symbol: 'TSLA',
        tradeDate: '2020-10-21',
      },
      {
        id: 7,
        activityType: 'SELL',
        symbol: 'SQ',
        tradeDate: '2020-10-05',
      },
    ];

    const buyActivitiesThatWereSoldLater = getBuyActivitiesThatWereSoldLater(activities, 2020);

    const expected = {
      TSLA: {
        buy: [
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-10-05',
          },
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-10-11',
          }
        ],
        sell: [
          {
            id: 6,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-21',
          },
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-10-22',
          }
        ]
      },
      SQ: {
        buy: [
          {
            id: 5,
            activityType: 'BUY',
            symbol: 'SQ',
            tradeDate: '2020-10-03',
          },
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'SQ',
            tradeDate: '2020-10-28',
          }
        ],
        sell: [
          {
            id: 7,
            activityType: 'SELL',
            symbol: 'SQ',
            tradeDate: '2020-10-05',
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

  it('Test #4', () => {
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

describe('getActivityPriceInHUF', () => {

  it('Test #1', () => {
    const price = '100';
    const activityDate = '2020-10-07';
    const quantity = '2';
    const exchangeRates = { '20201007': '300' };
    const activityPriceInHUF = getActivityPriceInHUF(price, activityDate, quantity, exchangeRates);
    const expected = 60000;
    assert.deepEqual(expected, activityPriceInHUF.toNumber());
  });

  it('Test #2', () => {
    const price = '100';
    const activityDate = '2020-10-07';
    const quantity = '2';
    const exchangeRates = { '20201007': '292.5800' };
    const activityPriceInHUF = getActivityPriceInHUF(price, activityDate, quantity, exchangeRates);
    const expected = 58516;
    assert.deepEqual(expected, activityPriceInHUF.toNumber());
  });

  it('Test #3', () => {
    const price = '100';
    const activityDate = '2020-10-07';
    const quantity = '2.335';
    const exchangeRates = { '20201007': '292.5800' };
    const activityPriceInHUF = getActivityPriceInHUF(price, activityDate, quantity, exchangeRates);
    const expected = 68317.43;
    assert.deepEqual(expected, activityPriceInHUF.toNumber());
  });

  it('Test #4', () => {
    const price = '77.62';
    const activityDate = '2020-10-07';
    const quantity = '2.335';
    const exchangeRates = { '20201007': '292.5800' };
    const activityPriceInHUF = getActivityPriceInHUF(price, activityDate, quantity, exchangeRates);
    const expected = 53027.989166;
    assert.deepEqual(expected, activityPriceInHUF.toNumber());
  });

  it('Test #5', () => {
    const price = '100';
    const activityDate = '2020-10-07';
    const quantity = '5';
    const exchangeRates = {
      '20201006': '290',
      '20201007': '300',
      '20201008': '310',
    };
    const activityPriceInHUF = getActivityPriceInHUF(price, activityDate, quantity, exchangeRates);
    const expected = 150000;
    assert.deepEqual(expected, activityPriceInHUF.toNumber());
  });

});

describe('getPriceInHUFAndQuantity', () => {

  it('Test #1', () => {
    const currentPrice = '12.54';
    const currentTradeDate = '2021-04-07';
    const currentQuantity = 9.53613;
    const priceInHUFSoFar = 35923.7399;
    const quantitySoFar = 9.5;
    const exchangeRates = {
      '20201006': '290',
      '20201007': '300',
      '20201008': '310',
      '20210407': '302.33',
    };
    const priceInHUFAndQuantity = getPriceInHUFAndQuantity(currentPrice, currentTradeDate, currentQuantity, priceInHUFSoFar, quantitySoFar, exchangeRates);
    const expected = { quantity: 19.03613, priceInHUF: 72077.289513566 };
    assert.deepEqual(expected, priceInHUFAndQuantity);
  });

});

describe('getAmount', () => {

  it('Test #1', () => {
    const activityType = 'BUY';
    const quantityString = '10';
    const priceString = '100';

    const amount = getAmount(activityType, quantityString, priceString);
    const expected = 1000;
    assert.deepEqual(expected, amount);
  });

  it('Test #2', () => {
    const activityType = 'BUY';
    const quantityString = '4.2833';
    const priceString = '176.12';

    const amount = getAmount(activityType, quantityString, priceString);
    const expected = 754.374796;
    assert.deepEqual(expected, amount);
  });

  it('Test #3', () => {
    const activityType = 'SELL';
    const quantityString = '10';
    const priceString = '100';

    const amount = getAmount(activityType, quantityString, priceString);
    const expected = -1000;
    assert.deepEqual(expected, amount);
  });

  it('Test #4', () => {
    const activityType = 'SELL';
    const quantityString = '4.2833';
    const priceString = '176.12';

    const amount = getAmount(activityType, quantityString, priceString);
    const expected = -754.374796;
    assert.deepEqual(expected, amount);
  });

});

describe('getActivityPerformanceData', () => {

  it('Test #1', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6',
            amount: -6,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 1500,
            difference: 270,
            soldPriceInHUF: 1770,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #2', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '3',
            price: '6',
            amount: -18,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1370,
            soldPriceInHUF: 5310,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #3', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 2720,
            difference: 820,
            soldPriceInHUF: 3540,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #4', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6.5',
            amount: -6.5,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1517.5,
            soldPriceInHUF: 5457.5,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #5', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1.98',
            price: '5',
            amount: 9.9,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2.61',
            price: '4',
            amount: 10.44,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1.22',
            price: '6',
            amount: -7.32,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '0.74',
            price: '6.5',
            amount: -4.81,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 2940,
            difference: 638.35,
            soldPriceInHUF: 3578.35,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #6', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1.98',
            price: '5',
            amount: 9.9,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2.61',
            price: '4',
            amount: 10.44,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1.22',
            price: '6',
            amount: -7.32,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1.74',
            price: '6.5',
            amount: -11.31,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 4165.6,
            difference: 1330.25,
            soldPriceInHUF: 5495.85,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #7', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '0.5',
            price: '2',
            amount: -1,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '3',
            amount: -3,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 2110,
            difference: -930,
            soldPriceInHUF: 1180,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #8', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1.22',
            price: '5.73',
            amount: 6.9906,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2.59',
            price: '4.43',
            amount: 11.4737,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '0.56',
            price: '2.22',
            amount: -1.2432,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1.81',
            price: '3.33',
            amount: -6.0273,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3651.0025,
            difference: -1506.205,
            soldPriceInHUF: 2144.7975,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #9', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6.5',
            amount: -6.5,
          },
        ],
      },
      SQ: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6.5',
            amount: -6.5,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1517.5,
            soldPriceInHUF: 5457.5,
          },
        },
      },
      {
        SQ: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1517.5,
            soldPriceInHUF: 5457.5,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #10', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6.5',
            amount: -6.5,
          },
        ],
      },
      SQ: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '0.5',
            price: '4.5',
            amount: 2.25,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '3.25',
            price: '6',
            amount: -19.5,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1517.5,
            soldPriceInHUF: 5457.5,
          },
        },
      },
      {
        SQ: {
          2020: {
            boughtPriceInHUF: 4283.125,
            difference: 1469.375,
            soldPriceInHUF: 5752.5,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

  it('Test #11', () => {
    const soldActivities = {
      TSLA: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '2',
            price: '6',
            amount: -12,
          },
          {
            id: 5,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '1',
            price: '6.5',
            amount: -6.5,
          },
        ],
      },
      SQ: {
        buy: [
          {
            id: 1,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-01',
            currency: 'USD',
            quantity: '1',
            price: '5',
            amount: 5,
          },
          {
            id: 2,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '2',
            price: '4',
            amount: 8,
          },
          {
            id: 3,
            activityType: 'BUY',
            symbol: 'TSLA',
            tradeDate: '2020-09-02',
            currency: 'USD',
            quantity: '0.5',
            price: '4.5',
            amount: 2.25,
          },
        ],
        sell: [
          {
            id: 4,
            activityType: 'SELL',
            symbol: 'TSLA',
            tradeDate: '2020-09-10',
            currency: 'USD',
            quantity: '3.25',
            price: '1.5',
            amount: -4.875,
          },
        ],
      },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const activityPerformanceData = getActivityPerformanceData(soldActivities, exchangeRates);
    const expected = [
      {
        TSLA: {
          2020: {
            boughtPriceInHUF: 3940,
            difference: 1517.5,
            soldPriceInHUF: 5457.5,
          },
        },
      },
      {
        SQ: {
          2020: {
            boughtPriceInHUF: 4283.125,
            difference: -2845,
            soldPriceInHUF: 1438.125,
          },
        },
      },
    ];
    assert.deepEqual(expected, activityPerformanceData);
  });

});

describe('getTaxAmount', () => {

  it('Test #1', () => {
    const selectedYear = 2020;
    const performanceData = {
      TSLA: {
        2020: {
          boughtPriceInHUF: 3940,
          difference: 1517.5,
          soldPriceInHUF: 5457.5,
        },
      },
    };
    const taxAmount = getTaxAmount(performanceData, selectedYear);
    const expected = 227.625;
    assert.deepEqual(expected, taxAmount);
  });

  it('Test #2', () => {
    const selectedYear = 2020;
    const performanceData = {
      TSLA: {
        2020: {
          boughtPriceInHUF: 5457.5,
          difference: -1517.5,
          soldPriceInHUF: 3940,
        },
      },
    };
    const taxAmount = getTaxAmount(performanceData, selectedYear);
    const expected = 0;
    assert.deepEqual(expected, taxAmount);
  });

  it('Test #3', () => {
    const selectedYear = 2020;
    const performanceData = {
      TSLA: {
        2020: {
          boughtPriceInHUF: 3940,
          difference: 1517.5,
          soldPriceInHUF: 5457.5,
        },
      },
      SQ: {
        2020: {
          boughtPriceInHUF: 3940,
          difference: 1517.5,
          soldPriceInHUF: 5457.5,
        },
      },
    };
    const taxAmount = getTaxAmount(performanceData, selectedYear);
    const expected = 455.25;
    assert.deepEqual(expected, taxAmount);
  });

  it('Test #4', () => {
    const selectedYear = 2020;
    const performanceData = {
      TSLA: {
        2020: {
          boughtPriceInHUF: 3940,
          difference: 1517.5,
          soldPriceInHUF: 5457.5,
        },
      },
      SQ: {
        2020: {
          boughtPriceInHUF: 5457.5,
          difference: -1517.5,
          soldPriceInHUF: 3940,
        },
      },
    };
    const taxAmount = getTaxAmount(performanceData, selectedYear);
    const expected = 0;
    assert.deepEqual(expected, taxAmount);
  });

  it('Test #5', () => {
    const selectedYear = 2020;
    const performanceData = {
      TSLA: {
        2020: {
          boughtPriceInHUF: 5457.5,
          difference: -1517.5,
          soldPriceInHUF: 3940,
        },
      },
      SQ: {
        2020: {
          boughtPriceInHUF: 5457.5,
          difference: -1517.5,
          soldPriceInHUF: 3940,
        },
      },
    };
    const taxAmount = getTaxAmount(performanceData, selectedYear);
    const expected = 0;
    assert.deepEqual(expected, taxAmount);
  });

});

describe('getBuyPriceAndQuantityByYear', () => {

  it('Test #1', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
    ];
    const sellData = {
      2020: { quantity: 1 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 1, priceInHUF: 1500 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #2', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
    ];
    const sellData = {
      2020: { quantity: 0.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 0.5, priceInHUF: 750 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #3', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
    ];
    const sellData = {
      2020: { quantity: 0.15 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 0.15, priceInHUF: 225 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #4', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
    ];
    const sellData = {
      2020: { quantity: 1 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 1, priceInHUF: 1500 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #5', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
    ];
    const sellData = {
      2020: { quantity: 2 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 2, priceInHUF: 2720 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #6', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
    ];
    const sellData = {
      2020: { quantity: 2.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 2.5, priceInHUF: 3330 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #7', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
    ];
    const sellData = {
      2020: { quantity: 3.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 3.5, priceInHUF: 4626.25 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #8', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
      {
        id: 4,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-09-10',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-09-10',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
    ];
    const sellData = {
      2020: { quantity: 3.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 3.5, priceInHUF: 4626.25 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #9', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
      {
        id: 4,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-02-02',
        currency: 'USD',
        quantity: '3',
        price: '4',
        amount: 12,
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-03-03',
        currency: 'USD',
        quantity: '0.5',
        price: '5',
        amount: 2.5,
      },
    ];
    const sellData = {
      2020: { quantity: 1.5 },
      2021: { quantity: 3.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
      '20210202': '305',
      '20210303': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 1.5, priceInHUF: 2110 },
      2021: { quantity: 3.5, priceInHUF: 4346.25 }, 
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

  it('Test #10', () => {
    const buy = [
      {
        id: 1,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-01',
        currency: 'USD',
        quantity: '1',
        price: '5',
        amount: 5,
      },
      {
        id: 2,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '2',
        price: '4',
        amount: 8,
      },
      {
        id: 3,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2020-09-02',
        currency: 'USD',
        quantity: '0.5',
        price: '4.5',
        amount: 2.25,
      },
      {
        id: 4,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-02-02',
        currency: 'USD',
        quantity: '3',
        price: '4',
        amount: 12,
      },
      {
        id: 5,
        activityType: 'BUY',
        symbol: 'TSLA',
        tradeDate: '2021-03-03',
        currency: 'USD',
        quantity: '0.5',
        price: '5',
        amount: 2.5,
      },
    ];
    const sellData = {
      2020: { quantity: 1.5 },
      2021: { quantity: 5.5 },
    };
    const exchangeRates = {
      '20200901': '300',
      '20200902': '305',
      '20200910': '295',
      '20210202': '305',
      '20210303': '295',
    };
    const buyPriceAndQuantityByYear = getBuyPriceAndQuantityByYear(buy, sellData, exchangeRates);
    const expected = {
      2020: { quantity: 1.5, priceInHUF: 2110 },
      2021: { quantity: 5.5, priceInHUF: 6913.75 },
    };
    assert.deepEqual(expected, buyPriceAndQuantityByYear);
  });

});
