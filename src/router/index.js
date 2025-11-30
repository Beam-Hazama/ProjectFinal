import { createRouter, createWebHistory } from 'vue-router'
import User from '@/page/User/User.vue'
import Admin from '@/page/Admin/LaoutAdmin.vue'
import adminstore from '@/page/Store/Laoutstore.vue'
import Cart from '@/page/User/Cart.vue'
import Login from '@/page/Login/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'User',
      component: User,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
    },
    {
      path: '/adminstore',
      name: 'adminstore',
      component : adminstore
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart,
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login,
    }
  ],
})

export default router
