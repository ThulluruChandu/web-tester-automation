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
  test.beforeEach(async ({ page }) => {
    await page.goto(WIKI_HOME);
  });

  test('TC01 - Wikipedia homepage loads and search is available', async ({ page }) => {
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();
  });

  test('TC02 - Search India, verify capital is New Delhi, then navigate back to home', async ({ page }) => {
    await searchFromHome(page, 'India');

    await expect(page.getByRole('heading', { name: 'India' })).toBeVisible();
    const capital = await getInfoboxCapital(page);
    expect(capital).toMatch(/New Delhi/i);

    // Navigate back to Wikipedia home (do not repeat the same search in other tests)
    await page.goBack();
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();
  });

  test('TC03 - Search United Kingdom and verify the capital is not Eastern Cape (negative test case)', async ({ page }) => {
    await searchFromHome(page, 'United Kingdom');

    await expect(page.getByRole('heading', { name: 'United Kingdom' })).toBeVisible();

    const capital = await getInfoboxCapital(page);

    // Story expectation: UK capital should NOT be "Eastern Cape"
    expect(capital).not.toMatch(/Eastern Cape/i);

    // Extra safety assertion (expected current real-world value)
    expect(capital).toMatch(/London/i);

    ensureArtifactsDir();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'kan-5-uk-capital.png'), fullPage: true });
  });
});
