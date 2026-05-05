import { createRouter, createWebHistory, } from "vue-router";
import { useAccountStore } from '@/stores/auth';

const Login = () => import("@/views/auth/Login.vue");

const Admin = () => import("@/views/admin/AdminLayout.vue");
const Admindashboard = () => import("@/views/admin/Dashboard.vue");
const Adminmenulist = () => import("@/views/admin/MenuList.vue");

const Adminorderhistory = () => import("@/views/admin/OrderHistory.vue");
const AdminQRCode = () => import("@/views/admin/QRCode.vue");
const Adminrestaurantlist = () => import("@/views/admin/RestaurantList.vue");
const Adminrestaurantuser = () => import("@/views/admin/RestaurantUser.vue");

const AdminCategory = () => import("@/views/admin/Category.vue");
const AdminCommission = () => import("@/views/admin/Commission.vue");

const Menudetail = () => import("@/views/admin/MenuDetail.vue");
const Restaurantdetail = () => import("@/views/admin/RestaurantDetail.vue");
const Addrestaurant = () => import("@/views/admin/AddRestaurant.vue");
const Userdetail = () => import("@/views/admin/UserDetail.vue");
const Adduser = () => import("@/views/admin/AddUser.vue");

const Restaurants = () => import("@/views/restaurant/RestaurantLayout.vue");
const Restaurantorderlist = () => import("@/views/restaurant/OrderList.vue");
const Restaurantmenulist = () => import("@/views/restaurant/MenuList.vue");
const Restaurantprofile = () => import("@/views/restaurant/Profile.vue");
const RestaurantAddMenu = () => import("@/views/restaurant/AddMenu.vue");
const RestaurantEditMenu = () => import("@/views/restaurant/EditMenu.vue");
const RestaurantDashboard = () => import("@/views/restaurant/Dashboard.vue");

const RestaurantOrderHistory = () => import("@/views/restaurant/OrderHistory.vue");

const User = () => import("@/views/customer/Home.vue");
const Bill = () => import("@/views/customer/Bill.vue");
const Cart = () => import("@/views/customer/Cart.vue");
const Status = () => import("@/views/customer/OrderStatus.vue");
const Search = () => import("@/views/customer/Search.vue");
const Category = () => import("@/views/customer/Category.vue");
const AllCategories = () => import("@/views/customer/AllCategories.vue");
const AllPromotions = () => import("@/views/customer/AllPromotions.vue");
const UserRestaurantMenu = () => import("@/views/customer/RestaurantMenu.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/Login',
    },
    
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

// หาว่า role ไหนควรไปหน้าไหน
const homeRouteByRole = (role) => {
  if (role === 'admin') return { name: 'Admin' };
  if (role === 'restaurant') return { name: 'Restaurants' };
  return null;
};

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();

  // เช็ค session ครั้งแรกก่อน navigate
  if (!accountStore.isAuthChecked) {
    await accountStore.checkAuthState();
  }

  // ถ้า login อยู่แล้วแต่พยายามเข้าหน้า Login → ส่งไปหน้าหลักของ role
  if (to.name === 'Login' && accountStore.isLoggedIn) {
    const home = homeRouteByRole(accountStore.role);
    if (home) return next(home);
  }

  // ถ้าหน้านี้ต้อง login แต่ยังไม่ได้ login → ส่งไป Login
  if (to.meta.requiresAuth) {
    if (!accountStore.isLoggedIn) {
      return next({ name: 'Login' });
    }

    // ถ้า role ไม่ตรงกับหน้านี้ → ส่งไปหน้าหลักของ role ตัวเอง
    if (to.meta.role && to.meta.role !== accountStore.role) {
      const home = homeRouteByRole(accountStore.role);
      return next(home || { name: 'Login' });
    }
  }

  next();
});

export default router;

