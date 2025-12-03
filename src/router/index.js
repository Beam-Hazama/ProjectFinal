import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/page/Login/Login.vue'

import Admin from '@/page/Admin/Admin.vue'
import Admindashboard from '@/page/Admin/Dashboard.vue'
import Adminmenulist from '@/page/Admin/Menulist.vue'
import Adminorderlist from '@/page/Admin/Orderlist.vue'
import AdminQRCode from '@/page/Admin/QRCode.vue'
import Restaurant from '@/page/Admin/Restaurant.vue'

import Restaurants from '@/page/Restaurant/restaurant.vue'

import User from '@/page/User/User.vue'
import Bill from '@/page/User/Bill.vue'
import Cart from '@/page/User/Cart.vue'
import Status from '@/page/User/Status.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/User',
      name: 'User',
      component: User,
    },
    {
      path: '/Admin',
      name: 'Admin',
      component: Admin,
    },
    {
      path: '/Admin/Dashboard',
      name: 'Dashboard',
      component: Admindashboard,
    },
    {
      path: '/Admin/Menulist',
      name: 'Menu List',
      component: Adminmenulist,
    },
    {
      path: '/Admin/Orderlist',
      name: 'Order List',
      component: Adminorderlist,
    },
    {
      path: '/User/Status',
      name: 'Status',
      component: Status,
    },
    {
      path: '/User/Cart',
      name: 'Cart',
      component: Cart,
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/User/Bill',
      name: 'Bill',
      component: Bill,
    },
    {
      path: '/Admin/QRCode',
      name: 'QR Code',
      component: AdminQRCode,
    },
    {
      path: '/Admin/Restaurant',
      name: 'Restaurant',
      component: Restaurant,
    },
    {
      path: '/Restaurant',
      name: 'Restaurants',
      component: Restaurants,
    },

  ],
});

export default router
