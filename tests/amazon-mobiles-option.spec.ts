import { test, expect } from '@playwright/test';

test.describe('Amazon.com navigation', () => {
  test('Check whether "Mobiles" option is present', async ({ page }) => {
    await page.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded' });

    // Handle possible cookie/consent prompts (best-effort).
    const acceptCookies = page
      .getByRole('button', { name: /accept/i })
      .or(page.getByRole('button', { name: /agree/i }))
      .or(page.locator('#sp-cc-accept'));

    if (await acceptCookies.first().isVisible().catch(() => false)) {
      await acceptCookies.first().click();
    }

    // "Mobiles" may appear as a top nav link or inside the hamburger menu depending on region/experiment.
    const mobilesLink = page
      .getByRole('link', { name: /mobiles/i })
      .or(page.locator('a:has-text("Mobiles")'));

    const mobilesCount = await mobilesLink.count();
    expect(mobilesCount, 'Expected to find a "Mobiles" option on Amazon.com').toBeGreaterThan(0);

    // Close the browser/page as requested.
    await page.close();
  });
});
