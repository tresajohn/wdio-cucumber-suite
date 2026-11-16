require('dotenv').config();

exports.config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  exclude: [],
  maxInstances: 1,

  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.HEADLESS === 'true'
        ? ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        : []
    }
  }],

  logLevel: 'warn',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'https://automationexercise.com',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [],

  framework: 'cucumber',

  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true
    }]
  ],

  cucumberOpts: {
    require: ['./steps/**/*.js', './support/hooks.js'],
    backtrace: false,
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: process.env.TAGS || '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  }
};
