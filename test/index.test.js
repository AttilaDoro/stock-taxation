const assert = require('assert');
const {
  getBuyActivitiesThatWereSoldLater,
  getAllActivityDates,
  getActivityPriceInHUF,
  getPriceInHUFAndQuantity,
  getBoughtPriceInHUF,
  getAmount,
  getLastIndexToKeep,
} = require('../utils');

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

describe('getLastIndexToKeep', () => {

  it('Test #1', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.096436',
        price: '23.85',
        amount: 49.9999986,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1.452643',
        price: '17.21',
        amount: 24.99998603,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.80112',
        price: '17.85',
        amount: 49.999992,
        id: 131,
      }
    ];
    const soldQuantity = 6.350199;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 2;
    assert.deepEqual(expected, lastIndexToKeep);
  });

  it('Test #2', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.096436',
        price: '23.85',
        amount: 49.9999986,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1.452643',
        price: '17.21',
        amount: 24.99998603,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.80112',
        price: '17.85',
        amount: 49.999992,
        id: 131,
      }
    ];
    const soldQuantity = 1;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 0;
    assert.deepEqual(expected, lastIndexToKeep);
  });

  it('Test #3', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.096436',
        price: '23.85',
        amount: 49.9999986,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1.452643',
        price: '17.21',
        amount: 24.99998603,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.80112',
        price: '17.85',
        amount: 49.999992,
        id: 131,
      }
    ];
    const soldQuantity = 3;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 1;
    assert.deepEqual(expected, lastIndexToKeep);
  });

  it('Test #4', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.096436',
        price: '23.85',
        amount: 49.9999986,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1.452643',
        price: '17.21',
        amount: 24.99998603,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2.80112',
        price: '17.85',
        amount: 49.999992,
        id: 131,
      }
    ];
    const soldQuantity = 10;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 2;
    assert.deepEqual(expected, lastIndexToKeep);
  });

  it('Test #5', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2',
        price: '5',
        amount: 10,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '3',
        price: '4',
        amount: 12,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1',
        price: '7',
        amount: 7,
        id: 131,
      }
    ];
    const soldQuantity = 4.99;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 1;
    assert.deepEqual(expected, lastIndexToKeep);
  });

  it('Test #6', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '2',
        price: '5',
        amount: 10,
        id: 120,
      },
      {
        tradeDate: '2020-10-30',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '3',
        price: '4',
        amount: 12,
        id: 130,
      },
      {
        tradeDate: '2020-10-28',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '1',
        price: '7',
        amount: 7,
        id: 131,
      }
    ];
    const soldQuantity = 5.001;

    const lastIndexToKeep = getLastIndexToKeep(buy, soldQuantity);
    const expected = 2;
    assert.deepEqual(expected, lastIndexToKeep);
  });

});

describe('getBoughtPriceInHUF', () => {

  it('Test #1', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '20',
        amount: 100,
        id: 120,
      },
    ];
    const lastIndexToKeep = 0;
    const soldQuantity = 3;
    const exchangeRates = {
      '20201218': '300',
    };

    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const expected = 18000;
    assert.deepEqual(expected, boughtPriceInHUF);
  });

  it('Test #2', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '20',
        amount: 100,
        id: 120,
      },
      {
        tradeDate: '2020-12-19',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '30',
        amount: 150,
        id: 121,
      },
    ];
    const lastIndexToKeep = 0;
    const soldQuantity = 3;
    const exchangeRates = {
      '20201218': '300',
      '20201219': '310',
    };

    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const expected = 18000;
    assert.deepEqual(expected, boughtPriceInHUF);
  });

  it('Test #3', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '20',
        amount: 100,
        id: 120,
      },
      {
        tradeDate: '2020-12-19',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '30',
        amount: 150,
        id: 121,
      },
    ];
    const lastIndexToKeep = 1;
    const soldQuantity = 8;
    const exchangeRates = {
      '20201218': '300',
      '20201219': '310',
    };

    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const expected = 57900;
    assert.deepEqual(expected, boughtPriceInHUF);
  });

  it('Test #4', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '20',
        amount: 100,
        id: 120,
      },
      {
        tradeDate: '2020-12-19',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '30',
        amount: 150,
        id: 121,
      },
      {
        tradeDate: '2020-12-20',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '25',
        amount: 125,
        id: 122,
      },
    ];
    const lastIndexToKeep = 1;
    const soldQuantity = 8;
    const exchangeRates = {
      '20201218': '300',
      '20201219': '310',
      '20201220': '320',
    };

    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const expected = 57900;
    assert.deepEqual(expected, boughtPriceInHUF);
  });

  it('Test #5', () => {
    const buy = [
      {
        tradeDate: '2020-12-18',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '20',
        amount: 100,
        id: 120,
      },
      {
        tradeDate: '2020-12-19',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '30',
        amount: 150,
        id: 121,
      },
      {
        tradeDate: '2020-12-20',
        currency: 'USD',
        activityType: 'BUY',
        symbol: 'SPCE',
        quantity: '5',
        price: '25',
        amount: 125,
        id: 122,
      },
    ];
    const lastIndexToKeep = 2;
    const soldQuantity = 15;
    const exchangeRates = {
      '20201218': '300',
      '20201219': '310',
      '20201220': '320',
    };

    const boughtPriceInHUF = getBoughtPriceInHUF(buy, lastIndexToKeep, soldQuantity, exchangeRates);
    const expected = 116500;
    assert.deepEqual(expected, boughtPriceInHUF);
  });

});
