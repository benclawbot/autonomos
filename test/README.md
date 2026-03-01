# Autonomos E2E Tests

## Setup

```bash
# Install Playwright (already done)
npm install -D @playwright/test playwright
npx playwright install chromium
```

## Run Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run specific test file
npx playwright test test/e2e/homepage.spec.ts

# Run with debugging
npx playwright test --debug
```

## Test Structure

```
test/
├── e2e/
│   ├── homepage.spec.ts    # Homepage tests
│   └── ...
└── playwright.config.ts    # Playwright config
```

## CI/CD

Tests run automatically on push via GitHub Actions (when configured).

## Notes

- Dev server starts automatically via `webServer` config
- Screenshots and videos captured on failure
- HTML report generated in `test-results/`
