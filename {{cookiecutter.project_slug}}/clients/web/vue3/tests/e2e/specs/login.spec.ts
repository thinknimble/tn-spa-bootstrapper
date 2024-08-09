import { test, expect } from '@playwright/test'

test('Login workflow', async ({ page }) => {
  if (!process.env.PLAYWRIGHT_TEST_USER_PASS) {
    throw new Error('PLAYWRIGHT_TEST_USER_PASS env var is not set')
  }

  await page.goto('/login')
  await page.getByTestId('email').fill('playwright@thinknimble.com')
  await page.getByTestId('password').fill(process.env.PLAYWRIGHT_TEST_USER_PASS ?? '')
  await page.getByTestId('submit').click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
