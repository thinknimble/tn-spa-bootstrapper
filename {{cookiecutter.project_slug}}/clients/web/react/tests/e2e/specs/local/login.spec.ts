/**
 * Mocked Login Tests
 *
 * Tests the login workflow without requiring a real backend.
 * Uses route interception to mock API responses.
 */

import { test, expect } from '@playwright/test'
import { mockRoute, mockRoutes, ServerUserFactory, fakeData } from '../utils/fake-data'

test.describe('Login Page (Mocked)', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    // Create a fake user with known credentials
    const mockUser = ServerUserFactory.create({
      email: 'test@example.com',
    })

    // Mock API endpoints - login and user fetch (NavBar fetches user after login)
    await mockRoutes(page, {
      '**/api/login/': {
        POST: {
          status: 200,
          data: {
            ...mockUser,
            token: 'mock-auth-token-12345',
          },
        },
      },
      // After login, NavBar fetches the current user
      '**/api/users/**': {
        GET: {
          status: 200,
          data: mockUser,
        },
      },
    })

    // Navigate to login page
    await page.goto('/log-in')

    // Fill in the login form
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('password').fill('password123')

    // Submit the form
    await page.getByTestId('submit').click()

    // Verify redirect to dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('displays error message on invalid credentials', async ({ page }) => {
    // Mock the login API to return an error
    await mockRoute(page, '**/api/login/', {
      POST: {
        status: 400,
        data: {
          non_field_errors: ['Unable to log in with provided credentials.'],
        },
      },
    })

    // Navigate to login page
    await page.goto('/log-in')

    // Fill in the login form with "invalid" credentials
    await page.getByTestId('email').fill('invalid@example.com')
    await page.getByTestId('password').fill('wrongpassword')

    // Submit the form
    await page.getByTestId('submit').click()

    // Verify error message is displayed
    await expect(page.getByText('Unable to log in with provided credentials')).toBeVisible()
  })

  test('submit button is disabled while form is invalid', async ({ page }) => {
    // Navigate to login page
    await page.goto('/log-in')

    // Submit button should be disabled initially (empty form)
    const submitButton = page.getByTestId('submit')

    // Fill only email (password empty)
    await page.getByTestId('email').fill('test@example.com')

    // Submit button should still be disabled
    await expect(submitButton).toBeDisabled()

    // Fill password
    await page.getByTestId('password').fill('password123')

    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('shows loading state during submission', async ({ page }) => {
    // Create a delayed response to observe loading state
    await page.route('**/api/login/', async (route) => {
      // Delay the response to give time to observe loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...fakeData.user,
          token: 'mock-token',
        }),
      })
    })

    // Navigate to login page
    await page.goto('/log-in')

    // Fill in the form
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('password').fill('password123')

    // Click submit and immediately check for loading state
    await page.getByTestId('submit').click()

    // Button should show loading text
    await expect(page.getByTestId('component-loading-spinner')).toBeVisible()
    await expect(page.getByTestId('submit')).toBeDisabled()
  })

  test('navigates to sign up page when clicking sign up link', async ({ page }) => {
    // Navigate to login page
    await page.goto('/log-in')

    // Click the sign up link
    await page.getByRole('link', { name: /sign up/i }).click()

    // Verify navigation to sign up page
    await expect(page).toHaveURL(/sign-up/)
  })
})
