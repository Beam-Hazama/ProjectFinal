import { defineStore } from 'pinia';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { toDayKey } from '@/utils/format';
import {
  getTimeRange,
  buildDailyRevenue,
  buildPeakHours,
  buildCategoryStats as getCategoryStats,
  isOrderInTimeRange,
  extractUniqueCategories,
  getSortedRecentOrders,
  getTopMenuItems,
  addMenuMetric,
} from '@/utils/dashboardHelpers';
import { sharedFilterActions } from '@/stores/shared/filterActions';

export const useRestaurantDashboardStore = defineStore('restaurantDashboard', {

  state: () => ({
    allOrders: [],
    allMenus: [],
    timeFilter: 'thisMonth',
    customStartDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], 
    customEndDate: new Date().toISOString().split('T')[0],
    menuCategoryFilters: [],
    menuFilters: [],
    currentRestaurant: null,
    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    commissionRate: 0,
    orderStatuses: { pending: 0, cooking: 0, dispatched: 0, completed: 0, cancelled: 0 },
    topMenuItems: [],
    recentOrders: [],
    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],
    ordersLoading: true,
    menusLoading: true,
    unsubscribeOrders: null,
    unsubscribeMenus: null,
    unsubscribeRestaurant: null,
    availableMenus: [],
    availableCategories: [],
    isError: false,
    errorMessage: ''
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.menusLoading,
    salesChartSeries: (state) => [{ name: 'ยอดขาย (บาท)', data: state.revenueByDay.map(d => d.revenue) }],
    categoryChartSeries: (state) => state.categoriesCount.map(c => c.count),
    peakHoursChartSeries: (state) => [{ name: 'จำนวนออเดอร์', data: state.ordersByHour.map(h => h.count) }],
    totalCommission: (state) => (state.totalRevenue * (state.commissionRate || 0)) / 100,
    hasActiveFilters: (state) => state.menuCategoryFilters.length > 0 || state.menuFilters.length > 0
  },

  actions: {
    ...sharedFilterActions,

    clearAllFilters() {
      this.menuCategoryFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },

    async loadDashboardData(restaurantName) {
      this.clearListeners();
      this.currentRestaurant = restaurantName;
      
      // 1. Get Restaurant Info (Commission Rate)
      const resQuery = query(collection(db, 'Restaurant'), where('RestaurantName', '==', restaurantName));
      this.unsubscribeRestaurant = onSnapshot(resQuery, (snapshot) => {
        if (!snapshot.empty) {
          const resData = snapshot.docs[0].data();
          this.commissionRate = Number(resData.CommissionRate || 0);
          this.applyFilters();
        }
      });

      // 2. Optimized Order Query (Only relevant restaurant)
      const ordersQuery = query(
        collection(db, 'Order'),
        where('RestaurantsInOrder', 'array-contains', restaurantName)
      );

      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        this.allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.ordersLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Orders Snapshot Error:", error);
        this.isError = true;
        this.errorMessage = "ไม่สามารถโหลดข้อมูลออเดอร์ได้: " + error.message;
      });

      const menusQuery = query(collection(db, 'Menu'), where('RestaurantName', '==', restaurantName));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        this.allMenus = snapshot.docs.map(doc => ({ MenuId: doc.id, ...doc.data() }));
        this.totalMenus = this.allMenus.length;
        this.menusLoading = false;
        this.applyFilters();
      });
    },

    clearListeners() {
      this.unsubscribeOrders?.();
      this.unsubscribeMenus?.();
      this.unsubscribeRestaurant?.();
      this.unsubscribeOrders = null;
      this.unsubscribeMenus = null;
      this.unsubscribeRestaurant = null;
    },

    applyFilters() {
      const { start: startTime, end: endTime } = getTimeRange(this.timeFilter, this.customStartDate, this.customEndDate);

      const validOrders = this.allOrders.filter(order => isOrderInTimeRange(order, startTime, endTime));

      const validOrdersForChart = this.allOrders; // No time filter for chart items calculation itself, or use validOrders?

      let revenue = 0;
      const statusCounts = { pending: 0, cooking: 0, dispatched: 0, completed: 0, cancelled: 0 };
      const menuMetricsMap = {};

      validOrders.forEach(order => {
        let orderHasRestaurantItem = false;
        let orderRevenue = 0;

        // Only count completed orders towards revenue and stats
        const isCompleted = order.OrderStatus === 'completed';

        if (order.Menu) {
          order.Menu.forEach(item => {
            if ((item.RestaurantName || item.Restaurant) === this.currentRestaurant) {
               const isNotCancelled = item.MenuStatus !== 'cancelled';
              const isRightCategory = this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(item.Category);
              const menuId = item.MenuId;
              const isRightMenu = this.menuFilters.length === 0 || this.menuFilters.includes(menuId);

              if (isNotCancelled && isRightCategory && isRightMenu) {
                const itemRev = Number(item.Price || 0) * Number(item.Quantity || 1);
                
                // Only add to revenue if order is completed
                if (isCompleted) {
                  orderRevenue += itemRev;
                  
                  addMenuMetric(menuMetricsMap, menuId, item, itemRev);
                }
                
                orderHasRestaurantItem = true;
              }
            }
          });
        }

        if (orderHasRestaurantItem) {
          if (isCompleted) {
            revenue += orderRevenue;
          }
          const status = order.OrderStatus || 'pending';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        }
      });

      this.totalRevenue = revenue;
      this.totalOrders = validOrders.filter(o => o.OrderStatus === 'completed').length;
      this.orderStatuses = statusCounts;
      this.topMenuItems = getTopMenuItems(menuMetricsMap);
      this.recentOrders = getSortedRecentOrders(validOrders);

      let filteredMenus = this.allMenus;
      if (this.menuCategoryFilters.length > 0) filteredMenus = filteredMenus.filter(m => this.menuCategoryFilters.includes(m.Category));
      this.buildCategoryStats(filteredMenus);

      this.availableCategories = extractUniqueCategories(this.allMenus);
      this.availableMenus = filteredMenus.map(m => ({ MenuId: m.MenuId, Name: m.MenuName, Restaurant: m.RestaurantName || m.Restaurant }));

      this.buildDailyRevenueChart(this.allOrders);
      this.buildPeakHoursChart(this.allOrders);
    },

    buildDailyRevenueChart(orders) {
      this.revenueByDay = buildDailyRevenue(orders, (order) => {
        let orderRevenue = 0;
        if (order.Menu && order.OrderStatus === 'completed') {
          order.Menu.forEach(item => {
            if ((item.RestaurantName || item.Restaurant) === this.currentRestaurant && item.MenuStatus !== 'cancelled') {
              orderRevenue += (Number(item.Price || 0) * Number(item.Quantity || 1));
            }
          });
        }
        return orderRevenue;
      });
    },

    buildCategoryStats(menus) {
      this.categoriesCount = getCategoryStats(menus);
    },

    buildPeakHoursChart(orders) {
      this.ordersByHour = buildPeakHours(orders);
    }
  }
});
