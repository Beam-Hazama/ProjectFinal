import { createRouter, createWebHistory } from 'vue-router'
import User from '@/page/User/User.vue'
import Cart from '@/page/User/Cart.vue'
import Admin from '@/page/Admin/Dashboard.vue'
import Adminmenuslist from '@/page/Admin/Menuslist.vue'
import Adminorderslist from '@/page/Admin/Orderslist.vue'
import bill from '@/page/User/bill.vue'

import Login from '@/page/Login/Login.vue'
import Status from '@/page/User/Status.vue'
import QRCode from '@/page/Admin/QRCode.vue'
import Restaurant from '@/page/Admin/Restaurant.vue'
import restaurant from '@/page/Restaurant/restaurant.vue'

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
      path: '/cart',
      name: 'Cart',
      component: Cart,
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/bill',
      name: 'bill',
      component: bill,
    },
    {
      path: '/Status',
      name: 'Status',
      component: Status,
    },
    {
      path: '/QRCode',
      name: 'QRCode',
      component: QRCode,
    },
    {
      path: '/Admin/Restaurant',
      name: 'Restaurant',
      component: Restaurant,
    },
    {
      path: '/Restaurant/',
      name: '75',
      component: restaurant,
    },

  ],
});

export default router
