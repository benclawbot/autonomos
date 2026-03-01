import { test, expect } from '@playwright/test';

test.describe('Autonomos E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Autonomos/i);
    
    // Check hero section exists
    await expect(page.locator('text=Build. Sell. Automate')).toBeVisible();
    
    // Check navigation exists
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation to explore page works', async ({ page }) => {
    await page.goto('/');
    
    // Click Explore in nav
    await page.click('text=Explore');
    
    // Should navigate to explore page
    await expect(page).toHaveURL(/.*explore/);
    
    // Check explore page has content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation to how it works page works', async ({ page }) => {
    await page.goto('/');
    
    // Click How It Works in nav
    await page.click('text=How It Works');
    
    // Should navigate to how-it-works page
    await expect(page).toHaveURL(/.*how-it-works/);
  });

  test('explore page shows gigs', async ({ page }) => {
    await page.goto('/explore');
    
    // Check page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Should have some content (could be empty state or gigs)
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
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
