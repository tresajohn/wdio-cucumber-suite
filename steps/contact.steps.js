const { Given, When, Then } = require('@wdio/cucumber-framework');
const assert = require('assert');
const ContactPage = require('../pages/ContactPage');
const testData = require('../support/testData');

Given('I navigate to the contact page', async () => {
  await ContactPage.open();
});

When('I fill in the contact form with valid details', async () => {
  await ContactPage.fillForm(
    testData.contact.name,
    testData.contact.email,
    testData.contact.subject,
    testData.contact.message
  );
});

When('I submit the contact form', async () => {
  await ContactPage.submit();
});

Then('I should see the contact success message', async () => {
  assert.ok((await ContactPage.getSuccessMessage()).toLowerCase().includes('success'));
});
