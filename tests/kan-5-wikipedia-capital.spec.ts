import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts');
const RESULT_SCREENSHOT = path.join(ARTIFACTS_DIR, 'kan-5-result.png');

function ensureArtifactsDir() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const WIKI_HOME = 'https://www.wikipedia.org/';

async function searchFromHome(page: Page, query: string) {
  const searchBox = page.getByLabel('Search Wikipedia');
  await searchBox.fill(query);
  await searchBox.press('Enter');
}

async function getInfoboxCapital(page: Page): Promise<string> {
  const infobox = page.locator('table.infobox');
  await expect(infobox).toBeVisible();

  const capitalRow = infobox
    .locator('tr', { has: page.locator('th:has-text("Capital")') })
    .first();
  await expect(capitalRow).toBeVisible();

  const capitalText = await capitalRow.locator('td').first().innerText();
  const cleaned = capitalText.replace(/\[[^\]]+\]/g, '').trim();
  return cleaned.split('\n')[0].trim();
}

test.describe('KAN-5 - Verify country capital information on Wikipedia', () => {
  test('TC01-TC02: Verify capitals for India and United Kingdom within a single session', async ({ page }) => {
    ensureArtifactsDir();

    // Single browser session/window: navigate once, then perform both searches sequentially.
    await page.goto(WIKI_HOME);

    // TC01
    await searchFromHome(page, 'India');
    const indiaCapital = await getInfoboxCapital(page);
    await expect(indiaCapital).toBe('New Delhi');

    // Navigate back to Wikipedia home only once (as per AC)
    await page.goBack();
    await expect(page).toHaveURL(WIKI_HOME);

    // TC02 (as per AC text): expect "Eastern Cape" to be mentioned as capital
    // NOTE: This expectation is intentionally aligned to AC wording and should fail on Wikipedia.
    await searchFromHome(page, 'United Kingdom');
    const ukCapital = await getInfoboxCapital(page);
    await expect(ukCapital).toBe('Eastern Cape');

    await page.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });
});
