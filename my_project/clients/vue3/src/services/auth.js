import store from '@/store'

/**
 * Route Guard.
 * All logged in users can access the route.
 * If not logged in, a user will be redirected to the login page.
 */
export function requireAuth(to, from, next) {
  if (!store.getters.isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}
