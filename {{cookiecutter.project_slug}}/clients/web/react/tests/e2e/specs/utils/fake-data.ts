import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'

// ============================================================================
// Types
// ============================================================================

interface ServerPaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

// ============================================================================
// Route Interception Utilities
// ============================================================================

type RouteHandler = {
  status?: number
  data: unknown
}

type MethodHandlers = {
  GET?: RouteHandler
  POST?: RouteHandler
  PATCH?: RouteHandler
  PUT?: RouteHandler
  DELETE?: RouteHandler
}

/**
 * Mock a single API endpoint with optional method-specific responses.
 *
 * @example
 * // Simple usage - same response for all methods
 * await mockRoute(page, '**\/api/users/**', { data: fakeData.user })
 *
 * @example
 * // Method-specific responses
 * await mockRoute(page, '**\/api/projects/**', {
 *   GET: { data: ServerPaginatedResponseFactory.create(ServerProjectFactory.create, 10) },
 *   POST: { status: 201, data: ServerProjectFactory.create() },
 * })
 */
export const mockRoute = async (
  page: Page,
  pattern: string,
  handlers: RouteHandler | MethodHandlers,
) => {
  return await page.route(pattern, (route) => {
    const method = route.request().method() as keyof MethodHandlers

    // Check if handlers is method-specific or a simple RouteHandler
    const isMethodHandlers = 'GET' in handlers || 'POST' in handlers || 'PATCH' in handlers || 'PUT' in handlers || 'DELETE' in handlers

    let handler: RouteHandler | undefined
    if (isMethodHandlers) {
      handler = (handlers as MethodHandlers)[method]
    } else {
      handler = handlers as RouteHandler
    }

    if (handler) {
      const status = handler.status ?? (method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200)
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(handler.data),
      })
    } else {
      route.continue()
    }
  })
}

/**
 * Mock multiple API endpoints at once.
 *
 * IMPORTANT: Routes are registered sequentially in the order specified.
 * In Playwright, the FIRST registered handler that matches wins.
 * So list MORE SPECIFIC patterns BEFORE generic ones:
 *
 * @example
 * await mockRoutes(page, {
 *   // Specific user first
 *   [`**\/api/users/${userId}/`]: { data: singleUser },
 *   // Generic users list after
 *   '**\/api/users/**': { GET: { data: paginatedUsers } },
 * })
 */
export const mockRoutes = async (
  page: Page,
  routes: Record<string, RouteHandler | MethodHandlers>,
) => {
  // Register routes sequentially to preserve order
  // Playwright uses first-registered-first-matched, so specific routes must be registered first
  for (const [pattern, handlers] of Object.entries(routes)) {
    await mockRoute(page, pattern, handlers)
  }
}

/**
 * @deprecated Use mockRoute instead for better glob pattern support
 */
export const interceptRequest = async (
  page: Page,
  path: string,
  mockData: { [key: string]: unknown },
) => {
  return await mockRoute(page, path, { data: mockData })
}

/**
 * @deprecated Use mockRoutes instead for better glob pattern support
 */
export const interceptMultipleRequests = async (
  page: Page,
  endpoints: Record<string, unknown>,
) => {
  const routes: Record<string, RouteHandler> = {}
  for (const [path, data] of Object.entries(endpoints)) {
    routes[`**${path}**`] = { data }
  }
  await mockRoutes(page, routes)
}

// ============================================================================
// Generic Factories
// ============================================================================

export class ServerPaginatedResponseFactory {
  static create<T>(itemFactory: () => T, count: number = 10): ServerPaginatedResponse<T> {
    const items: T[] = []
    for (let i = 0; i < count; i++) {
      items.push(itemFactory())
    }
    return {
      results: items,
      count: count,
      next: null,
      previous: null,
    }
  }
}

// ============================================================================
// Entity Factories
// ============================================================================

export class ServerUserFactory {
  static create(overrides: Record<string, unknown> = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: 'RESEARCH_TEAM',
      created: faker.date.past().toISOString(),
      last_edited: faker.date.recent().toISOString(),
      nylas_account: null,
      ...overrides,
    }
  }
}



// ============================================================================
// Auth Store Factory (for localStorage mocking)
// ============================================================================

export class AuthStoreFactory {
  static create(user = ServerUserFactory.create()) {
    return {
      state: {
        hasHydrated: {},
        token: faker.string.uuid(),
        userId: user.id,
        user: user,
        isClearingAuth: false,
        tokenExpirationDate: null,
      },
      version: 0,
    }
  }
}

// ============================================================================
// Convenience Exports (pre-built instances for common use cases)
// ============================================================================

export const fakeData = {
  // Single entities
  user: ServerUserFactory.create(),

  // Auth stores
  get store() {
    return AuthStoreFactory.create(this.user)
  },


  // Factory access for custom creation
  factories: {
    User: ServerUserFactory,
    PaginatedResponse: ServerPaginatedResponseFactory,
    AuthStore: AuthStoreFactory,
  },
}
