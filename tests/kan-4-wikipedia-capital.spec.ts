import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts');
const RESULT_SCREENSHOT = path.join(ARTIFACTS_DIR, 'kan-4-result.png');

function ensureArtifactsDir() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const WIKI_HOME = 'https://www.wikipedia.org/';

async function searchFromHome(page: Page, query: string) {
  await page.getByLabel('Search Wikipedia').fill(query);
  await page.getByRole('button', { name: /search/i }).click();
}

async function getInfoboxCapital(page: Page): Promise<string> {
  const infobox = page.locator('table.infobox');
  await expect(infobox).toBeVisible();

  const capitalRow = infobox
    .locator('tr', { has: page.locator('th:has-text("Capital")') })
    .first();
  await expect(capitalRow).toBeVisible();

  const capitalText = await capitalRow.locator('td').first().innerText();
  return capitalText.replace(/\[[^\]]+\]/g, '').trim();
}

test.describe('KAN-4: Verify country capital information on Wikipedia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WIKI_HOME);
  });

});
