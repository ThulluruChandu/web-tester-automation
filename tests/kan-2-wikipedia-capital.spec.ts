import { test, expect } from './fixtures/sharedPage';
import type { Page } from '@playwright/test';
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

test.describe.serial('KAN-2: Verify country capital information on Wikipedia', () => {
  test.beforeEach(async ({ sharedPage }) => {
    await sharedPage.goto(WIKI_HOME);
  });

  test('TC01 - Wikipedia homepage loads and search is available', async ({ sharedPage }) => {
    await expect(page).toHaveURL(WIKI_HOME);
    await expect(page.getByLabel('Search Wikipedia')).toBeVisible();
  });

  test('TC02 - Search India and verify capital is New Delhi', async ({ sharedPage }) => {
    await searchFromHome(sharedPage, 'India');

    await expect(sharedPage.getByRole('heading', { name: 'India' })).toBeVisible();
    const capital = await getInfoboxCapital(sharedPage);

    expect(capital).toMatch(/New Delhi/i);
  });

  test('TC03 - Search United Kingdom and verify capital is NOT Eastern Cape (negative test)', async ({ sharedPage }) => {
    await searchFromHome(sharedPage, 'India');
    await sharedPage.goBack();

    await expect(sharedPage).toHaveURL(WIKI_HOME);

    await searchFromHome(sharedPage, 'United Kingdom');
    await expect(sharedPage.getByRole('heading', { name: 'United Kingdom' })).toBeVisible();

    const capital = await getInfoboxCapital(sharedPage);
    expect(capital).not.toMatch(/Eastern Cape/i);

    // Confluence attachment requires a resolvable file path in runtime.
    // Save screenshot to ./artifacts so pipeline/agent can reference it.
    ensureArtifactsDir();
    await sharedPage.screenshot({ path: RESULT_SCREENSHOT, fullPage: true });
  });
});
