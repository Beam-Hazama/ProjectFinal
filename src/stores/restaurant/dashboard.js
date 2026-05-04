import { defineStore } from 'pinia';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

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
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },
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
    filteredTotalMenus: 0,
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
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },

    setCustomDates(start, end) {
      this.customStartDate = start;
      this.customEndDate = end;
      if (this.timeFilter === 'custom') this.applyFilters();
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

    toggleMenuFilter(menuId) {
      const index = this.menuFilters.indexOf(menuId);
      if (index > -1) this.menuFilters.splice(index, 1);
      else this.menuFilters.push(menuId);
      this.applyFilters();
    },

    clearMenuFilters() {
      this.menuFilters = [];
      this.applyFilters();
    },

    clearAllFilters() {
      this.menuCategoryFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },

    async loadDashboardData(restaurantName) {
      this.clearListeners();
      this.currentRestaurant = restaurantName;
      
      const resQuery = query(collection(db, 'Restaurant'), where('Name', '==', restaurantName));
      this.unsubscribeRestaurant = onSnapshot(resQuery, (snapshot) => {
        if (!snapshot.empty) {
          const resData = snapshot.docs[0].data();
          this.commissionRate = Number(resData.CommissionRate || 0);
          this.applyFilters();
        }
      });

      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        this.allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.ordersLoading = false;
        this.applyFilters();
      }, (error) => {
        this.isError = true;
        this.errorMessage = error.message;
      });

      const menusQuery = query(collection(db, 'Menu'), where('Restaurant', '==', restaurantName));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        this.allMenus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.totalMenus = this.allMenus.length;
        this.menusLoading = false;
        this.applyFilters();
      });
    },

    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeMenus) this.unsubscribeMenus();
      if (this.unsubscribeRestaurant) this.unsubscribeRestaurant();
    },

    applyFilters() {
      const now = new Date();
      let startTime = new Date(0);

      if (this.timeFilter === 'today') {
        startTime = new Date(now.setHours(0, 0, 0, 0));
      } else if (this.timeFilter === '7days') {
        startTime = new Date(now.setDate(now.getDate() - 6));
        startTime.setHours(0, 0, 0, 0);
      } else if (this.timeFilter === 'thisMonth') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (this.timeFilter === 'custom') {
        startTime = new Date(this.customStartDate);
        startTime.setHours(0, 0, 0, 0);
      }

      const endTime = this.timeFilter === 'custom' 
        ? new Date(new Date(this.customEndDate).setHours(23, 59, 59, 999))
        : new Date();

      const validOrders = this.allOrders.filter(order => {
        if (!order.CreatedAt) return false;
        const createdAt = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
        const inTimeRange = createdAt >= startTime && createdAt <= endTime;
        if (!inTimeRange) return false;
        if (order.Menu) return order.Menu.some(item => item.Restaurant === this.currentRestaurant);
        return false;
      });

      const validOrdersForChart = this.allOrders.filter(order => {
        if (!order.CreatedAt) return false;
        if (order.Menu) return order.Menu.some(item => item.Restaurant === this.currentRestaurant);
        return false;
      });

      let revenue = 0;
      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const menuMetricsMap = {};

      validOrders.forEach(order => {
        let orderHasRestaurantItem = false;
        let orderRevenue = 0;

        if (order.Menu) {
          order.Menu.forEach(item => {
            if (item.Restaurant === this.currentRestaurant) {
              const isNotCancelled = item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned';
              const isRightCategory = this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(item.Category);
              const menuId = item.id || item.menuId;
              const isRightMenu = this.menuFilters.length === 0 || this.menuFilters.includes(menuId);

              if (isNotCancelled && isRightCategory && isRightMenu) {
                const itemRev = Number(item.Price || 0) * Number(item.Quantity || 1);
                orderRevenue += itemRev;
                orderHasRestaurantItem = true;

                if (!menuMetricsMap[menuId]) {
                  menuMetricsMap[menuId] = {
                    name: item.Name || 'ไม่ระบุชื่อเมนู',
                    qty: 0,
                    revenue: 0,
                    image: item.ImageUrl
                  };
                }
                menuMetricsMap[menuId].qty += Number(item.Quantity || 1);
                menuMetricsMap[menuId].revenue += itemRev;
              }
            }
          });
        }

        if (orderHasRestaurantItem) {
          revenue += orderRevenue;
          const status = order.statusOrder || 'pending';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        }
      });

      this.totalRevenue = revenue;
      this.totalOrders = validOrders.filter(o => {
        if (!o.Menu) return false;
        return o.Menu.some(item => {
           const isRightRest = item.Restaurant === this.currentRestaurant;
           const isRightCat = this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(item.Category);
           const menuId = item.id || item.menuId;
           const isRightMenu = this.menuFilters.length === 0 || this.menuFilters.includes(menuId);
           return isRightRest && isRightCat && isRightMenu && item.itemStatus !== 'cancelled';
        });
      }).length;
      this.orderStatuses = statusCounts;
      this.topMenuItems = Object.values(menuMetricsMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

      this.recentOrders = [...validOrders].sort((a, b) => {
          const timeA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
          const timeB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
          return timeB - timeA;
      }).slice(0, 10);

      let filteredMenus = this.allMenus;
      if (this.menuCategoryFilters.length > 0) filteredMenus = filteredMenus.filter(m => this.menuCategoryFilters.includes(m.Category));
      this.filteredTotalMenus = filteredMenus.length;
      this.buildCategoryStats(filteredMenus);

      const catList = this.allMenus.map(m => m.Category).filter(c => c && c.trim() !== '');
      this.availableCategories = [...new Set(catList)];
      this.availableMenus = filteredMenus.map(m => ({ id: m.id, Name: m.Name, Restaurant: m.Restaurant }));

      this.buildDailyRevenueChart(validOrdersForChart);
      this.buildPeakHoursChart(validOrdersForChart);
    },

    buildDailyRevenueChart(orders) {
      const days = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days[label] = 0;
      }

      orders.forEach(order => {
        if (!order.CreatedAt) return;
        const date = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
        const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (days[label] !== undefined) {
          if (order.Menu) {
            order.Menu.forEach(item => {
              if (item.Restaurant === this.currentRestaurant && item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned') {
                days[label] += (Number(item.Price || 0) * Number(item.Quantity || 1));
              }
            });
          }
        }
      });
      this.revenueByDay = Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
    },

    buildCategoryStats(menus) {
      const counts = {};
      menus.forEach(menu => {
        const cat = menu.Category || 'อื่นๆ';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      this.categoriesCount = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    },

    buildPeakHoursChart(orders) {
      const hours = Array(24).fill(0);
      orders.forEach(order => {
        if (!order.CreatedAt) return;
        const date = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
        hours[date.getHours()]++;
      });
      this.ordersByHour = hours.map((count, hour) => ({ hour: `${hour.toString().padStart(2, '0')}:00`, count }));
    }
  }
});
