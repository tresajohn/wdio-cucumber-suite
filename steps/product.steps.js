const { Given, When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const HomePage = require('../pages/HomePage');

Given('I am on the home page', async () => {
  await HomePage.open();
});

When('I search for {string}', async (keyword) => {
  await HomePage.search(keyword);
});

Then('I should see at least {int} product in the results', async (count) => {
  assert.ok((await HomePage.getProductNames()).length >= count);
});

Then('I should see {int} products in the results', async (count) => {
  assert.strictEqual((await HomePage.getProductNames()).length, count);
});

When('I add the first visible product to cart', async () => {
  await HomePage.addFirstProductToCart();
});
