/**
 * Email Verification E2E Tests (Mocked)
 *
 * Tests the email verification workflow including:
 * - Login/signup redirects based on needs_email_verification flag
 * - Check-email page functionality
 * - Email verification page
 */

import { test, expect } from '@playwright/test'
import { mockRoute, mockRoutes, ServerUserFactory } from '../utils/fake-data'

test.describe('Email Verification Flow', () => {
  test.describe('Login', () => {
    test('redirects to check-email when needs_email_verification is true', async ({ page }) => {
      const mockUser = ServerUserFactory.create({
        email: 'unverified@example.com',
        email_verified: false,
      })

      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('unverified@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Should redirect to check-email page
      await expect(page).toHaveURL(/check-email/)
      await expect(page.getByTestId('verification-sent-message')).toBeVisible()
    })

    test('redirects to dashboard when needs_email_verification is false', async ({ page }) => {
      const mockUser = ServerUserFactory.create({
        email: 'verified@example.com',
        email_verified: true,
      })

      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: false,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('verified@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Should redirect to dashboard
      await expect(page.getByTestId('dashboard-heading')).toBeVisible()
    })
  })

  test.describe('Sign Up', () => {
    test('redirects to check-email when needs_email_verification is true', async ({ page }) => {
      const mockUser = ServerUserFactory.create({
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        email_verified: false,
      })

      await mockRoutes(page, {
        '**/api/users/': {
          POST: {
            status: 201,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
      })

      await page.goto('/sign-up')
      await page.getByTestId('first-name').fill('New')
      await page.getByTestId('last-name').fill('User')
      await page.getByTestId('email').fill('newuser@example.com')
      await page.getByTestId('password').fill('Password123!')
      await page.getByTestId('confirm-password').fill('Password123!')
      await page.getByTestId('submit').click()

      // Should redirect to check-email page
      await expect(page).toHaveURL(/check-email/)
      await expect(page.getByTestId('verification-sent-message')).toBeVisible()
    })

    test('redirects to home when needs_email_verification is false', async ({ page }) => {
      const mockUser = ServerUserFactory.create({
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        email_verified: true,
      })

      await mockRoute(page, '**/api/users/', {
        POST: {
          status: 201,
          data: {
            ...mockUser,
            token: 'mock-auth-token',
            needs_email_verification: false,
          },
        },
      })

      await page.goto('/sign-up')
      await page.getByTestId('first-name').fill('New')
      await page.getByTestId('last-name').fill('User')
      await page.getByTestId('email').fill('newuser@example.com')
      await page.getByTestId('password').fill('Password123!')
      await page.getByTestId('confirm-password').fill('Password123!')
      await page.getByTestId('submit').click()

      // Should redirect to home page
      await expect(page).toHaveURL(/home/)
    })
  })

  test.describe('Check Email Page', () => {
    test('displays verification instructions', async ({ page }) => {
      const mockUser = ServerUserFactory.create({ email_verified: false })

      // Login first to get authenticated
      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Verify check-email page content
      await expect(page.getByTestId('auth-layout-title')).toContainText('Check Your Email')
      await expect(page.getByTestId('verification-sent-message')).toBeVisible()
      await expect(page.getByTestId('check-inbox-message')).toBeVisible()
      await expect(page.getByTestId('resend-verification-email')).toBeVisible()
      await expect(page.getByTestId('use-different-account')).toBeVisible()
    })

    test('resend verification email shows success message', async ({ page }) => {
      const mockUser = ServerUserFactory.create({ email_verified: false })

      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
        '**/api/resend-verification-email/': {
          POST: {
            status: 200,
            data: { message: 'Verification email sent' },
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Click resend button
      await page.getByTestId('resend-verification-email').click()

      // Should show success message
      await expect(page.getByTestId('resend-success-message')).toBeVisible()
    })

    test('resend verification email shows error on failure', async ({ page }) => {
      const mockUser = ServerUserFactory.create({ email_verified: false })

      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
        '**/api/resend-verification-email/': {
          POST: {
            status: 400,
            data: { 'non-field-error': 'Email already verified' },
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Click resend button
      await page.getByTestId('resend-verification-email').click()

      // Should show error message
      await expect(page.getByTestId('resend-error-message')).toBeVisible()
    })

    test('back to login link navigates correctly', async ({ page }) => {
      const mockUser = ServerUserFactory.create({ email_verified: false })

      await mockRoutes(page, {
        '**/api/login/': {
          POST: {
            status: 200,
            data: {
              ...mockUser,
              token: 'mock-auth-token',
              needs_email_verification: true,
            },
          },
        },
        '**/api/users/**': {
          GET: {
            status: 200,
            data: mockUser,
          },
        },
        '**/api/logout/': {
          POST: {
            status: 204,
            data: {},
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Wait for check-email page
      await expect(page).toHaveURL(/check-email/)

      // Click use different account to go back to login
      await page.getByTestId('use-different-account').click()

      // Should navigate to login page
      await expect(page).toHaveURL(/log-in/)
    })

    test('shows 404 if not authenticated', async ({ page }) => {
      // Try to access check-email directly without being logged in
      await page.goto('/check-email')

      // Route doesn't exist for unauthenticated users, should show 404
      await expect(page.getByTestId('page-not-found')).toBeVisible()
    })
  })

  test.describe('Verify Email Page', () => {
    test('shows success message on valid token', async ({ page }) => {
      await mockRoute(page, '**/api/verify-email/**', {
        POST: {
          status: 200,
          data: { message: 'Email successfully verified' },
        },
      })

      await page.goto('/verify-email/user-123/valid-token')

      // Should show success message
      await expect(page.getByTestId('verify-success')).toBeVisible()
      await expect(page.getByTestId('verify-success-action')).toBeVisible()
    })

    test('shows error message on invalid token', async ({ page }) => {
      await mockRoute(page, '**/api/verify-email/**', {
        POST: {
          status: 400,
          data: { 'non-field-error': 'Invalid or expired token' },
        },
      })

      await page.goto('/verify-email/user-123/invalid-token')

      // Should show error message
      await expect(page.getByTestId('verify-error-message')).toBeVisible()
    })

    test('shows loading state while verifying', async ({ page }) => {
      // Create a delayed response to observe loading state
      await page.route('**/api/verify-email/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email successfully verified' }),
        })
      })

      await page.goto('/verify-email/user-123/valid-token')

      // Should show loading state
      await expect(page.getByTestId('verify-loading')).toBeVisible()

      // Then show success
      await expect(page.getByTestId('verify-success')).toBeVisible()
    })

    test('handles already verified email gracefully', async ({ page }) => {
      await mockRoute(page, '**/api/verify-email/**', {
        POST: {
          status: 200,
          data: { message: 'Email already verified' },
        },
      })

      await page.goto('/verify-email/user-123/valid-token')

      // Should show success (already verified is still a success case)
      await expect(page.getByTestId('verify-success')).toBeVisible()
    })
  })
})
