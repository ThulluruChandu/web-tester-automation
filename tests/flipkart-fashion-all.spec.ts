import { test, expect } from '@playwright/test';

test.describe('Flipkart menu - Fashion', () => {
  test('should show All option under Fashion menu', async ({ page }) => {
    // Step 1: Navigate to Flipkart
    await page.goto('https://www.flipkart.com/#', { waitUntil: 'domcontentloaded' });

    // Step 2: Close the login popup if it appears
    const loginModalClose = page.locator('button', { hasText: '✕' });
    if (await loginModalClose.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginModalClose.click();
    }

    // Step 3: Click on the "Fashion" option in the menu
    // (Top navigation typically uses links)
    const fashionLink = page.getByRole('link', { name: /fashion/i });
    await fashionLink.click();

    // Step 4: Verify "All" option is present
    // "All" usually appears in the opened menu/drawer after clicking Fashion
    const allOption = page.getByRole('link', { name: /^All$/i }).first();
    await expect(allOption).toBeVisible({ timeout: 10000 });
  });
});
