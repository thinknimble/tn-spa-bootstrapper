import { useUserStore } from '@/stores/user'
import { NavigationGuardWithThis } from 'vue-router'

/**
 * Route Guard.
 * Only logged in users can access the route.
 * If not logged in, a user will be redirected to the login page.
 */
export const requireAuth: NavigationGuardWithThis<undefined> = (to, _, next) => {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
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
export const requireNoAuth: NavigationGuardWithThis<undefined> = (_, __, next) => {
  const userStore = useUserStore()
  if (userStore.isLoggedIn) {
    next({
      name: 'Dashboard',
    })
  } else {
    next()
  }
}
