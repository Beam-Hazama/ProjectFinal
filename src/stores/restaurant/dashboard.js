import { defineStore } from 'pinia';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toDayKey } from '@/utils/format';

import {
  getTimeRange,
  buildDailyRevenue,
  buildMonthlyRevenue,
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
    inactiveMenus: [],
    financialData: [], // { date, revenue, commission, net }
    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],
    averagePrepTime: 0,
    successRate: 0,
    menuEngineeringData: [],
    menuComboData: [],

    monthlyGoal: 0,
    restaurantId: null,
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
    netProfit: (state) => state.totalRevenue - ((state.totalRevenue * (state.commissionRate || 0)) / 100),
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
      // Try exact, then trim if not found
      this.currentRestaurant = restaurantName;
      
      const resQuery = query(collection(db, 'Restaurant'), where('RestaurantName', '==', restaurantName));
      
      this.unsubscribeRestaurant = onSnapshot(resQuery, (snapshot) => {
        let canonicalName = restaurantName;
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const resData = doc.data();
          this.restaurantId = doc.id;
          this.commissionRate = Number(resData.CommissionRate || 0);
          this.monthlyGoal = Number(resData.MonthlyGoal || 0);
          canonicalName = resData.RestaurantName; // Use exact name from DB
          this.currentRestaurant = canonicalName;
        }

        // Now query orders with the name we found
        this.setupOrdersListener(canonicalName);
      });

      const menusQuery = query(collection(db, 'Menu'), where('RestaurantName', '==', restaurantName));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        this.allMenus = snapshot.docs.map(doc => ({ MenuId: doc.id, ...doc.data() }));
        this.totalMenus = this.allMenus.length;
        this.menusLoading = false;
        this.applyFilters();
      });
    },

    setupOrdersListener(name) {
      this.unsubscribeOrders?.();
      
      const ordersQuery = query(
        collection(db, 'Order'),
        where('RestaurantsInOrder', 'array-contains', name)
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
      let { start: startTime, end: endTime } = getTimeRange(this.timeFilter, this.customStartDate, this.customEndDate);
      
      
      if (this.timeFilter === 'all' && this.allOrders.length > 0) {
        const orderDates = this.allOrders
          .map(o => o.CreatedAt?.toDate?.() || new Date(o.CreatedAt))
          .filter(d => d instanceof Date && !isNaN(d));
        if (orderDates.length > 0) {
          startTime = new Date(Math.min(...orderDates));
          startTime.setHours(0, 0, 0, 0);
        }
      }

      const validOrders = this.allOrders.filter(order => isOrderInTimeRange(order, startTime, endTime));

      

      let revenue = 0;
      const statusCounts = { pending: 0, cooking: 0, dispatched: 0, completed: 0, cancelled: 0 };
      const menuMetricsMap = {};

      validOrders.forEach(order => {
        let orderHasRestaurantItem = false;
        let orderRevenue = 0;

       
        const status = (order.OrderStatus || '').toLowerCase();
        const isCompleted = status === 'completed' || status === 'received';

        if (order.Menu) {
          order.Menu.forEach(item => {
            const itemRestaurant = (item.RestaurantName || item.Restaurant || '').trim();
            if (itemRestaurant === this.currentRestaurant?.trim()) {
             
              if (order.OrderStatus === 'cancelled') {
                orderHasRestaurantItem = true;
                return;
              }

              const isNotCancelled = item.MenuStatus !== 'cancelled';
              const isRightCategory = this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(item.Category);
              const menuId = item.MenuId;
              const isRightMenu = this.menuFilters.length === 0 || this.menuFilters.includes(menuId);

              if (isNotCancelled && isRightCategory && isRightMenu) {
                const itemRev = Number(item.Price || 0) * Number(item.Quantity || 1);

                
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

      const ordersWithRestaurantItems = validOrders.filter(order => {
        if ((order.OrderStatus || '').toLowerCase() === 'cancelled') return false;
        return order.Menu?.some(item => (item.RestaurantName || item.Restaurant || '').trim() === this.currentRestaurant?.trim());
      });

      this.totalRevenue = revenue;
      this.totalOrders = validOrders.filter(o => {
        const s = (o.OrderStatus || '').toLowerCase();
        return s === 'completed' || s === 'received';
      }).length;
      this.orderStatuses = statusCounts;
      this.topMenuItems = getTopMenuItems(menuMetricsMap);
      this.recentOrders = getSortedRecentOrders(validOrders);

      let filteredMenus = this.allMenus;
      if (this.menuCategoryFilters.length > 0) filteredMenus = filteredMenus.filter(m => this.menuCategoryFilters.includes(m.Category));
      this.buildCategoryStats(filteredMenus);

      this.availableCategories = extractUniqueCategories(this.allMenus);
      this.availableMenus = filteredMenus.map(m => ({ MenuId: m.MenuId, Name: m.MenuName, Restaurant: m.RestaurantName || m.Restaurant }));

      this.buildDailyRevenueChart(ordersWithRestaurantItems, startTime, endTime);
      this.buildPeakHoursChart(ordersWithRestaurantItems);



      // Inactive menus (0 orders in last 14 days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const recentOrdersForInactiveCheck = this.allOrders.filter(o => {
        const d = o.CreatedAt?.toDate?.() || new Date(o.CreatedAt);
        return d >= fourteenDaysAgo;
      });
      const activeMenuIds = new Set();
      recentOrdersForInactiveCheck.forEach(o => o.Menu?.forEach(m => activeMenuIds.add(m.MenuId)));
      this.inactiveMenus = this.allMenus
        .filter(m => !activeMenuIds.has(m.MenuId))
        .map(m => ({ id: m.MenuId, name: m.MenuName }));

      // Financial Data by Day
      const dailyFin = {};
      const { start: dStart, end: dEnd } = getTimeRange(this.timeFilter, startTime, endTime);
      const curr = new Date(dStart);
      while(curr <= dEnd) {
          dailyFin[toDayKey(new Date(curr))] = 0;
          curr.setDate(curr.getDate() + 1);
      }

      ordersWithRestaurantItems.forEach(order => {
          if (order.OrderStatus !== 'completed' && order.OrderStatus !== 'received') return;
          const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
          const key = toDayKey(d);
          if (dailyFin[key] !== undefined) {
              let orderRev = 0;
              order.Menu.forEach(item => {
                  if ((item.RestaurantName || item.Restaurant) === this.currentRestaurant && item.MenuStatus !== 'cancelled') {
                      orderRev += (Number(item.Price || 0) * Number(item.Quantity || 1));
                  }
              });
              dailyFin[key] += orderRev;
          }
      });

      this.financialData = Object.entries(dailyFin)
        .map(([date, revenue]) => {
            const comm = (revenue * (this.commissionRate || 0)) / 100;
            return { date, revenue, commission: comm, net: revenue - comm };
        })
        .filter(d => d.revenue > 0)
        .sort((a, b) => {
            const [da, ma] = a.date.split('/');
            const [db, mb] = b.date.split('/');
            return (ma + da).localeCompare(mb + db);
        });

      // 4. Efficiency Metrics (Prep Time & Success Rate)
      const completedOrders = validOrders.filter(o => {
        const s = (o.OrderStatus || '').toLowerCase();
        return ['completed', 'received', 'dispatched'].includes(s);
      });
      const cancelledOrders = validOrders.filter(o => (o.OrderStatus || '').toLowerCase() === 'cancelled');
      
      // Calculate Average Prep Time
      let totalPrepMinutes = 0;
      let ordersWithTimestamps = 0;
      
      completedOrders.forEach(o => {
          if (o.CreatedAt && o.CompletedAt) {
              const start = o.CreatedAt.toDate ? o.CreatedAt.toDate() : new Date(o.CreatedAt);
              const end = o.CompletedAt.toDate ? o.CompletedAt.toDate() : new Date(o.CompletedAt);
              const diffMs = end - start;
              if (diffMs > 0) {
                  totalPrepMinutes += diffMs / (1000 * 60);
                  ordersWithTimestamps++;
              }
          }
      });
      
      this.averagePrepTime = ordersWithTimestamps > 0 ? Math.round(totalPrepMinutes / ordersWithTimestamps) : 0;
      
      // Calculate Success Rate
      const totalDecided = completedOrders.length + cancelledOrders.length;
      this.successRate = totalDecided > 0 ? Math.round((completedOrders.length / totalDecided) * 100) : 100;

      // 5. Menu Engineering Matrix
      this.calculateMenuEngineering(menuMetricsMap);

      // 6. Menu Combo / Cross-sell Analysis
      this.calculateMenuCombos(ordersWithRestaurantItems);

    },

    calculateMenuEngineering(menuMetricsMap) {
      const items = Object.entries(menuMetricsMap).map(([id, stats]) => {
        const qty = Number(stats.qty || 0);
        const rev = Number(stats.revenue || 0);
        const price = qty > 0 ? rev / qty : 0;
        const profit = price;
        return {
          id,
          name: stats.name,
          quantity: stats.qty,
          revenue: stats.revenue,
          profit: profit,
          totalProfit: profit * stats.qty,
          category: stats.category
        };
      }).filter(item => item.quantity > 0);

      if (items.length === 0) {
        this.menuEngineeringData = [];
        return;
      }

      // Calculate Averages
      const avgProfit = items.reduce((sum, item) => sum + item.profit, 0) / items.length;
      const avgQuantity = items.reduce((sum, item) => sum + item.quantity, 0) / items.length;

      this.menuEngineeringData = items.map(item => {
        const highProfit = item.profit >= avgProfit;
        const highVolume = item.quantity >= avgQuantity;

        let type = '';
        if (highProfit && highVolume) type = 'Star';
        else if (!highProfit && highVolume) type = 'Plowhorse';
        else if (highProfit && !highVolume) type = 'Puzzle';
        else type = 'Dog';

        return { ...item, type, avgProfit, avgQuantity };
      });
    },

    calculateMenuCombos(orders) {
      const comboMap = {};
      const menuNameMap = {};

      orders.forEach(order => {
        const status = (order.OrderStatus || '').toLowerCase();
        if (status !== 'completed' && status !== 'received') return;

        const items = (order.Menu || []).filter(item => {
          const restaurant = (item.RestaurantName || item.Restaurant || '').trim();
          return restaurant === this.currentRestaurant?.trim() && item.MenuStatus !== 'cancelled';
        });

        items.forEach(item => {
          if (item.MenuId && item.MenuName) menuNameMap[item.MenuId] = item.MenuName;
        });

        const menuIds = [...new Set(items.map(i => i.MenuId).filter(Boolean))];

        for (let i = 0; i < menuIds.length; i++) {
          for (let j = i + 1; j < menuIds.length; j++) {
            const a = menuIds[i] < menuIds[j] ? menuIds[i] : menuIds[j];
            const b = menuIds[i] < menuIds[j] ? menuIds[j] : menuIds[i];
            const key = `${a}|||${b}`;
            comboMap[key] = (comboMap[key] || 0) + 1;
          }
        }
      });

      this.menuComboData = Object.entries(comboMap)
        .map(([key, count]) => {
          const [aId, bId] = key.split('|||');
          return {
            key,
            menuA: { id: aId, name: menuNameMap[aId] || 'ไม่ทราบชื่อ' },
            menuB: { id: bId, name: menuNameMap[bId] || 'ไม่ทราบชื่อ' },
            count
          };
        })
        .filter(c => c.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },

    buildDailyRevenueChart(orders, start, end) {
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      const builder = diffDays > 40 ? buildMonthlyRevenue : buildDailyRevenue;

      this.revenueByDay = builder(orders, (order) => {
        let orderRevenue = 0;
        if (order.Menu && (order.OrderStatus === 'completed' || order.OrderStatus === 'received')) {
          order.Menu.forEach(item => {
            if ((item.RestaurantName || item.Restaurant) === this.currentRestaurant && item.MenuStatus !== 'cancelled') {
              orderRevenue += (Number(item.Price || 0) * Number(item.Quantity || 1));
            }
          });
        }
        return orderRevenue;
      }, start, end);
    },

    buildCategoryStats(menus) {
      this.categoriesCount = getCategoryStats(menus);
    },

    buildPeakHoursChart(orders) {
      this.ordersByHour = buildPeakHours(orders);
    },

    async updateMonthlyGoal(amount) {
      if (!this.restaurantId) return;
      
      const restRef = doc(db, 'Restaurant', this.restaurantId);
      
      try {
        await updateDoc(restRef, {
          MonthlyGoal: Number(amount)
        });
        this.monthlyGoal = Number(amount);
      } catch (error) {
        console.error("Error updating monthly goal:", error);
      }
    }
  }
});
