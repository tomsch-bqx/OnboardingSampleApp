// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Onboarding Dashboard', () => {
  test('should display the dashboard heading', async ({ page }) => {
    await page.goto('/');

    // Verify the main heading is visible
    await expect(page.locator('h1')).toContainText('Onboarding Dashboard');
  });

  test('should show navigation tabs', async ({ page }) => {
    await page.goto('/');

    // Verify all navigation tabs are present
    await expect(page.locator('.tab')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customer Info' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Data Mapping' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tenant Setup' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
  });

  test('should display example customer in onboarding queue', async ({ page }) => {
    await page.goto('/');

    // Wait for data to load and verify example customer is shown
    await expect(page.locator('.customer-card')).toBeVisible();
    await expect(page.locator('.customer-card h3')).toContainText('Acme Corporation');
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/');

    // Click on Data Mapping tab (still a placeholder)
    await page.getByRole('button', { name: 'Data Mapping' }).click();

    await expect(page.locator('.placeholder h2')).toContainText('Data Mapping');
  });
});

test.describe('Customer Info', () => {
  test.describe.configure({ mode: 'serial' });

  test('should show the form pre-filled with the existing customer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Customer Info' }).click();

    await expect(page.getByLabel('Name')).toHaveValue('Acme Corporation');
  });

  test('should show a validation error for an empty name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Customer Info' }).click();

    await page.getByLabel('Name').fill('');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.form-error')).toContainText('Name is required');
  });

  test('should save and mark the Customer Info step completed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Customer Info' }).click();

    await expect(page.getByLabel('Name')).toHaveValue('Acme Corporation');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.form-success')).toBeVisible();

    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page.locator('.checklist li').first().locator('.step-status')).toHaveClass(
      /completed/
    );
  });
});

test.describe('Tenant Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test('should show the form pre-filled with the existing tenant', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tenant Setup' }).click();

    await expect(page.getByLabel('Plan')).toHaveValue('professional');
    await expect(page.getByLabel('Status')).toHaveValue('pending');
  });

  test('should update the tenant and show a success message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tenant Setup' }).click();

    await expect(page.getByLabel('Plan')).toHaveValue('professional');
    await expect(page.getByLabel('Status')).toHaveValue('pending');

    await page.getByLabel('Plan').selectOption('enterprise');
    await page.getByLabel('Status').selectOption('active');
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.locator('.form-success')).toBeVisible();
  });

  test('should mark the Tenant Setup step completed after update', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tenant Setup' }).click();

    await expect(page.getByLabel('Plan')).toHaveValue('enterprise');
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.locator('.form-success')).toBeVisible();

    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page.locator('.checklist li').nth(2).locator('.step-status')).toHaveClass(
      /completed/
    );
  });
});
