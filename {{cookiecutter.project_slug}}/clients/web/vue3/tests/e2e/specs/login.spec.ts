import { test, expect } from '@playwright/test'

test('Login workflow', async ({ page }) => {
  expect(process.env.CYPRESS_TEST_USER_PASS).toBeTruthy()

  await page.goto('/login')
  await page.getByPlaceholder('Enter email...').fill('playwright@thinknimble.com')
  await page.getByPlaceholder('Enter password...').fill(process.env.CYPRESS_TEST_USER_PASS ?? '')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
