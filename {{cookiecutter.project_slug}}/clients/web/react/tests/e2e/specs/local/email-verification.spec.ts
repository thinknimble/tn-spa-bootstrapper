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
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('unverified@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Should redirect to check-email page
      await expect(page).toHaveURL(/check-email/)
      await expect(page.getByText("We've sent a verification link")).toBeVisible()
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
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
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

      await mockRoute(page, '**/api/users/', {
        POST: {
          status: 201,
          data: {
            ...mockUser,
            token: 'mock-auth-token',
            needs_email_verification: true,
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
      await expect(page.getByText("We've sent a verification link")).toBeVisible()
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
      await expect(page.getByText('Welcome to')).toBeVisible()
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
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Verify check-email page content
      await expect(page.getByRole('heading', { name: 'Check Your Email' })).toBeVisible()
      await expect(page.getByText("We've sent a verification link to your email address")).toBeVisible()
      await expect(page.getByText('Please check your inbox')).toBeVisible()
      await expect(page.getByRole('button', { name: /resend verification email/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /back to log in/i })).toBeVisible()
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
      await page.getByRole('button', { name: /resend verification email/i }).click()

      // Should show success message
      await expect(page.getByText('Verification email sent! Please check your inbox.')).toBeVisible()
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
      await page.getByRole('button', { name: /resend verification email/i }).click()

      // Should show error message
      await expect(page.getByText('Email already verified')).toBeVisible()
    })

    test('back to login link navigates correctly', async ({ page }) => {
      const mockUser = ServerUserFactory.create({ email_verified: false })

      await mockRoute(page, '**/api/login/', {
        POST: {
          status: 200,
          data: {
            ...mockUser,
            token: 'mock-auth-token',
            needs_email_verification: true,
          },
        },
      })

      await page.goto('/log-in')
      await page.getByTestId('email').fill('test@example.com')
      await page.getByTestId('password').fill('password123')
      await page.getByTestId('submit').click()

      // Wait for check-email page
      await expect(page).toHaveURL(/check-email/)

      // Click back to login
      await page.getByRole('link', { name: /back to log in/i }).click()

      // Should navigate to login page
      await expect(page).toHaveURL(/log-in/)
    })

    test('redirects to login if not authenticated', async ({ page }) => {
      // Try to access check-email directly without being logged in
      await page.goto('/check-email')

      // Should redirect to login
      await expect(page).toHaveURL(/log-in/)
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
      await expect(page.getByText('Email verified!')).toBeVisible()
      await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
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
      await expect(page.getByText(/invalid|expired/i)).toBeVisible()
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
      await expect(page.getByText(/verifying/i)).toBeVisible()

      // Then show success
      await expect(page.getByText('Email verified!')).toBeVisible()
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
      await expect(page.getByText('Email verified!')).toBeVisible()
    })
  })
})
