const { Given, When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const testData = require('../support/testData');

Given('I am logged in as a registered user', async () => {
  await LoginPage.open();
  await LoginPage.login(testData.validUser.email, testData.validUser.password);
  assert.ok(await LoginPage.isLoggedIn());
});

Given('I have a product in my cart', async () => {
  await HomePage.open();
  await HomePage.addFirstProductToCart();
});

When('I proceed to checkout from cart', async () => {
  await CartPage.open();
  await CartPage.proceedToCheckout();
});

When('I confirm and pay for the order', async () => {
  await CheckoutPage.confirmOrder();
});

Then('I should see the order placed confirmation', async () => {
  assert.ok((await CheckoutPage.getSuccessMessage()).length > 0);
});
