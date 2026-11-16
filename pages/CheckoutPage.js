const BasePage = require('./BasePage');
const testData = require('../support/testData');

class CheckoutPage extends BasePage {
  get placeOrderBtn() { return $("a[href='/payment']"); }
  get cardName() { return $("[data-qa='name-on-card']"); }
  get cardNumber() { return $("[data-qa='card-number']"); }
  get cvc() { return $("[data-qa='cvc']"); }
  get expiryMonth() { return $("[data-qa='expiry-month']"); }
  get expiryYear() { return $("[data-qa='expiry-year']"); }
  get payBtn() { return $("[data-qa='pay-button']"); }
  get successMsg() { return $("[data-qa='order-placed']"); }

  async confirmOrder() {
    await this.placeOrderBtn.waitForClickable({ timeout: 15000 });
    await this.placeOrderBtn.click();
    await this.cardName.waitForDisplayed({ timeout: 15000 });
    await this.cardName.setValue(testData.payment.name);
    await this.cardNumber.setValue(testData.payment.cardNumber);
    await this.cvc.setValue(testData.payment.cvc);
    await this.expiryMonth.setValue(testData.payment.expiryMonth);
    await this.expiryYear.setValue(testData.payment.expiryYear);
    await this.payBtn.waitForClickable({ timeout: 15000 });
    await this.payBtn.click();
  }

  async getSuccessMessage() {
    await this.successMsg.waitForDisplayed({ timeout: 15000 });
    return this.successMsg.getText();
  }
}

module.exports = new CheckoutPage();
