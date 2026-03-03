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
  test('TC01: Search India and verify capital is New Delhi', async ({ page }) => {
    ensureArtifactsDir();

    await page.goto(WIKI_HOME);
    await searchFromHome(page, 'India');

    const capital = await getInfoboxCapital(page);
    await expect(capital).toBe('New Delhi');

    await page.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });

  test('TC02: Search United Kingdom and verify capital is NOT Eastern Cape (negative)', async ({ page }) => {
    await page.goto(WIKI_HOME);
    await searchFromHome(page, 'United Kingdom');

    const capital = await getInfoboxCapital(page);
    await expect(capital).not.toBe('Eastern Cape');

    // Optional stronger assertion to keep test valuable even if infobox format changes slightly.
    await expect(capital.toLowerCase()).toContain('london');
  });
});
