# wdio-cucumber-suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a JavaScript WebdriverIO 9 + Cucumber BDD E2E test suite for automationexercise.com with POM pattern, Allure reporting, and GitHub Actions CI.

**Architecture:** Page Object Model with ES5-compatible CommonJS modules; each `pages/*.js` exports a singleton instance. Step definitions in `steps/` call page methods. WDIO config drives browser and reporter wiring; Cucumber hooks in `support/hooks.js` handle credential-gating and screenshots.

**Tech Stack:** Node.js, WebdriverIO 9, @wdio/cucumber-framework, @wdio/allure-reporter, @wdio/spec-reporter, @wdio/chromedriver-service, @cucumber/cucumber v10, dotenv, allure-commandline

**Spec:** In-conversation design doc (2026-11-16) — JavaScript, WDIO 9, six features mirroring selenium-e2e-suite, TEST_EMAIL/TEST_PASSWORD secrets for @needs_credentials scenarios.

## Global Constraints

- JavaScript CommonJS (`require`/`module.exports`) throughout — no TypeScript
- WebdriverIO v9.x, @wdio/cucumber-framework v9.x, @cucumber/cucumber v10.x
- Target app: `https://automationexercise.com`
- `baseUrl` from `process.env.BASE_URL`, falls back to `https://automationexercise.com`
- `TEST_EMAIL` / `TEST_PASSWORD` from env — scenarios tagged `@needs_credentials` are skipped when either is absent
- WDIO `waitforTimeout`: 15000ms; Cucumber step timeout: 60000ms
- Allure results to `allure-results/`; generated report to `allure-report/`
- No Claude/AI in git commits or contributor lists
- Repo name: `wdio-cucumber-suite`

## Review Focus

- `@needs_credentials` scenarios must skip cleanly (not fail) when secrets absent — Before hook must return `'skipped'` before any page interaction
- Contact form submit triggers a browser alert that must be accepted before the success message is visible — alert handling must run inside `ContactPage.submit()`
- Registration navigates to `/signup` after `LoginPage.fillSignup()` — `RegistrationPage` must call `browser.url` check to confirm it landed there before interacting
- Cart item count assertion must handle the case where `get_cart_item_names` returns an empty array when session doesn't persist — `CartPage.getCartItemNames()` must return an empty array (not throw) on no items
- Product search for zero results must assert `=== 0` not `>= 0` — `product.steps.js` step `I should see {count} products` must use strict equality

---

## File Map

```
wdio-cucumber-suite/
├── features/
│   ├── login.feature
│   ├── registration.feature
│   ├── product_search.feature
│   ├── cart.feature
│   ├── checkout.feature
│   └── contact.feature
├── steps/
│   ├── login.steps.js
│   ├── registration.steps.js
│   ├── product.steps.js
│   ├── cart.steps.js
│   ├── checkout.steps.js
│   └── contact.steps.js
├── pages/
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── RegistrationPage.js
│   ├── HomePage.js
│   ├── CartPage.js
│   ├── CheckoutPage.js
│   └── ContactPage.js
├── support/
│   ├── hooks.js
│   └── testData.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/superpowers/plans/2026-11-16-wdio-cucumber-suite.md
├── .env.example
├── .gitignore
├── wdio.conf.js
├── package.json
└── README.md
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `wdio.conf.js`
- Create: `support/testData.js`
- Create: `.env.example`
- Create: `.gitignore`
- Create all empty directories: `features/`, `steps/`, `pages/`, `support/`, `.github/workflows/`

**Interfaces:**
- Produces: `wdio run wdio.conf.js` command wired up; `npm test` runs all features; `npm run test:headless` sets `HEADLESS=true`

- [ ] **Step 1: Create `package.json`**

  `name`: `wdio-cucumber-suite`, `version`: `1.0.0`, `private`: true.
  Scripts: `"test": "wdio run wdio.conf.js"`, `"test:headless": "HEADLESS=true wdio run wdio.conf.js"`, `"report": "allure generate allure-results --clean -o allure-report"`, `"report:open": "allure open allure-report"`.
  devDependencies (all `^9.x` for wdio packages, `^10.x` for cucumber):
  `@wdio/cli`, `@wdio/local-runner`, `@wdio/cucumber-framework`, `@wdio/spec-reporter`, `@wdio/allure-reporter`, `@wdio/chromedriver-service`, `@cucumber/cucumber`, `allure-commandline`, `dotenv`.

- [ ] **Step 2: Create `wdio.conf.js`**

  Top of file: `require('dotenv').config();`
  `exports.config` with these exact values:
  - `runner: 'local'`
  - `specs: ['./features/**/*.feature']`
  - `maxInstances: 1`
  - `capabilities: [{ browserName: 'chrome', 'goog:chromeOptions': { args: process.env.HEADLESS === 'true' ? ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'] : [] } }]`
  - `logLevel: 'warn'`
  - `baseUrl: process.env.BASE_URL || 'https://automationexercise.com'`
  - `waitforTimeout: 15000`
  - `connectionRetryTimeout: 120000`
  - `connectionRetryCount: 3`
  - `services: ['chromedriver']`
  - `framework: 'cucumber'`
  - `reporters: ['spec', ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: true }]]`
  - `cucumberOpts: { require: ['./steps/**/*.js', './support/hooks.js'], timeout: 60000, tagExpression: process.env.TAGS || '' }`

- [ ] **Step 3: Create `support/testData.js`**

  Export a plain object:
  - `validUser`: `{ email: process.env.TEST_EMAIL || '', password: process.env.TEST_PASSWORD || '' }`
  - `invalidUser`: `{ email: 'wrong@example.com', password: 'wrongpass999' }`
  - `newUser`: `{ name: 'Portfolio QA' }`
  - `payment`: `{ name: 'Test User QA', cardNumber: '4111111111111111', cvc: '111', expiryMonth: '12', expiryYear: '2027' }`
  - `contact`: `{ name: 'Tresa QA', email: 'tresa.qa@test.com', subject: 'Portfolio Test', message: 'Automated test message from WDIO framework.' }`

- [ ] **Step 4: Create `.env.example`**

  ```
  BASE_URL=https://automationexercise.com
  TEST_EMAIL=your_email@example.com
  TEST_PASSWORD=your_password
  HEADLESS=false
  TAGS=
  ```

- [ ] **Step 5: Create `.gitignore`**

  Include: `node_modules/`, `allure-results/`, `allure-report/`, `.env`, `*.log`

- [ ] **Step 6: Install dependencies and verify scaffold**

  ```bash
  cd /path/to/wdio-cucumber-suite
  npm install
  ```

  Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add package.json package-lock.json wdio.conf.js support/testData.js .env.example .gitignore
  git commit -m "chore: scaffold WDIO 9 Cucumber project"
  ```

---

## Task 2: Login Domain

**Files:**
- Create: `pages/BasePage.js`
- Create: `pages/LoginPage.js`
- Create: `features/login.feature`
- Create: `steps/login.steps.js`

**Interfaces:**
- Produces: `LoginPage.open()`, `LoginPage.login(email, password)`, `LoginPage.fillSignup(name, email)`, `LoginPage.isLoggedIn() → Promise<boolean>`, `LoginPage.getErrorMessage() → Promise<string>`, `LoginPage.getSignupError() → Promise<string>`
- Consumed by: Task 3 (RegistrationPage after signup redirect), Task 5 (login before checkout)

- [ ] **Step 1: Write `features/login.feature`**

  ```gherkin
  Feature: User Login

    @needs_credentials
    Scenario: Login with valid credentials
      Given I navigate to the login page
      When I login with email "valid" and password "valid"
      Then I should be logged in successfully

    Scenario: Login with invalid credentials
      Given I navigate to the login page
      When I login with email "wrong@example.com" and password "differentwrongpass999"
      Then I should see the login error "Your email or password is incorrect!"

    Scenario: Login with empty credentials stays on login page
      Given I navigate to the login page
      When I submit login with empty credentials
      Then I should remain on the login page
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/login.feature
  ```

  Expected: scenarios marked as `Undefined` or `Pending` — no step implementations yet.

- [ ] **Step 3: Implement `pages/BasePage.js`**

  Class `BasePage` with:
  - `async open(path)` — calls `browser.url(path)`
  - `async waitForVisible(selector, timeout = 15000)` — `$(selector).waitForDisplayed({ timeout })`

  `module.exports = BasePage;`

- [ ] **Step 4: Implement `pages/LoginPage.js`**

  `class LoginPage extends BasePage`. Singleton export: `module.exports = new LoginPage()`.

  Getters (each returns `$(selector)`):
  - `emailInput` → `[data-qa='login-email']`
  - `passwordInput` → `[data-qa='login-password']`
  - `loginBtn` → `[data-qa='login-button']`
  - `errorMsg` → `//p[contains(text(),'Your email or password is incorrect')]` (XPath)
  - `logoutLink` → `a[href='/logout']`
  - `signupName` → `[data-qa='signup-name']`
  - `signupEmail` → `[data-qa='signup-email']`
  - `signupBtn` → `[data-qa='signup-button']`
  - `signupError` → `//p[contains(text(),'Email Address already exist')]` (XPath)

  Methods:
  - `async open()` → `super.open('/login')`
  - `async login(email, password)` → setValue on emailInput and passwordInput, click loginBtn
  - `async fillSignup(name, email)` → setValue on signupName and signupEmail, click signupBtn
  - `async isLoggedIn()` → `(await this.logoutLink).isDisplayed()`
  - `async getErrorMessage()` → waitForDisplayed on errorMsg, then getText
  - `async getSignupError()` → waitForDisplayed on signupError, then getText

- [ ] **Step 5: Implement `steps/login.steps.js`**

  Imports: `{ Given, When, Then }` from `@cucumber/cucumber`; `LoginPage` from `../pages/LoginPage`; `testData` from `../support/testData`.

  Steps (exact text must match feature file):
  - `Given('I navigate to the login page', ...)` → `LoginPage.open()`
  - `When('I login with email {string} and password {string}', ...)` → resolves `"valid"` → testData.validUser; calls `LoginPage.login(email, password)`
  - `When('I submit login with empty credentials', ...)` → click `LoginPage.loginBtn` without filling fields
  - `Then('I should be logged in successfully', ...)` → `assert.ok(await LoginPage.isLoggedIn())`
  - `Then('I should see the login error {string}', ...)` → `assert.ok((await LoginPage.getErrorMessage()).includes(expected))`
  - `Then('I should remain on the login page', ...)` → `assert.ok((await browser.getUrl()).includes('/login'))`

- [ ] **Step 6: Run login feature**

  ```bash
  npx wdio run wdio.conf.js --spec features/login.feature
  ```

  Expected: 2 non-credential scenarios pass; `@needs_credentials` skipped (hook not yet wired — may show pending, that is acceptable here; it will be fixed in Task 8).

- [ ] **Step 7: Commit**

  ```bash
  git add features/login.feature steps/login.steps.js pages/BasePage.js pages/LoginPage.js
  git commit -m "feat: add login feature with page object"
  ```

---

## Task 3: Registration Domain

**Files:**
- Create: `pages/RegistrationPage.js`
- Create: `features/registration.feature`
- Create: `steps/registration.steps.js`

**Interfaces:**
- Consumes: `LoginPage.fillSignup(name, email)` from Task 2
- Produces: `RegistrationPage.completeRegistration(password)`, `RegistrationPage.isRegistered() → Promise<boolean>`

- [ ] **Step 1: Write `features/registration.feature`**

  ```gherkin
  Feature: User Registration

    Scenario: Register a new account with unique email
      Given I navigate to the login page
      When I sign up with a unique email and name "Portfolio QA"
      Then I should see the account created confirmation

    Scenario: Register with an already-used email shows error
      Given I navigate to the login page
      When I sign up with email "wrong@example.com" and name "Any Name"
      Then I should see the signup error "Email Address already exist!"
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/registration.feature
  ```

  Expected: steps that are shared with login.steps.js resolve; unique registration steps are `Undefined`.

- [ ] **Step 3: Implement `pages/RegistrationPage.js`**

  `class RegistrationPage extends BasePage`. Singleton export.

  Getters:
  - `password` → `[data-qa='password']`
  - `firstName` → `[data-qa='first_name']`
  - `lastName` → `[data-qa='last_name']`
  - `address` → `[data-qa='address']`
  - `state` → `[data-qa='state']`
  - `city` → `[data-qa='city']`
  - `zipcode` → `[data-qa='zipcode']`
  - `mobile` → `[data-qa='mobile_number']`
  - `createAccountBtn` → `[data-qa='create-account']`
  - `accountCreatedMsg` → `[data-qa='account-created'] b`

  Methods:
  - `async completeRegistration(password = 'Test@1234')` — fills password, firstName (`Test`), lastName (`User`), address (`123 Test Street`), state (`TestState`), city (`TestCity`), zipcode (`12345`), mobile (`1234567890`), clicks createAccountBtn, waits for accountCreatedMsg to be displayed
  - `async isRegistered()` → `(await this.accountCreatedMsg).isDisplayed()`

- [ ] **Step 4: Implement `steps/registration.steps.js`**

  Imports: `{ When, Then }` from `@cucumber/cucumber`; `LoginPage`, `RegistrationPage`, `testData`.

  `Given('I navigate to the login page', ...)` is already defined in `login.steps.js` — do NOT redefine it.

  Steps:
  - `When('I sign up with a unique email and name {string}', ...)` → generates `qaauto${Date.now()}@mailinator.com`; calls `LoginPage.fillSignup(name, uniqueEmail)`; then `RegistrationPage.completeRegistration()`
  - `When('I sign up with email {string} and name {string}', ...)` → calls `LoginPage.fillSignup(name, email)` only (no registration page navigation)
  - `Then('I should see the account created confirmation', ...)` → `assert.ok(await RegistrationPage.isRegistered())`
  - `Then('I should see the signup error {string}', ...)` → `assert.ok((await LoginPage.getSignupError()).includes(expected))`

- [ ] **Step 5: Run registration feature**

  ```bash
  npx wdio run wdio.conf.js --spec features/registration.feature
  ```

  Expected: both scenarios pass.

- [ ] **Step 6: Commit**

  ```bash
  git add features/registration.feature steps/registration.steps.js pages/RegistrationPage.js
  git commit -m "feat: add registration feature with page object"
  ```

---

## Task 4: Product Search Domain

**Files:**
- Create: `pages/HomePage.js`
- Create: `features/product_search.feature`
- Create: `steps/product.steps.js`

**Interfaces:**
- Produces: `HomePage.open()`, `HomePage.search(keyword)`, `HomePage.getProductNames() → Promise<string[]>`, `HomePage.addFirstProductToCart()`
- Consumed by: Task 5 (cart), Task 6 (checkout)

- [ ] **Step 1: Write `features/product_search.feature`**

  ```gherkin
  Feature: Product Search

    Scenario: Search returns results for valid keyword
      Given I am on the home page
      When I search for "Top"
      Then I should see at least 1 product in the results

    Scenario: Search returns no results for unknown keyword
      Given I am on the home page
      When I search for "xyznonexistent999"
      Then I should see 0 products in the results
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/product_search.feature
  ```

  Expected: `Undefined` for all steps.

- [ ] **Step 3: Implement `pages/HomePage.js`**

  `class HomePage extends BasePage`. Singleton export.

  Getters:
  - `searchInput` → `#search_product`
  - `searchBtn` → `#submit_search`
  - `productNames` → `$$('.productinfo p')` (note `$$` for multiple elements)
  - `productItems` → `$$('.product-image-wrapper')`
  - `addToCartOverlayBtns` → `$$('.product-overlay .add-to-cart')`
  - `modalContinueBtn` → `$('.modal-footer .btn-success')`

  Methods:
  - `async open()` → `super.open('/')`
  - `async search(keyword)` — navigate to `/products` if not already there; setValue on searchInput; click searchBtn; wait for productNames or timeout gracefully
  - `async getProductNames()` — map `$$('.productinfo p')` getText for each; filter empty strings; return array
  - `async addFirstProductToCart()` — scroll first productItems[0] into view via `browser.execute`; hover via `browser.action('pointer')` move; click first addToCartOverlayBtns element; if modalContinueBtn appears within 3000ms click it, otherwise continue

- [ ] **Step 4: Implement `steps/product.steps.js`**

  Imports: `{ Given, When, Then }` from `@cucumber/cucumber`; `HomePage`.

  Steps:
  - `Given('I am on the home page', ...)` → `HomePage.open()`
  - `When('I search for {string}', ...)` → `HomePage.search(keyword)`
  - `Then('I should see at least {int} product in the results', ...)` → `assert.ok((await HomePage.getProductNames()).length >= count)`
  - `Then('I should see {int} products in the results', ...)` → `assert.strictEqual((await HomePage.getProductNames()).length, count)`

- [ ] **Step 5: Run product search feature**

  ```bash
  npx wdio run wdio.conf.js --spec features/product_search.feature
  ```

  Expected: both scenarios pass.

- [ ] **Step 6: Commit**

  ```bash
  git add features/product_search.feature steps/product.steps.js pages/HomePage.js
  git commit -m "feat: add product search feature with page object"
  ```

---

## Task 5: Cart Domain

**Files:**
- Create: `pages/CartPage.js`
- Create: `features/cart.feature`
- Create: `steps/cart.steps.js`

**Interfaces:**
- Consumes: `HomePage.addFirstProductToCart()` (Task 4)
- Produces: `CartPage.open()`, `CartPage.getCartItemNames() → Promise<string[]>`, `CartPage.proceedToCheckout()`
- Consumed by: Task 6 (checkout)

- [ ] **Step 1: Write `features/cart.feature`**

  ```gherkin
  Feature: Shopping Cart

    Scenario: Add product to cart increases cart count
      Given I am on the home page
      When I add the first visible product to cart
      And I navigate to the cart page
      Then I should see at least 1 item in the cart

    Scenario: Cart shows correct product name
      Given I am on the home page
      When I add the first visible product to cart
      And I navigate to the cart page
      Then the cart item names list should not be empty
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/cart.feature
  ```

  Expected: `Given I am on the home page` and `When I add the first visible product to cart` resolve from `product.steps.js`; cart-specific steps are `Undefined`.

- [ ] **Step 3: Implement `pages/CartPage.js`**

  `class CartPage extends BasePage`. Singleton export.

  Getters:
  - `cartItemNames` → `$$('.cart_description h4 a')`
  - `proceedCheckoutBtn` → `$('a.btn.check_out')`

  Methods:
  - `async open()` → `super.open('/view_cart')`
  - `async getCartItemNames()` — map `$$('.cart_description h4 a')` getText; filter empty; return array (return `[]` if none, never throw)
  - `async proceedToCheckout()` → click `proceedCheckoutBtn`

- [ ] **Step 4: Implement `steps/cart.steps.js`**

  Imports: `{ When, Then }` from `@cucumber/cucumber`; `HomePage`, `CartPage`.

  `Given('I am on the home page', ...)` already defined in `product.steps.js` — do NOT redefine.

  Steps:
  - `When('I add the first visible product to cart', ...)` → `HomePage.addFirstProductToCart()`
  - `When('I navigate to the cart page', ...)` → `CartPage.open()`
  - `Then('I should see at least {int} item in the cart', ...)` → `assert.ok((await CartPage.getCartItemNames()).length >= count)`
  - `Then('the cart item names list should not be empty', ...)` → `assert.ok((await CartPage.getCartItemNames()).length > 0)`

- [ ] **Step 5: Run cart feature**

  ```bash
  npx wdio run wdio.conf.js --spec features/cart.feature
  ```

  Expected: both scenarios pass.

- [ ] **Step 6: Commit**

  ```bash
  git add features/cart.feature steps/cart.steps.js pages/CartPage.js
  git commit -m "feat: add cart feature with page object"
  ```

---

## Task 6: Checkout Domain

**Files:**
- Create: `pages/CheckoutPage.js`
- Create: `features/checkout.feature`
- Create: `steps/checkout.steps.js`

**Interfaces:**
- Consumes: `LoginPage.login()` (Task 2), `HomePage.addFirstProductToCart()` (Task 4), `CartPage.proceedToCheckout()` (Task 5)
- Produces: `CheckoutPage.confirmOrder()`, `CheckoutPage.getSuccessMessage() → Promise<string>`

- [ ] **Step 1: Write `features/checkout.feature`**

  ```gherkin
  Feature: Checkout Flow

    @needs_credentials
    Scenario: Logged-in user can complete checkout
      Given I am logged in as a registered user
      And I have a product in my cart
      When I proceed to checkout from cart
      And I confirm and pay for the order
      Then I should see the order placed confirmation
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/checkout.feature
  ```

  Expected: steps `Undefined` (hook not yet wired, may show as failed rather than skipped — acceptable at this stage).

- [ ] **Step 3: Implement `pages/CheckoutPage.js`**

  `class CheckoutPage extends BasePage`. Singleton export.

  Getters:
  - `placeOrderBtn` → `a[href='/payment']`
  - `cardName` → `[data-qa='name-on-card']`
  - `cardNumber` → `[data-qa='card-number']`
  - `cvc` → `[data-qa='cvc']`
  - `expiryMonth` → `[data-qa='expiry-month']`
  - `expiryYear` → `[data-qa='expiry-year']`
  - `payBtn` → `[data-qa='pay-button']`
  - `successMsg` → `[data-qa='order-placed']`

  Methods:
  - `async confirmOrder()` — clicks placeOrderBtn; fills card fields using `testData.payment` values; clicks payBtn
  - `async getSuccessMessage()` → waitForDisplayed on successMsg; getText

- [ ] **Step 4: Implement `steps/checkout.steps.js`**

  Imports: `{ Given, When, Then }` from `@cucumber/cucumber`; `LoginPage`, `HomePage`, `CartPage`, `CheckoutPage`, `testData`.

  Steps:
  - `Given('I am logged in as a registered user', ...)` → `LoginPage.open()`; `LoginPage.login(testData.validUser.email, testData.validUser.password)`; assert `isLoggedIn()`
  - `Given('I have a product in my cart', ...)` → `HomePage.open()`; `HomePage.addFirstProductToCart()`
  - `When('I proceed to checkout from cart', ...)` → `CartPage.open()`; `CartPage.proceedToCheckout()`
  - `When('I confirm and pay for the order', ...)` → `CheckoutPage.confirmOrder()`
  - `Then('I should see the order placed confirmation', ...)` → `assert.ok((await CheckoutPage.getSuccessMessage()).length > 0)`

- [ ] **Step 5: Run checkout feature (expects skip — hook wired in Task 8)**

  ```bash
  npx wdio run wdio.conf.js --spec features/checkout.feature
  ```

  Expected: If `TEST_EMAIL` is set, scenario runs and passes. If not set, scenario may fail (hook not yet wired — acceptable, will be fixed in Task 8).

- [ ] **Step 6: Commit**

  ```bash
  git add features/checkout.feature steps/checkout.steps.js pages/CheckoutPage.js
  git commit -m "feat: add checkout feature with page object"
  ```

---

## Task 7: Contact Domain

**Files:**
- Create: `pages/ContactPage.js`
- Create: `features/contact.feature`
- Create: `steps/contact.steps.js`

**Interfaces:**
- Produces: `ContactPage.open()`, `ContactPage.fillForm(name, email, subject, message)`, `ContactPage.submit()`, `ContactPage.getSuccessMessage() → Promise<string>`

- [ ] **Step 1: Write `features/contact.feature`**

  ```gherkin
  Feature: Contact Form

    Scenario: Submit contact form with valid data
      Given I navigate to the contact page
      When I fill in the contact form with valid details
      And I submit the contact form
      Then I should see the contact success message
  ```

- [ ] **Step 2: Run to confirm undefined steps**

  ```bash
  npx wdio run wdio.conf.js --spec features/contact.feature
  ```

  Expected: all steps `Undefined`.

- [ ] **Step 3: Implement `pages/ContactPage.js`**

  `class ContactPage extends BasePage`. Singleton export.

  Getters:
  - `nameInput` → `[data-qa='name']`
  - `emailInput` → `[data-qa='email']`
  - `subjectInput` → `[data-qa='subject']`
  - `messageInput` → `[data-qa='message']`
  - `submitBtn` → `[data-qa='submit-button']`
  - `successMsg` → `$('.contact-form .alert-success')`

  Methods:
  - `async open()` → `super.open('/contact_us')`
  - `async fillForm(name, email, subject, message)` → setValue on each field
  - `async submit()` — click submitBtn; then `browser.acceptAlert()` (handles the JS confirm dialog); wait for successMsg to be displayed
  - `async getSuccessMessage()` → getText on successMsg

- [ ] **Step 4: Implement `steps/contact.steps.js`**

  Imports: `{ Given, When, Then }` from `@cucumber/cucumber`; `ContactPage`, `testData`.

  Steps:
  - `Given('I navigate to the contact page', ...)` → `ContactPage.open()`
  - `When('I fill in the contact form with valid details', ...)` → `ContactPage.fillForm(testData.contact.name, testData.contact.email, testData.contact.subject, testData.contact.message)`
  - `When('I submit the contact form', ...)` → `ContactPage.submit()`
  - `Then('I should see the contact success message', ...)` → `assert.ok((await ContactPage.getSuccessMessage()).toLowerCase().includes('success'))`

- [ ] **Step 5: Run contact feature**

  ```bash
  npx wdio run wdio.conf.js --spec features/contact.feature
  ```

  Expected: scenario passes.

- [ ] **Step 6: Commit**

  ```bash
  git add features/contact.feature steps/contact.steps.js pages/ContactPage.js
  git commit -m "feat: add contact feature with page object"
  ```

---

## Task 8: Hooks — Credential Skip + Screenshot on Failure

**Files:**
- Create: `support/hooks.js`

**Interfaces:**
- Consumes: `@cucumber/cucumber` `Before`/`After` hooks; `browser.takeScreenshot()` WDIO global
- Produces: `@needs_credentials` scenarios skip cleanly when `TEST_EMAIL` absent; failed scenarios attach a screenshot to the Allure report

- [ ] **Step 1: Implement `support/hooks.js`**

  ```js
  const { Before, After, Status } = require('@cucumber/cucumber');

  Before({ tags: '@needs_credentials' }, async function () {
    if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
      return 'skipped';
    }
  });

  After(async function (scenario) {
    if (scenario.result && scenario.result.status === Status.FAILED) {
      const screenshot = await browser.takeScreenshot();
      await this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
    }
  });
  ```

  `hooks.js` is already listed in `wdio.conf.js` `cucumberOpts.require` from Task 1 — no config change needed.

- [ ] **Step 2: Run full suite to verify skip behaviour**

  Without setting `TEST_EMAIL`:
  ```bash
  npx wdio run wdio.conf.js
  ```

  Expected: `@needs_credentials` scenarios show as `Skipped`; all other scenarios pass.

- [ ] **Step 3: Commit**

  ```bash
  git add support/hooks.js
  git commit -m "feat: add credential-skip and screenshot-on-failure hooks"
  ```

---

## Task 9: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Triggers on: push to `main`, PRs to `main`, `workflow_dispatch`
- Uses secrets: `TEST_EMAIL`, `TEST_PASSWORD`
- Publishes Allure report to GitHub Pages on `main` push

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

  ```yaml
  name: WDIO Cucumber Tests

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
    workflow_dispatch:

  concurrency:
    group: pages
    cancel-in-progress: true

  permissions:
    contents: read
    pages: write
    id-token: write

  jobs:
    test:
      runs-on: ubuntu-latest
      env:
        HEADLESS: "true"
        BASE_URL: https://automationexercise.com
        TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
        TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}

      steps:
        - uses: actions/checkout@v4

        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'

        - name: Install dependencies
          run: npm ci

        - name: Run tests
          run: npm test

        - name: Generate Allure report
          if: always()
          run: npm run report

        - name: Upload report artifact
          uses: actions/upload-artifact@v4
          if: always()
          with:
            name: allure-report
            path: allure-report/
            retention-days: 14

        - name: Deploy report to GitHub Pages
          uses: peaceiris/actions-gh-pages@v4
          if: github.ref == 'refs/heads/main' && always()
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: allure-report
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add .github/workflows/ci.yml
  git commit -m "ci: add GitHub Actions workflow with Allure report deploy"
  ```

---

## Task 10: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

  Include these sections:
  1. **Title + one-line description** — "WDIO Cucumber Suite — WebdriverIO 9 BDD E2E tests for automationexercise.com"
  2. **CI badge** — `![WDIO Cucumber Tests](https://github.com/tresajohn/wdio-cucumber-suite/actions/workflows/ci.yml/badge.svg)`
  3. **Tech stack** — table: WebdriverIO 9, @wdio/cucumber-framework, JavaScript, @wdio/allure-reporter, GitHub Actions
  4. **Features coverage** — table with Feature | Scenarios | Tag columns for all 6 feature files
  5. **Project structure** — the file map from this plan (abbreviated)
  6. **Setup** — clone, `npm install`, copy `.env.example` to `.env`, fill credentials
  7. **Running tests** — `npm test` (headed), `npm run test:headless` (headless), `TAGS=@smoke npm test` (by tag)
  8. **Reports** — `npm run report` → `npm run report:open`
  9. **CI** — brief note on GitHub Actions, secrets required (`TEST_EMAIL`, `TEST_PASSWORD`), report published to GitHub Pages

- [ ] **Step 2: Commit**

  ```bash
  git add README.md
  git commit -m "docs: add README"
  ```

---

## Task 11: Create GitHub Repo and Push

**Files:** none — repo creation and push only

- [ ] **Step 1: Create public repo on GitHub**

  ```bash
  gh repo create tresajohn/wdio-cucumber-suite --public --description "WebdriverIO 9 Cucumber BDD E2E suite for automationexercise.com — POM, Allure reports, GitHub Actions CI"
  ```

- [ ] **Step 2: Set remote and push**

  ```bash
  git remote add origin https://github.com/tresajohn/wdio-cucumber-suite.git
  git push -u origin main
  ```

- [ ] **Step 3: Confirm CI triggered and passes**

  ```bash
  gh run watch --repo tresajohn/wdio-cucumber-suite
  ```

  Expected: workflow run starts; all non-credential scenarios pass; `@needs_credentials` scenarios skipped (secrets not yet set).

- [ ] **Step 4: (Optional) Add TEST_EMAIL and TEST_PASSWORD secrets**

  ```bash
  gh secret set TEST_EMAIL --repo tresajohn/wdio-cucumber-suite
  gh secret set TEST_PASSWORD --repo tresajohn/wdio-cucumber-suite
  ```

  Re-run workflow via `gh workflow run ci.yml --repo tresajohn/wdio-cucumber-suite` to verify credential scenarios pass.
