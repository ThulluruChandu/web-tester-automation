import { test as base, type BrowserContext, type Page } from '@playwright/test';

type Fixtures = {
  sharedContext: BrowserContext;
  sharedPage: Page;
};

export const test = base.extend<Fixtures>({
  // Create ONE context + page per worker. With workers=1 this becomes one per run.
  sharedContext: [async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  sharedPage: [async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage();
    await use(page);
    await page.close();
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
