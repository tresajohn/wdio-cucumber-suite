const BasePage = require('./BasePage');

class ContactPage extends BasePage {
  get nameInput() { return $("[data-qa='name']"); }
  get emailInput() { return $("[data-qa='email']"); }
  get subjectInput() { return $("[data-qa='subject']"); }
  get messageInput() { return $("[data-qa='message']"); }
  get submitBtn() { return $("[data-qa='submit-button']"); }
  get successMsg() { return $('.contact-form .alert-success'); }

  async open() {
    await super.open('/contact_us');
  }

  async fillForm(name, email, subject, message) {
    await this._dismissOverlay();
    await this.nameInput.waitForDisplayed({ timeout: 15000 });
    await this.nameInput.setValue(name);
    await this.emailInput.setValue(email);
    await this.subjectInput.setValue(subject);
    await this.messageInput.setValue(message);
  }

  async submit() {
    await this.submitBtn.waitForClickable({ timeout: 15000 });
    await this.submitBtn.click();
    try {
      await browser.acceptAlert();
    } catch {
      // no alert present
    }
    await this.successMsg.waitForDisplayed({ timeout: 15000 });
  }

  async getSuccessMessage() {
    return this.successMsg.getText();
  }
}

module.exports = new ContactPage();
