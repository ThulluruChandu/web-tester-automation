import { test, expect } from '@playwright/test';

test.describe('Flipkart menu - Fashion', () => {
  test('should show All option under Fashion menu', async ({ page }) => {
    // Step 1: Navigate to Flipkart
    await page.goto('https://www.flipkart.com/#', { waitUntil: 'domcontentloaded' });
  });
});
