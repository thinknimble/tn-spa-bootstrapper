import { test, expect } from '@playwright/test'

const PASSWORD = 'PASSWORD'

function generateUniqueEmail() {
  const timestamp = Date.now().toString();
  return `playwright-${timestamp}@thinknimble.com`;
}

test('Login workflow', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail()

  await page.goto('/sign-up')
  await page.getByTestId('first-name').fill('playwright')
  await page.getByTestId('last-name').fill('e2e test')
  await page
    .getByTestId('email')
    .fill(uniqueEmail)
  await page.getByTestId('password').fill(PASSWORD)
  await page.getByTestId('confirm-password').fill(PASSWORD)
  await page.getByTestId('submit').click()
  await expect(page.getByText('Welcome to')).toBeVisible()
})
