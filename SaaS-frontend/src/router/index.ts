import { createRouter, createWebHistory } from 'vue-router'

// import Home from "../views/Home.vue"
import Signup from '@/views/signup.vue'
import Login from '@/views/login.vue'
import Clients from '@/views/clients.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Dashboard from '@/views/Home.vue'
import ClientsLayout from '@/layouts/ClientsLayout.vue'
import ClientDetails from '@/views/clientDetails.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // authentication
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },

    // main application

    {
      path: '/',
      name: 'dashboard',
      component: DashboardLayout,
   

    children: [
        {
          path: '',
          redirect: '/dashboard',
          // component: Dashboard,
        },

        {
          path: 'dashboard',
          component: Dashboard,
        },

        {
          path: 'clients',
          component: ClientsLayout,

          children:[
            {
              path: '',
              component:Clients,
            },
            {
              path: ':id',
              component:ClientDetails,
            }
          ]
        }
      ]
    },
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