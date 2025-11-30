import { createRouter, createWebHistory } from 'vue-router'
import User from '@/page/User/User.vue'
import Cart from '@/page/User/Cart.vue'

import Admin from '@/page/Admin/Dashboard.vue'
import Adminmenuslist from '@/page/Admin/Menuslist.vue'
import Adminorderslist from '@/page/Admin/Orderslist.vue'

import adminstore from '@/page/Store/Laoutstore.vue'

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
      name: 'Admin',
      component: Admin,
    },
    {
      path: '/adminmenuslist',
      name: 'AdminMenusList',
      component: Adminmenuslist,
    },
    {
      path: '/adminorderslist',
      name: 'AdminOrdersList',
      component: Adminorderslist,
    },
    {
      path: '/adminstore',
      name: 'Adminstore',
      component: adminstore,
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
    },
  ],
});

export default router
