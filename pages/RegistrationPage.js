const BasePage = require('./BasePage');

class RegistrationPage extends BasePage {
  get password() { return $("[data-qa='password']"); }
  get firstName() { return $("[data-qa='first_name']"); }
  get lastName() { return $("[data-qa='last_name']"); }
  get address() { return $("[data-qa='address']"); }
  get state() { return $("[data-qa='state']"); }
  get city() { return $("[data-qa='city']"); }
  get zipcode() { return $("[data-qa='zipcode']"); }
  get mobile() { return $("[data-qa='mobile_number']"); }
  get createAccountBtn() { return $("[data-qa='create-account']"); }
  get accountCreatedMsg() { return $("[data-qa='account-created'] b"); }

  async completeRegistration(pwd = 'Test@1234') {
    await this._dismissOverlay();
    await this.password.waitForDisplayed({ timeout: 15000 });
    await this.password.setValue(pwd);
    await this.firstName.setValue('Test');
    await this.lastName.setValue('User');
    await this.address.setValue('123 Test Street');
    await this.state.setValue('TestState');
    await this.city.setValue('TestCity');
    await this.zipcode.setValue('12345');
    await this.mobile.setValue('1234567890');
    await this.createAccountBtn.waitForClickable({ timeout: 15000 });
    await this.createAccountBtn.click();
    await this.accountCreatedMsg.waitForDisplayed({ timeout: 15000 });
  }

  async isRegistered() {
    return this.accountCreatedMsg.isDisplayed();
  }
}

module.exports = new RegistrationPage();
