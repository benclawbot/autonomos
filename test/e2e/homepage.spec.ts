import { test, expect } from '@playwright/test';

test.describe('Autonomos E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Autonomos/i);

    // Check hero section - look for main heading text
    await expect(page.locator('text=Bots & Humans')).toBeVisible();

    // Check navigation exists
    await expect(page.locator('nav')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');

    // Check login form exists
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');

    // Check signup form exists
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');

    // Check pricing content exists
    await expect(page.locator('h1')).toBeVisible();
  });
});
