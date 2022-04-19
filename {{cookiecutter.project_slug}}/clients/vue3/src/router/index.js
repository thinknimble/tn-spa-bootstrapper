import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

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
    component: () => import(/* webpackChunkName: "requestPasswordReset" */ '../views/RequestPasswordReset.vue'),
  },
  {
    path: '/password/reset/confirm/:uid/:token',
    name: 'PasswordReset',
    component: () => import(/* webpackChunkName: "passwordReset" */ '../views/PasswordReset.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
