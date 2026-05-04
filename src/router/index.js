import { createRouter, createWebHistory, } from "vue-router";
import { useAccountStore } from '@/stores/auth/accountStore';

const Login = () => import("@/page/Login/Login.vue");

const Admin = () => import("@/page/Admin/Admin.vue");
const Admindashboard = () => import("@/page/Admin/Dashboard.vue");
const Adminmenulist = () => import("@/page/Admin/MenuList.vue");
const Adminorderlist = () => import("@/page/Admin/OrderList.vue");
const Adminorderhistory = () => import("@/page/Admin/OrderHistory.vue");
const AdminQRCode = () => import("@/page/Admin/QRCode.vue");
const Adminrestaurantlist = () => import("@/page/Admin/RestaurantList.vue");
const Adminrestaurantuser = () => import("@/page/Admin/RestaurantUser.vue");
const Adminpostermanage = () => import("@/page/Admin/Poster.vue");
const AdminCategory = () => import("@/page/Admin/Category.vue");
const AdminCommission = () => import("@/page/Admin/Commission.vue");

const Menudetail = () => import("@/page/Admin/components/menu/MenuDetail.vue");
const Restaurantdetail = () => import("@/page/Admin/components/restaurant/RestaurantDetail.vue");
const Addrestaurant = () => import("@/page/Admin/components/restaurant/AddRestaurant.vue");
const Userdetail = () => import("@/page/Admin/components/user/Userdetail.vue");
const Adduser = () => import("@/page/Admin/components/user/Adduser.vue");

const Restaurants = () => import("@/page/Restaurant/Restaurant.vue");
const Restaurantorderlist = () => import("@/page/Restaurant/OrderList.vue");
const Restaurantmenulist = () => import("@/page/Restaurant/MenuList.vue");
const Restaurantprofile = () => import("@/page/Restaurant/Profile.vue");
const RestaurantAddMenu = () => import("@/page/Restaurant/components/Menu/AddMenu.vue");
const RestaurantEditMenu = () => import("@/page/Restaurant/components/Menu/EditMenu.vue");
const RestaurantDashboard = () => import("@/page/Restaurant/Dashboard.vue");
const RestaurantPoster = () => import("@/page/Restaurant/Poster.vue");
const RestaurantOrderHistory = () => import("@/page/Restaurant/OrderHistory.vue");

const User = () => import("@/page/User/User.vue");
const Bill = () => import("@/page/User/Bill.vue");
const Cart = () => import("@/page/User/Cart.vue");
const Status = () => import("@/page/User/Status.vue");
const Search = () => import("@/page/User/components/user/Search.vue");
const Category = () => import("@/page/User/components/user/Category.vue");
const AllCategories = () => import("@/page/User/components/user/AllCategories.vue");
const AllPromotions = () => import("@/page/User/components/user/AllPromotions.vue");
const UserRestaurantMenu = () => import("@/page/User/components/user/RestaurantMenu.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/Login',
    },
    // User routes are public to allow customers to scan QR codes and place orders without logging in.
    {
      path: '/User',
      name: 'UserDefault',
      component: User,
    },
    {
      path: '/user/bill/:room',
      name: 'user-bill',
      component: Bill,
    },
    {
      path: '/user/restaurant/:restaurantName/:room',
      name: 'UserRestaurantMenu',
      component: UserRestaurantMenu,
    },
    {
      path: '/user/status/:room',
      name: 'Status',
      component: Status,
    },
    {
      path: '/user/cart/:room',
      name: 'Cart',
      component: Cart,
    },
    {
      path: '/user/search/:room',
      name: 'Search',
      component: Search,
    },
    {
      path: '/user/category/:category/:room',
      name: 'Category',
      component: Category,
    },
    {
      path: '/user/all-categories/:room',
      name: 'AllCategories',
      component: AllCategories,
    },
    {
      path: '/user/all-promotions/:room',
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
      path: '/Admin/Menulist/Menudetail/:id',
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
      component: RestaurantAddMenu,
      meta: { requiresAuth: true, role: 'restaurant' },
    },
    {
      path: '/Restaurant/EditMenu/:id',
      name: 'Restaurant Edit Menu',
      component: RestaurantEditMenu,
      meta: { requiresAuth: true, role: 'restaurant' },
    },

    {
      path: '/user/:room',
      name: 'UserWithParams',
      component: User,
    },
    {
      path: '/:room',
      name: 'UserShortUrl',
      component: User,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();

  if (!accountStore.isAuthChecked) {
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

