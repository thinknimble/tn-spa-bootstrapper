import { useAuthStore } from '@/stores/auth'

/**
 * Route Guard.
 * Only logged in users can access the route.
 * If not logged in, a user will be redirected to the login page.
 */
export function requireAuth(to, from, next) {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

/**
 * Route Guard.
 * Only users NOT logged in can access the route.
 * If logged in, a user will be redirected to the dashboard page.
 */
export function requireNoAuth(to, from, next) {
  const authStore = useAuthStore()
  if (authStore.isLoggedIn) {
    next({
      name: 'Dashboard',
    })
  } else {
    next()
  }
}
