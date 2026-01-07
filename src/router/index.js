import { createRouter, createWebHistory } from "vue-router";
import Login from "@/page/Login/Login.vue";

import Admin from "@/page/Admin/Admin.vue";
import Admindashboard from "@/page/Admin/Dashboard.vue";
import Adminmenulist from "@/page/Admin/Menulist.vue";
import Adminorderlist from "@/page/Admin/Orderlist.vue";
import AdminQRCode from "@/page/Admin/QRCode.vue";
import Adminrestaurantlist from "@/page/Admin/Restaurant.vue";

import Managemenu from "@/page/component/Managemenu.vue";
import Managerestaurant from "@/page/component/Managerestaurant.vue";

import Restaurants from "@/page/Restaurant/Restaurant.vue";
import Restaurantorderlist from "@/page/Restaurant/Orderlist.vue";
import Restaurantmenulist from "@/page/Restaurant/Menulist.vue";
import Restaurantprofile from "@/page/Restaurant/Profile.vue";

import User from "@/page/User/User.vue";
import Bill from "@/page/User/Bill.vue";
import Cart from "@/page/User/Cart.vue";
import Status from "@/page/User/Status.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //user
    {
      path: "/User",
      name: "User",
      component: User,
    },
    {
      path: "/User/Bill/:tableId", // ต้องมี :tableId
      name: "user-bill",
      component: Bill,
    },
    {
      path: "/User/Status",
      name: "Status",
      component: Status,
    },
    {
      path: "/User/Cart",
      name: "Cart",
      component: Cart,
    },
    //Admin
    {
      path: "/Admin",
      name: "Admin",
      component: Admin,
    },
    {
      path: "/Admin/Dashboard",
      name: "Admin Dashboard",
      component: Admindashboard,
    },
    {
      path: "/Admin/Menulist",
      name: "Admin Menu List",
      component: Adminmenulist,
    },
    {
      path: "/Admin/Orderlist",
      name: "Admin Order List",
      component: Adminorderlist,
    },
    {
      path: "/Admin/QRCode",
      name: "QR Code",
      component: AdminQRCode,
    },
    {
      path: "/Admin/Restaurant",
      name: "Admin Restaurant List",
      component: Adminrestaurantlist,
    },

    {
      path: "/Admin/Menulist/Addmenu",
      name: "Admin Add menu",
      component: Managemenu,
    },
    {
      path: "/Admin/Menulist/Edit/:id",
      name: "Admin update menu",
      component: Managemenu,
    },
    {
      path: "/Admin/Restaurant/Addrestaurant",
      name: "Admin Add restaurant",
      component: Managerestaurant,
    },
    {
      path: "/Admin/Restaurant/Edit/:id",
      name: "Admin update restaurant",
      component: Managerestaurant,
    },

    {
      path: "/Login",
      name: "Login",
      component: Login,
    },
    //Restaurant
    {
      path: "/Restaurant/:restaurantName",
      name: "Restaurants",
      component: Restaurants,
    },
    {
      path: "/Restaurant/Orderlist/:restaurantName",
      name: "Restaurants Orderlist",
      component: Restaurantorderlist,
    },
    {
      path: "/Restaurant/Profile/:restaurantName",
      name: "Restaurants Profile",
      component: Restaurantprofile,
    },
    {
      path: "/Restaurant/Menulist/:restaurantName",
      name: "Restaurants Menulist",
      component: Restaurantmenulist,
    },
    {
      path: "/User/:tableId", // เพิ่ม :tableId เพื่อรับค่าจาก URL
      name: "User",
      component: User,
    },
    {
      path: "/User/Cart/:tableId", // เพิ่ม :tableId ต่อท้าย
      name: "Cart",
      component: Cart,
    },
    {
      path: "/User/Status/:tableId", // เพิ่ม :tableId
      name: "Status",
      component: Status,
    },
  ],
});

export default router;
