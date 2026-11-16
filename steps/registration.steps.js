const { When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const LoginPage = require('../pages/LoginPage');
const RegistrationPage = require('../pages/RegistrationPage');

When('I sign up with a unique email and name {string}', async (name) => {
  const uniqueEmail = `qaauto${Date.now()}@mailinator.com`;
  await LoginPage.fillSignup(name, uniqueEmail);
  await RegistrationPage.completeRegistration();
});

When('I sign up with email {string} and name {string}', async (email, name) => {
  await LoginPage.fillSignup(name, email);
});

Then('I should see the account created confirmation', async () => {
  assert.ok(await RegistrationPage.isRegistered());
});

Then('I should see the signup error {string}', async (expected) => {
  assert.ok((await LoginPage.getSignupError()).includes(expected));
});
