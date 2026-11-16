const BasePage = require('./BasePage');

class CartPage extends BasePage {
  get cartItemNames() { return $$('.cart_description h4 a'); }
  get proceedCheckoutBtn() { return $('a.btn.check_out'); }

  async open() {
    await super.open('/view_cart');
  }

  async getCartItemNames() {
    try {
      const els = await $$('.cart_description h4 a');
      const names = [];
      for (const el of els) {
        const text = await el.getText();
        if (text.trim()) names.push(text.trim());
      }
      return names;
    } catch {
      return [];
    }
  }

  async proceedToCheckout() {
    await this.proceedCheckoutBtn.waitForClickable({ timeout: 15000 });
    await this.proceedCheckoutBtn.click();
  }
}

module.exports = new CartPage();
