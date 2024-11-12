import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Has Welcome text', async ({ page }) => {
  await expect(page.getByText('Welcome')).toBeVisible()
})

test('Login and signup buttons are visible', async ({ page }) => {
  await expect(page.getByText('Login')).toBeVisible()
  await expect(page.getByText('Signup')).toBeVisible()
})
