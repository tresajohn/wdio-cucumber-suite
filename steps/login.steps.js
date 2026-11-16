const { Given, When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');
const testData = require('../support/testData');

Given('I navigate to the login page', async () => {
  await LoginPage.open();
});

When('I login with email {string} and password {string}', async (email, password) => {
  const resolvedEmail = email === 'valid' ? testData.validUser.email : email;
  const resolvedPassword = password === 'valid' ? testData.validUser.password : password;
  await LoginPage.login(resolvedEmail, resolvedPassword);
});

When('I submit login with empty credentials', async () => {
  await LoginPage.loginBtn.click();
});

Then('I should be logged in successfully', async () => {
  assert.ok(await LoginPage.isLoggedIn());
});

Then('I should see the login error {string}', async (expected) => {
  assert.ok((await LoginPage.getErrorMessage()).includes(expected));
});

Then('I should remain on the login page', async () => {
  assert.ok((await browser.getUrl()).includes('/login'));
});
