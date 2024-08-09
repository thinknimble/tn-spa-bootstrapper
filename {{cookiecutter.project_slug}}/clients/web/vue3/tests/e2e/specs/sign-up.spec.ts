import { test, expect } from '@playwright/test'

const PASSWORD = 'PASSWORD'

test('Login workflow', async ({ page }) => {
  await page.goto('/signup')
  await page.getByTestId('first-name').fill('playwright')
  await page.getByTestId('last-name').fill('e2e test')
  await page
    .getByTestId('email')
    .fill(`playwright${Math.floor(Math.random() * 1000)}@thinknimble.com`)
  await page.getByTestId('password').fill(PASSWORD)
  await page.getByTestId('confirm-password').fill(PASSWORD)
  await page.getByTestId('submit').click()
  await expect(page.getByText('Welcome to')).toBeVisible()
})
