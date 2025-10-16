import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/Home.route.vue'
import AdministracionView from './views/administracion.route.vue'
import Login from './views/login.vue'
import OrdenesTrabajo from './views/OrdenesTrabajo.vue'
import OrdersList from './views/OrdersList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/administracion',
      component: AdministracionView,
      meta: { requiresAuth: true }
    },
    {
      path: '/ordenes/nueva',
      component: OrdenesTrabajo,
      meta: { requiresAuth: true }
    },
    {
      path: '/ordenes',
      name: 'orders',
      component: OrdersList,
      meta: { requiresAuth: true }
    },
    {
      path: '/ordenes/:id',
      name: 'orderDetail',
      component: OrdenesTrabajo,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('user')

  if (authRequired && !loggedIn) {
    return next('/login')
  }
  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
