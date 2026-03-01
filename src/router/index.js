import { createRouter, createWebHistory } from "vue-router";
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

import Menudetail from "@/page/Admin/Menudetail.vue";
import Managerestaurant from "@/page/component/Managerestaurant.vue";
import Userdetail from "@/page/Admin/Userdetail.vue";
import Manageuser from "@/page/component/Manageuser.vue";

import Restaurants from "@/page/Restaurant/restaurant.vue";
import Restaurantorderlist from "@/page/Restaurant/Orderlist.vue";
import Restaurantmenulist from "@/page/Restaurant/Menulist.vue";
import Restaurantprofile from "@/page/Restaurant/Profile.vue";
import RestaurantManagemenu from "@/page/Restaurant/Managemenu.vue";
import RestaurantDashboard from "@/page/Restaurant/Dashboard.vue";
import RestaurantPoster from "@/page/Restaurant/Poster.vue";
import RestaurantCategory from "@/page/Restaurant/Category.vue";


import User from "@/page/User/User.vue";
import Bill from "@/page/User/bill.vue";
import Cart from "@/page/User/Cart.vue";
import Status from "@/page/User/Status.vue";
import Search from "@/page/User/Search.vue";
import Category from "@/page/User/Category.vue";
import UserRestaurantMenu from "@/page/User/RestaurantMenu.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/Admin',
      name: 'Admin',
      component: Admin,
    },
    // ...
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
      path: '/Admin/Orderhistory',
      name: 'Order History',
      component: Adminorderhistory,
    },
    {
      path: '/Admin/QRCode',
      name: 'QR Code',
      component: AdminQRCode,
    },
    {
      path: '/Admin/Restaurantlist',
      name: 'Restaurant List',
      component: Adminrestaurantlist,
    },
    {
      path: '/Admin/Restaurantuser',
      name: 'Restaurant User',
      component: Adminrestaurantuser,
    },
    {
      path: '/Admin/Poster',
      name: 'Poster Manage',
      component: Adminpostermanage,
    },
    {
      path: '/Admin/Category',
      name: 'Category Manage',
      component: AdminCategory,
    },

    {
      path: '/Admin/Menulist/Menudatail:id',
      name: 'Admin menu detail',
      component: Menudetail,
    },
    {
      path: '/Admin/Restaurant/Adduser',
      name: 'Admin Add User',
      component: Manageuser,
    },
    {
      path: '/Admin/Restaurant/Userdetail/:id',
      name: 'Admin User Detail',
      component: Userdetail,
    },

    {
      path: '/Admin/Restaurant/Addrestaurant',
      name: 'Admin Add restaurant',
      component: Managerestaurant,
    },
    {
      path: '/Restaurant/Edit/:id',
      name: 'Restaurant update ',
      component: Managerestaurant,
    },

    {
      path: '/Login',
      name: 'Login',
      component: Login,
    },

    {
      path: '/Restaurant/:restaurantName',
      name: 'Restaurants',
      component: Restaurants,
    },
    {
      path: '/Restaurant/Dashboard/:restaurantName',
      name: 'Restaurant Dashboard',
      component: RestaurantDashboard,
    },
    {
      path: '/Restaurant/Orderlist/:restaurantName',
      name: 'Restaurants Orderlist',
      component: Restaurantorderlist,
    },
    {
      path: '/Restaurant/Profile/:restaurantName',
      name: 'Restaurants Profile',
      component: Restaurantprofile,
    },
    {
      path: '/Restaurant/Poster/:restaurantName',
      name: 'Restaurants Poster',
      component: RestaurantPoster,
    },
    {
      path: '/Restaurant/Category/:restaurantName',
      name: 'Restaurants Category',
      component: RestaurantCategory,
    },
    {
      path: '/Restaurant/Menulist/:restaurantName',
      name: 'Restaurants Menulist',
      component: Restaurantmenulist,
    },
    {
      path: '/Restaurant/AddMenu/:restaurantName',
      name: 'Restaurant Add Menu',
      component: RestaurantManagemenu,
    },
    {
      path: '/Restaurant/EditMenu/:id',
      name: 'Restaurant Edit Menu',
      component: RestaurantManagemenu,
    },
  ],
});

export default router;
