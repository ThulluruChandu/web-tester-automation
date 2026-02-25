import { test, expect } from '@playwright/test';

const WIKI_HOME = 'https://www.wikipedia.org/';

test.describe('KAN-2: Verify country capital information on Wikipedia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WIKI_HOME);
  });

  // Test cases are added below.
});
