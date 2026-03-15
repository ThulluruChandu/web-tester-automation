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

test.describe('KAN-2: Verify country capital information on Wikipedia (single browser session)', () => {
  test('TC01 - Verify India capital and UK negative capital in one session', async ({ page }) => {
    // Browser-handling policy:
    // - one browser session (handled by Playwright worker)
    // - one page/tab
    // - no repeated navigation/search beyond what is required
    await page.goto(WIKI_HOME);
    await expect(page).toHaveURL(WIKI_HOME);

    // Search India and verify capital
    await searchFromHome(page, 'India');
    await expect(page.getByRole('heading', { name: 'India' })).toBeVisible();
    const indiaCapital = await getInfoboxCapital(page);
    expect(indiaCapital).toMatch(/New Delhi/i);

    // Reuse the Wikipedia article search box (no navigation back to home)
    await page.locator('input[name="search"]').fill('United Kingdom');
    await page.locator('input[name="search"]').press('Enter');

    await expect(page.getByRole('heading', { name: 'United Kingdom' })).toBeVisible();
    const ukCapital = await getInfoboxCapital(page);
    expect(ukCapital).not.toMatch(/Eastern Cape/i);

    // Confluence attachment requires a resolvable file path in runtime.
    ensureArtifactsDir();
    await page.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });
});
