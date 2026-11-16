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
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('search'),
      { timeout: 10000, interval: 500 }
    );
    await this._dismissOverlay();
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
    await browser.pause(300);
    await browser.execute((wrapper) => {
      const btn = wrapper.querySelector('.add-to-cart');
      if (btn) btn.click();
    }, items[0]);
    try {
      await this.modalContinueBtn.waitForDisplayed({ timeout: 3000 });
      await this.modalContinueBtn.click();
    } catch {
      // no modal, continue
    }
  }
}

module.exports = new HomePage();
