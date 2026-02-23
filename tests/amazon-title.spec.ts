import { test, expect } from '@playwright/test';

test.describe('Amazon - page title', () => {
  test('navigate to Amazon and capture the title', async ({ page }) => {
    await page.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded' });

    // Amazon may show a region banner/cookie dialog or bot-check; keep the assertion resilient.
    const title = await page.title();
    console.log(`Amazon page title: ${title}`);

    expect(title.trim().length).toBeGreaterThan(0);
    expect(title).toMatch(/amazon|robot check/i);
  });
});
