import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts');

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
  test('TC01 - Verify India capital is New Delhi; then UK capital is NOT Eastern Cape (single session)', async ({ page }) => {
    // Single browser session + single tab: navigate once, run all checks sequentially
    await page.goto(WIKI_HOME);
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();

    // Step 1: India
    await searchFromHome(page, 'India');
    await expect(page.getByRole('heading', { name: 'India' })).toBeVisible();
    const indiaCapital = await getInfoboxCapital(page);
    expect(indiaCapital).toMatch(/New Delhi/i);

    // Navigate back to home exactly once
    await page.goBack();
    await expect(page).toHaveURL(WIKI_HOME);

    // Step 2: United Kingdom (negative check)
    await searchFromHome(page, 'United Kingdom');
    await expect(page.getByRole('heading', { name: 'United Kingdom' })).toBeVisible();

    const ukCapital = await getInfoboxCapital(page);

    // Story expectation: UK capital should NOT be "Eastern Cape"
    expect(ukCapital).not.toMatch(/Eastern Cape/i);

    // Real-world sanity check
    expect(ukCapital).toMatch(/London/i);

    ensureArtifactsDir();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'kan-5-uk-capital.png'), fullPage: true });
  });
});
