import { test, expect } from '@playwright/test';

/**
 * Jira: KAN-2 - User can reset password via email
 *
 * Notes:
 * - These tests are UI-flow focused. They assume the app exposes stable selectors (preferred: data-testid).
 * - Configure BASE_URL via Playwright config (use.baseURL) or set E2E_BASE_URL env var.
 * - Network calls are mocked where possible to keep tests independent and deterministic.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? '';

test.describe('Password reset (KAN-2)', () => {
  test.beforeEach(async ({ page }) => {
    // If baseURL is configured in playwright.config, you can set BASE_URL to empty.
    await page.goto(`${BASE_URL}/login`);
  });

  // Test cases are added below.
});
