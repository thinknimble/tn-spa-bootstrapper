// @ts-check
import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'

test('Login workflow', async ({ page }) => {
  expect(process.env.PLAYWRIGHT_TEST_USER_PASS).toBeTruthy()

  await page.goto('/log-in')
  await page.getByTestId('email').fill('playwright@thinknimble.com')
  await page.getByTestId('password').fill(process.env.PLAYWRIGHT_TEST_USER_PASS ?? '')
  await page.getByTestId('submit').click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
