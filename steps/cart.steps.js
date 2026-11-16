const { When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const CartPage = require('../pages/CartPage');

When('I navigate to the cart page', async () => {
  await CartPage.open();
});

Then('I should see at least {int} item in the cart', async (count) => {
  assert.ok((await CartPage.getCartItemNames()).length >= count);
});

Then('the cart item names list should not be empty', async () => {
  assert.ok((await CartPage.getCartItemNames()).length > 0);
});
