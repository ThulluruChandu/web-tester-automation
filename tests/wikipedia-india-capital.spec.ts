import { test, expect } from '@playwright/test';

test('Wikipedia: India page shows capital as New Delhi', async ({ page }) => {
  await page.goto('https://www.wikipedia.org/');

  await page.locator('#searchInput').fill('India');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/wiki\/India/);

  const capitalRow = page.locator('table.infobox tr', {
    has: page.locator('th', { hasText: 'Capital' }),
  });
  await expect(capitalRow).toHaveCount(1);

  const capitalText = await capitalRow.locator('td').innerText();
  expect(capitalText).toContain('New Delhi');
});
