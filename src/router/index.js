import { createRouter, createWebHistory, } from "vue-router";
import { useAccountStore } from '@/stores/accountStore';

import Login from "@/page/Login/Login.vue";

import Admin from "@/page/Admin/Admin.vue";
import Admindashboard from "@/page/Admin/Dashboard.vue";
import Adminmenulist from "@/page/Admin/Menulist.vue";
import Adminorderlist from "@/page/Admin/Orderlist.vue";
import Adminorderhistory from "@/page/Admin/Orderhistory.vue";
import AdminQRCode from "@/page/Admin/QRCode.vue";
import Adminrestaurantlist from "@/page/Admin/Restaurantlist.vue";
import Adminrestaurantuser from "@/page/Admin/Restaurantuser.vue";
import Adminpostermanage from "@/page/Admin/Poster.vue";
import AdminCategory from "@/page/Admin/Category.vue";
import AdminCommission from "@/page/Admin/Commission.vue";

import Menudetail from "@/page/Admin/Menudetail.vue";
import Restaurantdetail from "@/page/Admin/Restaurantdetail.vue";
import Addrestaurant from "@/page/Admin/Addrestaurant.vue";
import Userdetail from "@/page/Admin/Userdetail.vue";
import Adduser from "@/page/Admin/Adduser.vue";

import Restaurants from "@/page/Restaurant/restaurant.vue";
import Restaurantorderlist from "@/page/Restaurant/Orderlist.vue";
import Restaurantmenulist from "@/page/Restaurant/Menulist.vue";
import Restaurantprofile from "@/page/Restaurant/Profile.vue";
import RestaurantManagemenu from "@/page/Restaurant/Managemenu.vue";
import RestaurantDashboard from "@/page/Restaurant/Dashboard.vue";
import RestaurantPoster from "@/page/Restaurant/Poster.vue";

import RestaurantOrderHistory from "@/page/Restaurant/Orderhistory.vue";

import User from "@/page/User/User.vue";
import Bill from "@/page/User/bill.vue";
import Cart from "@/page/User/Cart.vue";
import Status from "@/page/User/Status.vue";
import Search from "@/page/User/Search.vue";
import Category from "@/page/User/Category.vue";
import AllCategories from "@/page/User/AllCategories.vue";
import AllPromotions from "@/page/User/AllPromotions.vue";
import UserRestaurantMenu from "@/page/User/RestaurantMenu.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // User routes are public to allow customers to scan QR codes and place orders without logging in.
    {
      path: '/User',
      name: 'UserDefault',
      component: User,
    },
    {
      path: '/user/bill/:building/:floor/:room',
      name: 'user-bill',
      component: Bill,
    },
    {
      path: '/user/restaurant/:restaurantName/:building/:floor/:room',
      name: 'UserRestaurantMenu',
      component: UserRestaurantMenu,
    },
    {
      path: '/user/status/:building/:floor/:room',
      name: 'Status',
      component: Status,
    },
    {
      path: '/user/cart/:building/:floor/:room',
      name: 'Cart',
      component: Cart,
    },
    {
      path: '/user/search/:building/:floor/:room',
      name: 'Search',
      component: Search,
    },
    {
      path: '/user/category/:category/:building/:floor/:room',
      name: 'Category',
      component: Category,
    },
    {
      path: '/user/all-categories/:building/:floor/:room',
      name: 'AllCategories',
      component: AllCategories,
    },
    {
      path: '/user/all-promotions/:building/:floor/:room',
      name: 'AllPromotions',
      component: AllPromotions,
    },

    {
      path: '/Admin',
      name: 'Admin',
      component: Admin,
      meta: { requiresAuth: true, role: 'admin' },
    },

    {
      path: '/Admin/Dashboard',
      name: 'Dashboard',
      component: Admindashboard,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Menulist',
      name: 'Menu List',
      component: Adminmenulist,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Orderlist',
      name: 'Order List',
      component: Adminorderlist,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Orderhistory',
      name: 'Order History',
      component: Adminorderhistory,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/QRCode',
      name: 'QR Code',
      component: AdminQRCode,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Restaurantlist',
      name: 'Restaurant List',
      component: Adminrestaurantlist,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Restaurantuser',
      name: 'Restaurant User',
      component: Adminrestaurantuser,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Poster',
      name: 'Admin Poster',
      component: Adminpostermanage,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Category',
      name: 'Admin Category',
      component: AdminCategory,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Commission',
      name: 'Commission',
      component: AdminCommission,
      meta: { requiresAuth: true, role: 'admin' },
    },

    {
      path: '/Admin/Menulist/Menudetail/:name',
      name: 'Admin menu detail',
      component: Menudetail,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Restaurant/Adduser',
      name: 'Admin Add User',
      component: Adduser,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Restaurantuser/Userdetail/:username',
      name: 'Admin User Detail',
      component: Userdetail,
      meta: { requiresAuth: true, role: 'admin' },
    },

    {
      path: '/Admin/Restaurant/Addrestaurant',
      name: 'Admin Add restaurant',
      component: Addrestaurant,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/Admin/Restaurantlist/Restaurantdetail/:name',
      name: 'Admin Restaurant Detail',
      component: Restaurantdetail,
      meta: { requiresAuth: true, role: 'admin' },
    },

    {
      path: '/Login',
      name: 'Login',
      component: Login,
    },

    {
      path: '/Restaurant',
      name: 'Restaurants',
      component: Restaurants,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/Dashboard',
      name: 'Restaurant Dashboard',
      component: RestaurantDashboard,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/Orderlist',
      name: 'Restaurants Orderlist',
      component: Restaurantorderlist,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/Orderhistory',
      name: 'Restaurants Orderhistory',
      component: RestaurantOrderHistory,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/Profile',
      name: 'Restaurants Profile',
      component: Restaurantprofile,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/Poster',
      name: 'Restaurants Poster',
      component: RestaurantPoster,
      meta: { requiresAuth: true, role: 'restaurant' },
    },

    {
      path: '/Restaurant/Menulist',
      name: 'Restaurants Menulist',
      component: Restaurantmenulist,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/AddMenu',
      name: 'Restaurant Add Menu',
      component: RestaurantManagemenu,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/EditMenu/:id',
      name: 'Restaurant Edit Menu',
      component: RestaurantManagemenu,
      meta: { requiresAuth: true, role: 'restaurant' },
    },

    {
      path: '/user/:building/:floor/:room',
      name: 'UserWithParams',
      component: User,
    },
    {
      path: '/:building/:floor/:room',
      name: 'UserShortUrl',
      component: User,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();

  if (!accountStore.isLoggedIn) {
    await accountStore.checkAuthState();
  }

  if (to.meta.requiresAuth) {
    if (!accountStore.isLoggedIn) {
      return next({ name: 'Login' });
    }

    if (to.meta.role && to.meta.role !== accountStore.role) {
      return next({ name: 'Login' });
    }
  }

  next();
});

export default router;

