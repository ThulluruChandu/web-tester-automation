import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts');
const RESULT_SCREENSHOT = path.join(ARTIFACTS_DIR, 'kan-2-result.png');

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

test.describe('KAN-2: Verify country capital information on Wikipedia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WIKI_HOME);
  });

  test('TC01 - Wikipedia homepage loads and search is available', async ({ page }) => {
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();
  });

  test('TC02 - Search India and verify capital is New Delhi', async ({ page }) => {
    await searchFromHome(page, 'India');

    await expect(page.locator('#firstHeading')).toHaveText(/India/i);
    const capital = await getInfoboxCapital(page);

    expect(capital).toMatch(/New Delhi/i);
  });

  test('TC03 - Search United Kingdom and verify capital is NOT Eastern Cape (negative test)', async ({ page }) => {
    await searchFromHome(page, 'India');
    await page.goBack();

    await expect(page).toHaveURL(WIKI_HOME);

    await searchFromHome(page, 'United Kingdom');
    await expect(page.locator('#firstHeading')).toHaveText(/United Kingdom/i);

    const capital = await getInfoboxCapital(page);
    expect(capital).not.toMatch(/Eastern Cape/i);

    // Confluence attachment requires a resolvable file path in runtime.
    // Save screenshot to ./artifacts so pipeline/agent can reference it.
    ensureArtifactsDir();
    await page.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });
});
