import { defineStore } from 'pinia';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Restaurant Dashboard Store
 * Handles personalized analytics for restaurant owners, including revenue tracking, 
 * top menu items, and order volume distribution.
 */
export const useRestaurantDashboardStore = defineStore('restaurantDashboard', {
  // --- State ---
  state: () => ({
    // Data List
    allOrders: [],      // Orders containing items from this restaurant
    allMenus: [],       // Menu items belonging to this restaurant
    
    // Filters
    timeFilter: '7days',
    currentRestaurant: null,

    // Summary Metrics
    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,

    // Status & Rankings
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },
    topMenuItems: [],
    recentOrders: [],

    // Chart Data
    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],

    // Loading & Cleanup
    ordersLoading: true,
    menusLoading: true,
    unsubscribeOrders: null,
    unsubscribeMenus: null,
  }),

  // --- Getters ---
  getters: {
    /**
     * Global loading state summary.
     */
    isLoading: (state) => state.ordersLoading || state.menusLoading,

    /**
     * ApexCharts: Series data for Revenue Bar Chart.
     */
    salesChartSeries: (state) => {
      const data = state.revenueByDay.map(day => day.revenue);
      return [{ name: 'ยอดขาย (บาท)', data }];
    },

    /**
     * ApexCharts: Options for Revenue Bar Chart.
     */
    salesChartOptions: (state) => {
      const categories = state.revenueByDay.map(day => day.date);
      return {
        chart: { id: 'revenue-bar-chart', toolbar: { show: false }, fontFamily: 'inherit' },
        xaxis: {
          categories: categories,
          labels: { style: { colors: '#64748b', fontSize: '12px' } }
        },
        yaxis: {
          labels: {
            formatter: (value) => `฿${value.toLocaleString()}`,
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        dataLabels: { enabled: false },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
        colors: ['#4f46e5'],
        tooltip: { y: { formatter: (val) => "฿" + val.toLocaleString() } }
      };
    },

    /**
     * ApexCharts: Series data for Category Donut Chart.
     */
    categoryChartSeries: (state) => {
      return state.categoriesCount.map(cat => cat.count);
    },

    /**
     * ApexCharts: Options for Category Donut Chart.
     */
    categoryChartOptions: (state) => {
      const labels = state.categoriesCount.map(cat => cat.name);
      return {
        chart: { id: 'category-donut-chart', fontFamily: 'inherit' },
        labels: labels,
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
        legend: { position: 'bottom' },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { show: true },
                value: { show: true, formatter: (val) => val },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'รวม',
                  formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                }
              }
            }
          }
        }
      };
    },

    /**
     * ApexCharts: Series data for Peak Hours Area Chart.
     */
    peakHoursChartSeries: (state) => {
      const data = state.ordersByHour.map(h => h.count);
      return [{ name: 'จำนวนออเดอร์', data }];
    },

    /**
     * ApexCharts: Options for Peak Hours Area Chart.
     */
    peakHoursChartOptions: (state) => {
      const categories = state.ordersByHour.map(h => h.hour);
      return {
        chart: { id: 'peak-hours-chart', toolbar: { show: false }, fontFamily: 'inherit', type: 'area' },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1, 
            opacityFrom: 0.4, 
            opacityTo: 0.05, 
            stops: [0, 90, 100]
          }
        },
        xaxis: {
          categories: categories,
          labels: { style: { colors: '#64748b', fontSize: '10px' } },
          tooltip: { enabled: false }
        },
        yaxis: {
          labels: { style: { colors: '#64748b', fontSize: '12px' }, formatter: (val) => Math.floor(val) }
        },
        colors: ['#f59e0b'],
        tooltip: { y: { formatter: (val) => val + " ออเดอร์" } }
      };
    }
  },

  // --- Actions ---
  actions: {
    /**
     * Update the time range filter and re-process data.
     */
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },

    /**
     * Primary data processor for filtering raw orders into restaurant-specific metrics.
     */
    applyFilters() {
      if (!this.currentRestaurant) return;

      let filteredRevenue = 0;
      let filteredOrdersCount = 0;
      let validOrdersForChart = [];
      let recentOrdersArray = [];

      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const menuMetricsMap = {};

      // 1. Time Boundary Setup
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      let startTime = new Date(0);
      if (this.timeFilter === 'today') {
        startTime = new Date();
        startTime.setHours(0, 0, 0, 0);
      } else if (this.timeFilter === '7days') {
        startTime = new Date();
        startTime.setHours(0, 0, 0, 0);
        startTime.setDate(startTime.getDate() - 6);
      } else if (this.timeFilter === 'thisMonth') {
        startTime = new Date();
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
      }

      // 2. Filter Orders for this Restaurant
      this.allOrders.forEach(order => {
        const createdAt = order.CreatedAt;
        if (!createdAt) return;

        const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        if (orderDate < startTime || orderDate > now) return;

        // Isolate items sold by this restaurant in the global order
        const myItems = (order.Menu || [])
          .filter(item => item.Restaurant === this.currentRestaurant);

        if (myItems.length > 0) {
          const cStatus = order.statusOrder || 'pending';
          statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
          recentOrdersArray.push(order);

          // 3. Aggregate Revenue for Successful Items
          if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
            const validRevenueItems = myItems.filter(i => i.itemStatus !== 'cancelled' && i.itemStatus !== 'returned');

            if (validRevenueItems.length > 0) {
              filteredOrdersCount++;
              let orderLocalTotal = 0;

              validRevenueItems.forEach(item => {
                const itemQty = Number(item.Quantity || 0);
                const itemRevenue = Number(item.Price || 0) * itemQty;
                orderLocalTotal += itemRevenue;

                // Track popular menu items
                const menuId = item.id || item.menuId;
                if (!menuMetricsMap[menuId]) {
                  menuMetricsMap[menuId] = {
                    name: item.Name || 'ไม่ระบุชื่อเมนู',
                    qty: 0,
                    revenue: 0,
                    image: item.ImageUrl
                  };
                }
                menuMetricsMap[menuId].qty += itemQty;
                menuMetricsMap[menuId].revenue += itemRevenue;
              });

              filteredRevenue += orderLocalTotal;
              validOrdersForChart.push({ ...order, localTotal: orderLocalTotal });
            }
          }
        }
      });

      // 4. Update Rankings & State
      this.orderStatuses = statusCounts;
      this.recentOrders = recentOrdersArray
        .sort((a, b) => {
          const tA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
          const tB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
          return tB - tA;
        })
        .slice(0, 10);

      this.topMenuItems = Object.values(menuMetricsMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      this.totalOrders = filteredOrdersCount;
      this.totalRevenue = filteredRevenue;

      // 5. Build Chart Arrays
      this.processRevenueByDay(validOrdersForChart);
      this.processPeakHours(validOrdersForChart);
      this.processCategoriesCount(this.allMenus);
    },

    /**
     * Clear all active Firestore listeners.
     */
    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeMenus) this.unsubscribeMenus();
      this.unsubscribeOrders = null;
      this.unsubscribeMenus = null;
    },

    /**
     * Primary data loader for the restaurant dashboard. 
     * Sets up real-time sync for Orders and the restaurant's specific Menu.
     */
    async loadDashboardData(restaurantName) {
      if (!restaurantName) return;
      this.currentRestaurant = restaurantName;
      this.clearListeners();

      this.ordersLoading = true;
      this.menusLoading = true;

      // 1. Sync Orders
      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.allOrders = orders;
        this.ordersLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Error fetching dashboard orders:", error);
        this.ordersLoading = false;
      });

      // 2. Sync Menus for this Restaurant
      const menusQuery = query(collection(db, 'Menu'), where('Restaurant', '==', restaurantName));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        const menus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.allMenus = menus;
        this.totalMenus = menus.length;
        this.menusLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Error fetching dashboard menus:", error);
        this.menusLoading = false;
      });
    },

    /**
     * Distribute revenue totals across dates for visual tracking.
     */
    processRevenueByDay(orders) {
      const days = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let daysCount = 6;
      if (this.timeFilter === 'today') daysCount = 0;
      else if (this.timeFilter === 'thisMonth') daysCount = today.getDate() - 1;
      else if (this.timeFilter === 'all') daysCount = 29;

      for (let i = daysCount; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateString = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days[dateString] = 0;
      }

      orders.forEach(order => {
        if (order.localTotal > 0 && order.CreatedAt) {
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          orderDate.setHours(0, 0, 0, 0);
          
          const dateString = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
          if (days[dateString] !== undefined) {
            days[dateString] += Number(order.localTotal);
          }
        }
      });

      this.revenueByDay = Object.keys(days).map(key => ({
        date: key,
        revenue: days[key]
      }));
    },

    /**
     * Map menu items to categories for donut chart visualization.
     */
    processCategoriesCount(menus) {
      const counts = {};
      menus.forEach(m => {
        const cat = m.Category || 'อื่นๆ';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      this.categoriesCount = Object.keys(counts).map(key => ({
        name: key,
        count: counts[key]
      })).sort((a, b) => b.count - a.count);
    },

    /**
     * Analyze order timestamps to determine peak traffic hours.
     */
    processPeakHours(orders) {
      const hourlyDistribution = Array(24).fill(0);
      orders.forEach(order => {
        if (order.CreatedAt) {
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          hourlyDistribution[orderDate.getHours()]++;
        }
      });
      this.ordersByHour = hourlyDistribution.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: count
      }));
    }
  }
});
