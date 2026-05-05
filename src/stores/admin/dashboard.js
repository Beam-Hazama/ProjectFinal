import { defineStore } from "pinia";
import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/firebase";
import { toDayKey } from "@/utils/format";
import { 
  getTimeRange, 
  buildDailyRevenue, 
  buildPeakHours, 
  buildCategoryStats as getCategoryStats,
  isOrderInTimeRange
} from "@/utils/dashboardHelpers";


function calculateOrderRevenue(order, restaurantFilters = [], categoryFilters = [], menuFilters = []) {
  if (order.OrderStatus !== 'completed') return 0;
  
  if (!order.Menu || order.Menu.length === 0) {
    const isFiltered = restaurantFilters.length > 0 || categoryFilters.length > 0 || menuFilters.length > 0;
    return isFiltered ? 0 : Number(order.TotalPrice || order.localTotal || 0);
  }

  return order.Menu
    .filter(item => {
      const isRightRestaurant = restaurantFilters.length === 0 || restaurantFilters.includes(item.Restaurant);
      const isNotCancelled = item.MenuStatus !== 'cancelled';
      
      let isRightCategory = true;
      if (categoryFilters.length > 0) {
        isRightCategory = categoryFilters.includes(item.Category);
      }
      
      let isRightMenu = true;
      if (menuFilters.length > 0) {
        const menuId = item.id || item.menuId;
        isRightMenu = menuFilters.includes(menuId);
      }
      
      return isRightRestaurant && isNotCancelled && isRightCategory && isRightMenu;
    })
    .reduce((sum, item) => sum + (Number(item.Price || 0) * Number(item.Quantity || 1)), 0);
}

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    allOrders: [],
    allMenus: [],
    allRestaurants: [],

    timeFilter: "thisMonth",
    customStartDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
    customEndDate: new Date().toISOString().split("T")[0],
    restaurantFilters: [],
    menuCategoryFilters: [],
    menuFilters: [],

    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    totalRestaurants: 0,
    totalCommission: 0,
    netPayouts: 0,

    topRestaurants: [],
    topMenuItems: [],
    recentOrders: [],
    orderStatuses: { pending: 0, cooking: 0, dispatched: 0, completed: 0, cancelled: 0 },

    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],

    availableRestaurants: [],
    availableCategories: [],
    availableMenus: [],

    ordersLoading: true,
    menusLoading: true,
    restaurantsLoading: true,

    unsubscribeOrders: null,
    unsubscribeMenus: null,
    unsubscribeRestaurants: null,
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.menusLoading || state.restaurantsLoading,
    
    salesChartSeries: (state) => [{ name: "ยอดขาย (บาท)", data: state.revenueByDay.map((day) => day.revenue) }],
    categoryChartSeries: (state) => state.categoriesCount.map((cat) => cat.count),
    peakHoursChartSeries: (state) => [{ name: "จำนวนออเดอร์", data: state.ordersByHour.map((h) => h.count) }],
    
    hasActiveFilters: (state) => 
      state.restaurantFilters.length > 0 || 
      state.menuCategoryFilters.length > 0 || 
      state.menuFilters.length > 0,

    revenueByRestaurant: (state) => {
      const restMap = {};
      state.allRestaurants.forEach(r => restMap[r.Name] = 0);
      
      const { start, end } = getTimeRange(state.timeFilter, state.customStartDate, state.customEndDate);

      state.allOrders
        .filter(o => isOrderInTimeRange(o, start, end))
        .forEach(order => {
          if (order.Menu && order.OrderStatus === 'completed') {
            order.Menu.forEach(item => {
              if (item.MenuStatus !== 'cancelled' && restMap[item.Restaurant] !== undefined) {
                restMap[item.Restaurant] += (Number(item.Price || 0) * Number(item.Quantity || 1));
              }
            });
          }
        });

      return Object.entries(restMap).map(([name, revenue]) => ({ name, revenue }));
    }
  },

  actions: {
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },

    toggleRestaurantFilter(name) {
      const index = this.restaurantFilters.indexOf(name);
      if (index > -1) this.restaurantFilters.splice(index, 1);
      else this.restaurantFilters.push(name);
      this.applyFilters();
    },

    clearRestaurantFilters() {
      this.restaurantFilters = [];
      this.applyFilters();
    },

    toggleCategoryFilter(category) {
      const index = this.menuCategoryFilters.indexOf(category);
      if (index > -1) this.menuCategoryFilters.splice(index, 1);
      else this.menuCategoryFilters.push(category);
      this.applyFilters();
    },

    clearCategoryFilters() {
      this.menuCategoryFilters = [];
      this.applyFilters();
    },

    toggleMenuFilter(id) {
      const index = this.menuFilters.indexOf(id);
      if (index > -1) this.menuFilters.splice(index, 1);
      else this.menuFilters.push(id);
      this.applyFilters();
    },

    clearMenuFilters() {
      this.menuFilters = [];
      this.applyFilters();
    },

    clearAllFilters() {
      this.restaurantFilters = [];
      this.menuCategoryFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },

    setCustomDates(start, end) {
      this.customStartDate = start;
      this.customEndDate = end;
      if (this.timeFilter === "custom") this.applyFilters();
    },

    applyFilters() {
      const { start, end } = getTimeRange(this.timeFilter, this.customStartDate, this.customEndDate);

      const filteredOrders = this.allOrders.filter(o => isOrderInTimeRange(o, start, end));
      
      let revenue = 0;
      let commission = 0;
      let filteredOrdersCount = 0;
      const statusCounts = { pending: 0, cooking: 0, dispatched: 0, completed: 0, cancelled: 0 };
      const menuMetrics = {};
      const restRevenue = {};

      const restRateMap = {};
      this.allRestaurants.forEach(r => restRateMap[r.Name] = Number(r.CommissionRate || 0));

      filteredOrders.forEach(order => {
        const orderRev = calculateOrderRevenue(order, this.restaurantFilters, this.menuCategoryFilters, this.menuFilters);
        
        if (orderRev > 0 || (this.restaurantFilters.length === 0 && this.menuCategoryFilters.length === 0 && this.menuFilters.length === 0)) {
          revenue += orderRev;
          if (orderRev > 0) filteredOrdersCount++;
          
          if (order.Menu) {
            order.Menu.forEach(item => {
              const isRightRest = this.restaurantFilters.length === 0 || this.restaurantFilters.includes(item.Restaurant);
              const isRightCat = this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(item.Category);
              const menuId = item.id || item.menuId;
              const isRightMenu = this.menuFilters.length === 0 || this.menuFilters.includes(menuId);

              if (item.MenuStatus !== 'cancelled' && isRightRest && isRightCat && isRightMenu) {
                const itemRev = Number(item.Price || 0) * Number(item.Quantity || 1);
                commission += (itemRev * (restRateMap[item.Restaurant] || 0)) / 100;
                
                if (!menuMetrics[menuId]) menuMetrics[menuId] = { name: item.Name, qty: 0, revenue: 0, image: item.ImageUrl };
                menuMetrics[menuId].qty += Number(item.Quantity || 1);
                menuMetrics[menuId].revenue += itemRev;

                restRevenue[item.Restaurant] = (restRevenue[item.Restaurant] || 0) + itemRev;
              }
            });
          }

          const status = order.OrderStatus || 'pending';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        }
      });

      this.totalRevenue = revenue;
      this.totalCommission = commission;
      this.netPayouts = revenue - commission;
      this.totalOrders = filteredOrdersCount;
      this.orderStatuses = statusCounts;

      this.topRestaurants = Object.entries(restRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
      this.topMenuItems = Object.values(menuMetrics).sort((a,b) => b.qty - a.qty).slice(0, 5);
      this.recentOrders = [...filteredOrders].sort((a,b) => (b.CreatedAt?.toMillis?.() || 0) - (a.CreatedAt?.toMillis?.() || 0)).slice(0, 10);

      const catList = this.allMenus.map(m => m.Category).filter(c => c && c.trim() !== '');
      this.availableCategories = [...new Set(catList)];
      
      this.availableMenus = this.allMenus
        .filter(m => this.restaurantFilters.length === 0 || this.restaurantFilters.includes(m.Restaurant))
        .filter(m => this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(m.Category))
        .map(m => ({ id: m.id, Name: m.Name }));

      this.buildDailyRevenueChart(filteredOrders);
      this.buildPeakHoursChart(filteredOrders);
      this.buildCategoryStats(this.allMenus);
    },

    async loadDashboardData() {
      this.clearListeners();
      const ordersQuery = query(collection(db, "Order"));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        this.allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.ordersLoading = false;
        this.applyFilters();
      });

      const menusQuery = query(collection(db, "Menu"));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        this.allMenus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.totalMenus = this.allMenus.length;
        this.menusLoading = false;
        this.applyFilters();
      });

      const restaurantsQuery = query(collection(db, "Restaurant"));
      this.unsubscribeRestaurants = onSnapshot(restaurantsQuery, (snapshot) => {
        this.allRestaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.totalRestaurants = this.allRestaurants.length;
        this.availableRestaurants = this.allRestaurants.map(r => r.Name);
        this.restaurantsLoading = false;
        this.applyFilters();
      });
    },

    clearListeners() {
      this.unsubscribeOrders?.();
      this.unsubscribeMenus?.();
      this.unsubscribeRestaurants?.();
      this.unsubscribeOrders = null;
      this.unsubscribeMenus = null;
      this.unsubscribeRestaurants = null;
    },

    buildDailyRevenueChart(orders) {
      this.revenueByDay = buildDailyRevenue(orders, (o) => 
        calculateOrderRevenue(o, this.restaurantFilters, this.menuCategoryFilters, this.menuFilters)
      );
    },

    buildCategoryStats(menus) {
      this.categoriesCount = getCategoryStats(menus);
    },

    buildPeakHoursChart(orders) {
      this.ordersByHour = buildPeakHours(orders);
    }
  }
});
