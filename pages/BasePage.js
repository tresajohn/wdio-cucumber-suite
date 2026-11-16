class BasePage {
  async open(path) {
    await browser.url(path);
    await this._dismissOverlay();
  }

  async _dismissOverlay() {
    await browser.pause(2000);
    await browser.execute(() => {
      document.querySelectorAll(
        '.fc-dialog-overlay, .fc-dialog-container, .fc-consent-root'
      ).forEach(el => el.remove());
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    });
  }

  async waitForVisible(selector, timeout = 15000) {
    await $(selector).waitForDisplayed({ timeout });
  }
}

module.exports = BasePage;
