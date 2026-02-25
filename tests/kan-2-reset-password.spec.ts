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

  test('TC01: Login page shows "Forgot Password?" link', async ({ page }) => {
    const forgotPassword = page.getByRole('link', { name: /forgot password\?/i });
    await expect(forgotPassword).toBeVisible();
  });

  test('TC02: Clicking "Forgot Password?" prompts for registered email', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password\?/i }).click();

    // Prefer stable selectors in the AUT (e.g., data-testid).
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    const submitButton = page.getByRole('button', { name: /send reset link|reset password|send/i });
    await expect(submitButton).toBeVisible();
  });

  test('TC03: Submitting an existing email sends reset link (mocked API) and shows confirmation', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password\?/i }).click();

    // Mock backend endpoint responsible for sending reset link.
    // Update the route URL pattern to match your application.
    await page.route('**/api/**/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' }),
      });
    });

    await page.getByRole('textbox', { name: /email/i }).fill('registered.user@example.com');
    await page.getByRole('button', { name: /send reset link|reset password|send/i }).click();

    // UI should confirm request without exposing whether the email exists.
    await expect(
      page.getByText(/if an account exists|email has been sent|check your email|reset link/i)
    ).toBeVisible();
  });

  test('TC04: Reset link screen lets user set a new password (mocked API)', async ({ page }) => {
    // Simulate user opening the link they received in email.
    // Update path/query to match your application.
    await page.goto(`${BASE_URL}/reset-password?token=valid-token`);

    await page.route('**/api/**/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password updated' }),
      });
    });

    const newPassword = 'NewP@ssw0rd!';

    await page.getByRole('textbox', { name: /new password/i }).fill(newPassword);
    // If the UI has confirm password, fill it when present.
    const confirm = page.getByRole('textbox', { name: /confirm password/i });
    if (await confirm.count()) {
      await confirm.fill(newPassword);
    }

    await page.getByRole('button', { name: /set password|reset password|update password/i }).click();

    await expect(page.getByText(/password (updated|reset)|success/i)).toBeVisible();
  });

  test('TC05: User can log in with the new password after resetting (mocked API)', async ({ page }) => {
    // This test focuses on the final outcome: login succeeds with the updated password.
    await page.goto(`${BASE_URL}/login`);

    await page.route('**/api/**/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt', user: { email: 'registered.user@example.com' } }),
      });
    });

    await page.getByRole('textbox', { name: /email/i }).fill('registered.user@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('NewP@ssw0rd!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    // Adjust assertion to match your post-login landing indicator.
    await expect(page.getByText(/logout|my account|dashboard|welcome/i)).toBeVisible();
  });
});
