import { test, expect, Page } from '@playwright/test';

async function closeAnyPopup(page: Page) {
  // Flipkart may show a login/sign-up modal on first load.
  const closeCandidates = [
    page.locator('button:has-text("✕")'),
    page.locator('button[aria-label="Close"]'),
    page.locator('._2doB4z'),
  ];

  for (const candidate of closeCandidates) {
    const visible = await candidate.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await candidate.first().click({ timeout: 5000 });
      break;
    }
  }
}

test.describe('Flipkart menu - Fashion', () => {
  test('should show All option under Fashion menu', async ({ page }) => {
    // Step 1: Navigate to Flipkart
    await page.goto('https://www.flipkart.com/#', { waitUntil: 'domcontentloaded' });

    // Step 2: Close the login popup if it appears
    await closeAnyPopup(page);

    // Step 3: Click on the "Fashion" option in the menu
    // Flipkart renders this top menu item as a non-link element (accessible label: "Fashion").
    await page.getByLabel('Fashion').click();

    // Step 4: Verify "All" option is present
    // "All" usually appears in the opened menu/drawer after clicking Fashion
    const allOption = page.getByRole('link', { name: /^All$/i }).first();
    await expect(allOption).toBeVisible({ timeout: 10000 });
  });
});
