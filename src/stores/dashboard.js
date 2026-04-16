import { defineStore } from 'pinia';
import { collection, onSnapshot, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Global Admin Dashboard Store
 * Handles system-wide analytics, revenue tracking, and order distribution for Admins.
 * Integrates with ApexCharts for data visualization.
 */
export const useDashboardStore = defineStore('dashboard', {
  // --- State ---
  state: () => ({
    // Raw Data
    allOrders: [],
    allMenus: [],
    allRestaurants: [],
    
    // Filter Selections
    timeFilter: '7days',
    restaurantFilter: 'all',
    menuCategoryFilter: 'all',
    menuFilter: 'all',

    // Calculated Metrics
    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    filteredTotalMenus: 0,
    totalRestaurants: 0,

    // Analytics Sets
    topRestaurants: [],
    topMenuItems: [],
    recentOrders: [],
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },
    
    // Chart Processing Arrays
    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],

    // Dropdown Source Data
    availableRestaurants: [],
    availableCategories: [],
    availableMenus: [],

    // Status Tracking
    ordersLoading: true,
    menusLoading: true,
    restaurantsLoading: true,

    // Firestore Unsubscribe Cleanup
    unsubscribeOrders: null,
    unsubscribeMenus: null,
    unsubscribeRestaurants: null,
    unsubscribeCategories: null,
  }),

  // --- Getters ---
  getters: {
    /**
     * Global loading state summary.
     */
    isLoading: (state) => state.ordersLoading || state.menusLoading || state.restaurantsLoading,

    /**
     * ApexCharts: Series data for Revenue Bar Chart.
     */
    salesChartSeries: (state) => {
      const data = state.revenueByDay.map(day => day.revenue);
      return [{ name: 'ยอดขาย (บาท)', data }];
    },

    /**
     * ApexCharts: Configuration options for Revenue Bar Chart.
     */
    salesChartOptions: (state) => {
      const categories = state.revenueByDay.map(day => day.date);
      return {
        chart: {
          id: 'revenue-bar-chart',
          toolbar: { show: false },
          fontFamily: 'inherit',
        },
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
        plotOptions: {
          bar: { borderRadius: 6, columnWidth: '45%' }
        },
        colors: ['#4f46e5'],
        tooltip: {
          y: { formatter: (val) => "฿" + val.toLocaleString() }
        }
      };
    },

    /**
     * ApexCharts: Series data for Category Donut Chart.
     */
    categoryChartSeries: (state) => {
      return state.categoriesCount.map(cat => cat.count);
    },

    /**
     * ApexCharts: Configuration options for Category Donut Chart.
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
     * ApexCharts: Configuration options for Peak Hours Area Chart.
     */
    peakHoursChartOptions: (state) => {
      const categories = state.ordersByHour.map(h => h.hour);
      return {
        chart: {
          id: 'peak-hours-chart',
          toolbar: { show: false },
          fontFamily: 'inherit',
          type: 'area'
        },
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
    // --- Filter Setters ---
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },
    setRestaurantFilter(filter) {
      this.restaurantFilter = filter;
      this.applyFilters();
    },
    setMenuCategoryFilter(filter) {
      this.menuCategoryFilter = filter;
      this.applyFilters();
    },
    setMenuFilter(filter) {
      this.menuFilter = filter;
      this.applyFilters();
    },

    /**
     * Centralized logic to filter allOrders based on current UI selections.
     * Re-calculates all metrics and chart data.
     */
    applyFilters() {
      let filteredRevenue = 0;
      let filteredOrdersCount = 0;
      let validOrdersForChart = [];
      let recentOrdersArray = [];

      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const restRevenueMap = {};
      const menuMetricsMap = {};

      // 1. Time Boundary Configuration
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      let startTime = new Date(0); // Default: All time
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

      // 2. Data Lookup Preparation
      const categoryMap = {};
      const menusDict = {};
      this.allMenus.forEach(m => {
        if (m.id) {
          categoryMap[m.id] = m.Category;
          menusDict[m.id] = m;
        }
      });

      // 3. Main Filtering Loop
      this.allOrders.forEach(order => {
        const createdAt = order.CreatedAt;
        if (!createdAt) return;

        const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        if (orderDate < startTime || orderDate > now) return;

        // Legacy Order Handling (No Menu array)
        if (!order.Menu || order.Menu.length === 0) {
          if (this.restaurantFilter !== 'all' || this.menuCategoryFilter !== 'all' || this.menuFilter !== 'all') {
            return;
          }
          const cStatus = order.statusOrder || 'pending';
          statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
          recentOrdersArray.push(order);

          if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
            filteredOrdersCount++;
            filteredRevenue += Number(order.localTotal || 0);
            validOrdersForChart.push({ ...order, filteredLocalTotal: order.localTotal });
          }
          return;
        }

        // Active Order Selection based on Multi-level Filters
        const matchingItems = order.Menu.filter(item => {
          // Restaurant Check
          if (this.restaurantFilter !== 'all' && item.Restaurant !== this.restaurantFilter) return false;
          
          // Category Check
          if (this.menuCategoryFilter !== 'all') {
            const itemCategory = categoryMap[item.id] || categoryMap[item.menuId] || 'ไม่ระบุหมวดหมู่';
            if (itemCategory !== this.menuCategoryFilter) return false;
          }
          
          // Specific Menu Check
          if (this.menuFilter !== 'all') {
            const itemId = item.menuId || item.id;
            if (itemId !== this.menuFilter) return false;
          }
          return true;
        });

        // 4. Metric Aggregation for Matched Orders
        if (matchingItems.length > 0) {
          const cStatus = order.statusOrder || 'pending';
          statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
          recentOrdersArray.push(order);

          if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
            const validRevenueItems = matchingItems.filter(i => i.itemStatus !== 'cancelled' && i.itemStatus !== 'returned');
            
            if (validRevenueItems.length > 0) {
              filteredOrdersCount++;
              let orderLocalTotal = 0;

              validRevenueItems.forEach(item => {
                const itemQty = Number(item.Quantity || 0);
                const itemRevenue = Number(item.Price || 0) * itemQty;
                orderLocalTotal += itemRevenue;

                // Restaurant Ranking Data
                const restName = item.Restaurant || 'ไม่ระบุร้าน';
                restRevenueMap[restName] = (restRevenueMap[restName] || 0) + itemRevenue;

                // Menu Item Ranking Data
                const menuId = item.id || item.menuId;
                if (!menuMetricsMap[menuId]) {
                  const refMenu = menusDict[menuId];
                  menuMetricsMap[menuId] = {
                    name: item.Name || (refMenu?.Name) || 'ไม่ระบุชื่อเมนู',
                    restaurant: restName,
                    qty: 0,
                    revenue: 0,
                    image: item.ImageUrl || (refMenu?.ImageUrl)
                  };
                }
                menuMetricsMap[menuId].qty += itemQty;
                menuMetricsMap[menuId].revenue += itemRevenue;
              });

              filteredRevenue += orderLocalTotal;
              validOrdersForChart.push({ ...order, filteredLocalTotal: orderLocalTotal });
            }
          }
        }
      });

      // 5. State Synchronization
      this.orderStatuses = statusCounts;
      this.recentOrders = recentOrdersArray
        .sort((a, b) => {
          const tA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
          const tB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
          return tB - tA;
        })
        .slice(0, 10);

      this.topRestaurants = Object.entries(restRevenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      this.topMenuItems = Object.values(menuMetricsMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      this.totalOrders = filteredOrdersCount;
      this.totalRevenue = filteredRevenue;

      // 6. Child Processor Calls
      this.processRevenueByDay(validOrdersForChart);
      this.processPeakHours(validOrdersForChart);

      // Menu filtering for the dashboard view
      let filteredMenus = this.allMenus;
      if (this.restaurantFilter !== 'all') {
        filteredMenus = this.allMenus.filter(m => m.Restaurant === this.restaurantFilter);
      }
      this.filteredTotalMenus = filteredMenus.length;
      this.processCategoriesCount(filteredMenus);
    },

    /**
     * Clear all active Firestore listeners.
     */
    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeMenus) this.unsubscribeMenus();
      if (this.unsubscribeRestaurants) this.unsubscribeRestaurants();
      if (this.unsubscribeCategories) this.unsubscribeCategories();

      this.unsubscribeOrders = null;
      this.unsubscribeMenus = null;
      this.unsubscribeRestaurants = null;
      this.unsubscribeCategories = null;
    },

    /**
     * Primary data loader for the dashboard. 
     * Sets up real-time sync for Orders, Menus, Restaurants, and Categories.
     */
    async loadDashboardData() {
      this.clearListeners();

      this.ordersLoading = true;
      this.menusLoading = true;
      this.restaurantsLoading = true;

      // 1. Load Orders
      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          let orderTotal = 0;
          
          // Calculate individual order revenue if possible
          if (data.statusOrder !== 'cancelled' && data.statusOrder !== 'returned') {
            if (data.Netprice) orderTotal = Number(data.Netprice);
            else if (data.TotalPrice) orderTotal = Number(data.TotalPrice);
            else if (data.Menu && Array.isArray(data.Menu)) {
              orderTotal = data.Menu.reduce((sum, item) => {
                if (item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned') {
                  return sum + (Number(item.Price || 0) * Number(item.Quantity || 1));
                }
                return sum;
              }, 0);
            }
          }
          return { id: doc.id, ...data, localTotal: orderTotal };
        });

        this.allOrders = orders;
        this.ordersLoading = false;
        this.applyFilters();
      });

      // 2. Load Menus
      const menusQuery = query(collection(db, 'Menu'));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        const menus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.allMenus = menus;
        this.availableMenus = menus.filter(m => m.Name).map(m => ({ id: m.id, Name: m.Name, Restaurant: m.Restaurant }));
        this.totalMenus = menus.length;
        this.menusLoading = false;
        this.applyFilters();
      });

      // 3. Load Restaurants
      const restaurantsQuery = query(collection(db, 'Restaurant'));
      this.unsubscribeRestaurants = onSnapshot(restaurantsQuery, (snapshot) => {
        const restaurants = snapshot.docs.map(doc => doc.data().Name || doc.id);
        this.allRestaurants = restaurants;
        this.availableRestaurants = [...new Set(restaurants)];
        this.totalRestaurants = snapshot.size;
        this.restaurantsLoading = false;
        this.applyFilters();
      });

      // 4. Load Category Metadata
      const categoriesQuery = query(collection(db, 'categories'));
      this.unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const categories = snapshot.docs
          .map(doc => doc.data().name)
          .filter(name => name && name.trim() !== '');
        this.availableCategories = [...new Set(categories)];
      });
    },

    /**
     * Process filtered orders into a day-by-day revenue distribution.
     */
    processRevenueByDay(orders) {
      const days = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let daysCount = 6;
      if (this.timeFilter === 'today') daysCount = 0;
      else if (this.timeFilter === 'thisMonth') daysCount = today.getDate() - 1;
      else if (this.timeFilter === 'all') daysCount = 29;

      // Fill empty days for chart consistency
      for (let i = daysCount; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateString = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days[dateString] = 0;
      }

      orders.forEach(order => {
        if (order.filteredLocalTotal > 0 && order.CreatedAt) {
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          orderDate.setHours(0, 0, 0, 0);

          const dateString = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
          if (days[dateString] !== undefined) {
            days[dateString] += Number(order.filteredLocalTotal);
          }
        }
      });

      this.revenueByDay = Object.keys(days).map(key => ({
        date: key,
        revenue: days[key]
      }));
    },

    /**
     * Count items per category for the donut chart.
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
     * Distribute order volume by hour for traffic visualization.
     */
    processPeakHours(orders) {
      const hourlyDistribution = Array(24).fill(0);
      orders.forEach(order => {
        if (order.CreatedAt) {
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          const hour = orderDate.getHours();
          hourlyDistribution[hour]++;
        }
      });

      this.ordersByHour = hourlyDistribution.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: count
      }));
    }
  }
});
