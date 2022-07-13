import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth } from '@/services/auth'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import(/* webpackChunkName: "signup" */ '../views/Signup.vue'),
  },
  {
    path: '/password/reset',
    name: 'RequestPasswordReset',
    component: () =>
      import(/* webpackChunkName: "requestPasswordReset" */ '../views/RequestPasswordReset.vue'),
  },
  {
    path: '/password/reset/confirm/:uid/:token',
    name: 'ResetPassword',
    component: () => import(/* webpackChunkName: "resetPassword" */ '../views/ResetPassword.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    beforeEnter: requireAuth,
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('../views/PageNotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
