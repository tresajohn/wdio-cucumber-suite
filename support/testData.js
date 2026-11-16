module.exports = {
  validUser: {
    email: process.env.TEST_EMAIL || '',
    password: process.env.TEST_PASSWORD || ''
  },
  invalidUser: {
    email: 'wrong@example.com',
    password: 'wrongpass999'
  },
  newUser: {
    name: 'Portfolio QA'
  },
  payment: {
    name: 'Test User QA',
    cardNumber: '4111111111111111',
    cvc: '111',
    expiryMonth: '12',
    expiryYear: '2027'
  },
  contact: {
    name: 'Tresa QA',
    email: 'tresa.qa@test.com',
    subject: 'Portfolio Test',
    message: 'Automated test message from WDIO framework.'
  }
};
