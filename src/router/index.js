import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Product from '@/views/Product.vue'
import LoginSuccess from '@/views/LoginSuccess.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: Login
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: LoginSuccess
  },
  {
    path: '/product',
    name: 'ProductPage',
    component: Product
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
