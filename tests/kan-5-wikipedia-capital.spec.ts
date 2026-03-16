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

test.describe('KAN-5: Verify country capital information on Wikipedia', () => {
  test('TC01-TC04 - Verify Wikipedia capital info flow (single browser session)', async ({ page }) => {
    // TC01 - Wikipedia homepage loads and search is available
    await page.goto(WIKI_HOME);
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();

    // TC02 - Search India and verify capital is New Delhi
    await searchFromHome(page, 'India');
    await expect(page.getByRole('heading', { name: 'India' })).toBeVisible();
    const indiaCapital = await getInfoboxCapital(page);
    expect(indiaCapital).toMatch(/New Delhi/i);

    // TC03 - Navigate back to Wikipedia home from an article
    await page.goBack();
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();

    // TC04 - Search United Kingdom and verify capital is NOT Eastern Cape (negative test)
    await searchFromHome(page, 'United Kingdom');
    await expect(page.getByRole('heading', { name: 'United Kingdom' })).toBeVisible();

    const ukCapital = await getInfoboxCapital(page);
    expect(ukCapital).not.toMatch(/Eastern Cape/i);

    ensureArtifactsDir();
    await page.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });
});
