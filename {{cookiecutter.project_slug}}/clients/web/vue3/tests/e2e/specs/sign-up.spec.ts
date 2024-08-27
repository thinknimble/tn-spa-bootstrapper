import { test, expect } from '@playwright/test'

const PASSWORD = 'PASSWORD'

function generateUniqueEmail() {
  const timestamp = Date.now().toString(); 
  return `playwright-${timestamp}@thinknimble.com`;
}

test('Sign up workflow', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail()

  await page.goto('/signup')
  await page.getByPlaceholder('Enter first name...').fill('playwright')
  await page.getByPlaceholder('Enter last name...').fill('e2e test')
  await page
    .getByPlaceholder('Enter email...')
    .fill(uniqueEmail)
  await page.getByPlaceholder('Enter password...').fill(PASSWORD)
  await page.getByPlaceholder('Confirm Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign up' }).click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
