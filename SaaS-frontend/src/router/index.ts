import { createRouter, createWebHistory } from 'vue-router'

// import Home from "../views/Home.vue"
import Signup from '@/views/signup.vue'
import Login from '@/views/login.vue'
import Clients from '@/views/clients.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Dashboard from '@/views/Home.vue'
import ClientsLayout from '@/layouts/ClientsLayout.vue'
import ClientDetails from '@/views/clientDetails.vue'
import ProjectDetails from '@/views/projectDetails.vue'
import TaskDetails from '@/views/taskDetails.vue'
import Developers from '@/views/developers.vue'


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
      component: DashboardLayout,

      children: [
        {
          path: '',
          redirect: '/dashboard',
          // component: Dashboard,
        },

        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
        },

        {
          path: 'developers',
          name: 'developers',
          component: Developers,
        },

        {
          path: 'clients',
          component: ClientsLayout,

          children: [
            {
              path: '',
              component: Clients,
            },
            {
              path: ':id',
              component: ClientDetails,
            },
            {
              path: ':id/projects/:pid',
              component: ProjectDetails,
            },
            {
              path: ':id/projects/:pid/tasks/:tid',
              component: TaskDetails,
            },


          ]
        }
      ]
    },
  ]
})

router.beforeEach((to) => {
  const isAuthenticated =
    localStorage.getItem('accessToken') !== null ||
    localStorage.getItem('refreshToken') !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not logged in, redirect to login
    return '/login'
  }
})

export default router