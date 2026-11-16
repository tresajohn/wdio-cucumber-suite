const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  get emailInput() { return $("[data-qa='login-email']"); }
  get passwordInput() { return $("[data-qa='login-password']"); }
  get loginBtn() { return $("[data-qa='login-button']"); }
  get errorMsg() { return $("//p[contains(text(),'Your email or password is incorrect')]"); }
  get logoutLink() { return $("a[href='/logout']"); }
  get signupName() { return $("[data-qa='signup-name']"); }
  get signupEmail() { return $("[data-qa='signup-email']"); }
  get signupBtn() { return $("[data-qa='signup-button']"); }
  get signupError() { return $("//p[contains(text(),'Email Address already exist')]"); }

  async open() {
    await super.open('/login');
  }

  async login(email, password) {
    await this.emailInput.waitForDisplayed({ timeout: 15000 });
    await this.emailInput.setValue(email);
    await this.passwordInput.waitForDisplayed({ timeout: 15000 });
    await this.passwordInput.setValue(password);
    await this.loginBtn.waitForClickable({ timeout: 15000 });
    await this.loginBtn.click();
  }

  async fillSignup(name, email) {
    await this.signupName.waitForDisplayed({ timeout: 15000 });
    await this.signupName.setValue(name);
    await this.signupEmail.waitForDisplayed({ timeout: 15000 });
    await this.signupEmail.setValue(email);
    await this.signupBtn.waitForClickable({ timeout: 15000 });
    await this.signupBtn.click();
  }

  async isLoggedIn() {
    return this.logoutLink.isDisplayed();
  }

  async getErrorMessage() {
    await this.errorMsg.waitForDisplayed({ timeout: 15000 });
    return this.errorMsg.getText();
  }

  async getSignupError() {
    await this.signupError.waitForDisplayed({ timeout: 15000 });
    return this.signupError.getText();
  }
}

module.exports = new LoginPage();
