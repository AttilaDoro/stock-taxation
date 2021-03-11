const BigNumber = require('bignumber.js');

const getAmount = (activityType, quantityString, priceString) => {
  const quantity = new BigNumber(quantityString);
  const price = new BigNumber(priceString);
  const amount = quantity.multipliedBy(price).toNumber();
  if (activityType === 'BUY') return amount;
  const amountBigN = new BigNumber(amount);
  return amountBigN.multipliedBy('-1').toNumber();
};

module.exports = { getAmount };
