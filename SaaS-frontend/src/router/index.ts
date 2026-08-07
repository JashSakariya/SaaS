import { createRouter, createWebHistory } from 'vue-router'

import Home from "../views/Home.vue"
import Signup from '@/views/signup.vue'
import Login from '@/views/login.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'signup',
      component: Signup
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }

  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated =
    localStorage.getItem('accessToken') !== null ||
    localStorage.getItem('refreshToken') !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not logged in, redirect to login
    next('/login')
  } else {
    // Otherwise, let them proceed
    next()
  }
})

export default router