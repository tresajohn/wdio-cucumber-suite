# WDIO Cucumber Suite

WebdriverIO 8 + Cucumber BDD E2E test suite for [automationexercise.com](https://automationexercise.com)

![WDIO Cucumber Tests](https://github.com/tresajohn/wdio-cucumber-suite/actions/workflows/ci.yml/badge.svg)

## Tech Stack

| Tool | Version |
|------|---------|
| WebdriverIO | 8.x |
| @wdio/cucumber-framework | 8.x |
| Language | JavaScript (CommonJS) |
| Reporter | @wdio/allure-reporter |
| CI | GitHub Actions |

## Feature Coverage

| Feature | Scenarios | Tag |
|---------|-----------|-----|
| User Login | Valid login, invalid login, empty credentials | `@login` |
| User Registration | Register new account, duplicate email error | `@registration` |
| Product Search | Search with results, search with no results | `@product_search` |
| Shopping Cart | Add to cart, verify item name | `@cart` |
| Checkout Flow | Complete order (requires credentials) | `@checkout` `@needs_credentials` |
| Contact Form | Submit contact form | `@contact` |

Scenarios tagged `@needs_credentials` are automatically skipped when `TEST_EMAIL` / `TEST_PASSWORD` are not set.

## Project Structure

```
wdio-cucumber-suite/
├── features/          # Cucumber .feature files
├── steps/             # Step definitions (one file per domain)
├── pages/             # Page Object Model classes
├── support/
│   ├── hooks.js       # Before/After hooks (credential skip, screenshots)
│   └── testData.js    # Test data constants
├── .github/workflows/ # GitHub Actions CI
├── .env.example       # Environment variable template
└── wdio.conf.js       # WebdriverIO configuration
```

## Setup

```bash
git clone https://github.com/tresajohn/wdio-cucumber-suite.git
cd wdio-cucumber-suite
npm install
cp .env.example .env
# Edit .env and fill in TEST_EMAIL and TEST_PASSWORD
```

## Running Tests

```bash
# Headed (opens browser)
npm test

# Headless
npm run test:headless

# Run by tag
TAGS=@login npm test
TAGS=@smoke npm test
```

## Reports

```bash
# Generate Allure report
npm run report

# Open in browser
npm run report:open
```

## CI / GitHub Actions

Tests run automatically on every push and pull request to `main`. The workflow:

1. Installs Node 20 and dependencies
2. Runs the full suite headlessly
3. Generates an Allure report
4. Uploads the report as a build artifact (retained 14 days)
5. Deploys the report to GitHub Pages (on `main` push)

**Secrets required** for `@needs_credentials` scenarios to run:
- `TEST_EMAIL` — registered account email
- `TEST_PASSWORD` — registered account password

Without secrets, those scenarios are skipped and all other tests still run.
