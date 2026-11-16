const BasePage = require('./BasePage');

class HomePage extends BasePage {
  get searchInput() { return $('#search_product'); }
  get searchBtn() { return $('#submit_search'); }
  get productItems() { return $$('.product-image-wrapper'); }
  get addToCartOverlayBtns() { return $$('.product-overlay .add-to-cart'); }
  get modalContinueBtn() { return $('.modal-footer .btn-success'); }

  async open() {
    await super.open('/');
  }

  async search(keyword) {
    await super.open('/products');
    await this.searchInput.waitForDisplayed({ timeout: 15000 });
    await this.searchInput.setValue(keyword);
    await this.searchBtn.click();
    await browser.pause(2000);
  }

  async getProductNames() {
    const els = await $$('.productinfo p');
    const names = [];
    for (const el of els) {
      const text = await el.getText();
      if (text.trim()) names.push(text.trim());
    }
    return names;
  }

  async addFirstProductToCart() {
    const items = await this.productItems;
    if (!items.length) return;
    await browser.execute((el) => el.scrollIntoView({ block: 'center' }), items[0]);
    await browser.pause(500);
    await items[0].moveTo();
    await browser.execute((el) => {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    }, items[0]);
    await browser.pause(300);
    const btns = await this.addToCartOverlayBtns;
    if (btns.length) {
      await btns[0].waitForClickable({ timeout: 5000 });
      await btns[0].click();
    }
    try {
      await this.modalContinueBtn.waitForDisplayed({ timeout: 3000 });
      await this.modalContinueBtn.click();
    } catch {
      // no modal, continue
    }
  }
}

module.exports = new HomePage();
