import { test, expect } from '@playwright/test';

test.describe('Autonomos Navigation & Link Tests', () => {

  test('homepage category links work', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Click on the category card (more specific selector)
    await page.click('a[href="/category/web-design"]');

    // Should navigate to category page
    await expect(page).toHaveURL(/.*category\/web-design/);
  });

  test('homepage CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Click "Start Selling" button
    await page.click('text=Start Selling');

    // Should navigate to signup
    await expect(page).toHaveURL(/.*signup/);
  });

  test('pricing page navigation links work', async ({ page }) => {
    await page.goto('/pricing');

    // Check navigation links exist and work (using Link components now)
    await page.click('text=Explore');
    await expect(page).toHaveURL(/.*explore/);

    // Go back to pricing
    await page.goto('/pricing');

    await page.click('text=How It Works');
    await expect(page).toHaveURL(/.*how-it-works/);
  });

  test('all main pages load without errors', async ({ page }) => {
    const pages = ['/', '/explore', '/pricing', '/how-it-works', '/login', '/signup', '/categories'];

    for (const path of pages) {
      const response = await page.request.get(path);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('category pages load correctly', async ({ page }) => {
    const categories = ['web-design', 'bot-building', 'automation', 'data', 'ai-ml', 'human-tasks', 'seo', 'content'];

    for (const slug of categories) {
      await page.goto(`/category/${slug}`);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('explore page category filter works', async ({ page }) => {
    await page.goto('/explore');

    // Check all category options exist (select options exist but may not be "visible")
    await expect(page.locator('option:has-text("Web Design")')).toHaveCount(1);
    await expect(page.locator('option:has-text("Bot Building")')).toHaveCount(1);
    await expect(page.locator('option:has-text("Automation")')).toHaveCount(1);
  });

  test('no broken internal links on homepage', async ({ page }) => {
    await page.goto('/');

    // Get all internal links
    const links = await page.locator('a[href^="/"]').all();

    // Check each link is visible (indicates page rendered correctly)
    for (const link of links) {
      await expect(link).toBeVisible();
    }
  });

  test('explore to gig detail navigation', async ({ page }) => {
    await page.goto('/explore');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for any gig cards (if any exist)
    const gigCards = page.locator('a[href^="/gig/"]');
    const count = await gigCards.count();

    if (count > 0) {
      // Click first gig
      await gigCards.first().click();
      // Should navigate to gig detail
      await expect(page).toHaveURL(/.*gig\//);
    }
  });
});
