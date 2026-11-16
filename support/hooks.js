const { Before, After } = require('@wdio/cucumber-framework');

Before({ tags: '@needs_credentials' }, async function () {
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    return 'skipped';
  }
});

After(async function (scenario) {
  if (scenario.result && scenario.result.status === 'FAILED') {
    const screenshot = await browser.takeScreenshot();
    await this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
  }
});
