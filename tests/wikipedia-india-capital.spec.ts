import { test, expect } from '@playwright/test';

test.describe('Wikipedia - India article', () => {
  test('should list capital as New Delhi', async ({ page }) => {
    await page.goto('https://www.wikipedia.org/');

    // Ensure English Wikipedia is used (stable article structure/selectors).
    const language = page.locator('select#searchLanguage');
    if (await language.count()) {
      await language.selectOption('en');
    }

    const searchInput = page.locator('input[name="search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('India');
    await searchInput.press('Enter');

    // Article page
    await expect(page.getByRole('heading', { name: 'India', exact: true })).toBeVisible();

    // Infobox "Capital" row
    const capitalCell = page
      .locator('table.infobox')
      .locator('tr', { has: page.locator('th:has-text("Capital")') })
      .locator('td');

    await expect(capitalCell.first()).toContainText('New Delhi');
  });
});
