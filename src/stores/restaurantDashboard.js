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

    availableMenus: [],
    filteredTotalMenus: 0,
    isError: false,
    errorMessage: ''
  }),

  getters: {
    
    isLoading: (state) => state.ordersLoading || state.menusLoading,

    
    salesChartSeries: (state) => {
      const data = state.revenueByDay.map(day => day.revenue);
      return [{ name: 'ยอดขาย (บาท)', data }];
    },

    
    salesChartOptions: (state) => {
      const categories = state.revenueByDay.map(day => day.date);
      return {
        chart: { id: 'revenue-bar-chart', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
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

    
    categoryChartSeries: (state) => {
      return state.categoriesCount.map(cat => cat.count);
    },

    
    categoryChartOptions: (state) => {
      const labels = state.categoriesCount.map(cat => cat.name);
      return {
        chart: { id: 'category-donut-chart', fontFamily: 'inherit', zoom: { enabled: false } },
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

    
    totalCommission: (state) => (state.totalRevenue * (state.commissionRate || 0)) / 100,
    netRevenue: (state) => state.totalRevenue - ((state.totalRevenue * (state.commissionRate || 0)) / 100),

    
    peakHoursChartSeries: (state) => {
      const data = state.ordersByHour.map(h => h.count);
      return [{ name: 'จำนวนออเดอร์', data }];
    },

    
    peakHoursChartOptions: (state) => {
      const categories = state.ordersByHour.map(h => h.hour);
      return {
        chart: { id: 'peak-hours-chart', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit', type: 'area' },
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
    },
    
    hasActiveFilters: (state) => {
      return state.menuCategoryFilters.length > 0 || state.menuFilters.length > 0;
    }
  },

  actions: {
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },
    setCustomDates(start, end) {
      this.customStartDate = start;
      this.customEndDate = end;
      if (this.timeFilter === 'custom') {
        this.applyFilters();
      }
    },
    toggleCategoryFilter(category) {
      const index = this.menuCategoryFilters.indexOf(category);
      if (index > -1) {
        this.menuCategoryFilters.splice(index, 1);
      } else {
        this.menuCategoryFilters.push(category);
      }
      this.menuFilters = [];
      this.applyFilters();
    },
    clearCategoryFilters() {
      this.menuCategoryFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },
    toggleMenuFilter(id) {
      const index = this.menuFilters.indexOf(id);
      if (index > -1) {
        this.menuFilters.splice(index, 1);
      } else {
        this.menuFilters.push(id);
      }
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

    
    applyFilters() {
      if (!this.currentRestaurant) return;

      let filteredRevenue = 0;
      let filteredOrdersCount = 0;
      let validOrdersForChart = [];
      let recentOrdersArray = [];

      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const menuMetricsMap = {};

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
      } else if (this.timeFilter === 'custom') {
        startTime = new Date(this.customStartDate);
        startTime.setHours(0, 0, 0, 0);
        now = new Date(this.customEndDate);
        now.setHours(23, 59, 59, 999);
      }

      const categoryMap = {};
      this.allMenus.forEach(m => {
        categoryMap[m.id] = m.Category || 'ไม่ระบุหมวดหมู่';
      });

      this.allOrders.forEach(order => {
        const createdAt = order.CreatedAt;
        if (!createdAt) return;

        const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        if (orderDate < startTime || orderDate > now) return;

        if (!order.Menu || order.Menu.length === 0) {
          if (this.menuCategoryFilters.length > 0 || this.menuFilters.length > 0) {
            return;
          }
          const cStatus = order.statusOrder || 'pending';
          statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
          recentOrdersArray.push(order);
          return;
        }

        const myItems = order.Menu.filter(item => {
          if (item.Restaurant !== this.currentRestaurant) return false;

          if (this.menuCategoryFilters.length > 0) {
            const itemCategory = categoryMap[item.id] || categoryMap[item.menuId] || 'ไม่ระบุหมวดหมู่';
            if (!this.menuCategoryFilters.includes(itemCategory)) return false;
          }

          if (this.menuFilters.length > 0) {
            const menuId = item.id || item.menuId;
            if (!this.menuFilters.includes(menuId)) return false;
          }

          return true;
        });

        if (myItems.length > 0) {
          const cStatus = order.statusOrder || 'pending';
          statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
          recentOrdersArray.push(order);

          if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
            const validRevenueItems = myItems.filter(i => i.itemStatus !== 'cancelled' && i.itemStatus !== 'returned');

            if (validRevenueItems.length > 0) {
              filteredOrdersCount++;
              let orderLocalTotal = 0;

              validRevenueItems.forEach(item => {
                const itemQty = Number(item.Quantity || 0);
                const itemRevenue = Number(item.Price || 0) * itemQty;
                orderLocalTotal += itemRevenue;

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

      // Filter menus for available dropdown options
      let filteredMenus = this.allMenus;
      if (this.menuCategoryFilters.length > 0) {
        filteredMenus = filteredMenus.filter(m => this.menuCategoryFilters.includes(m.Category));
      }
      this.filteredTotalMenus = filteredMenus.length;
      this.processCategoriesCount(filteredMenus);

      // Generate available categories for dropdown
      const catList = this.allMenus.map(m => m.Category).filter(c => c && c.trim() !== '');
      this.availableCategories = [...new Set(catList)];
      
      // Update available menus based on filtered category
      this.availableMenus = filteredMenus.map(m => ({
        id: m.id,
        Name: m.Name,
        Restaurant: m.Restaurant
      }));

      this.processRevenueByDay(validOrdersForChart);
      this.processPeakHours(validOrdersForChart);
    },

    
    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeMenus) this.unsubscribeMenus();
      this.unsubscribeOrders = null;
      this.unsubscribeMenus = null;
    },

    
    async loadDashboardData(restaurantName) {
      if (!restaurantName) return;
      this.currentRestaurant = restaurantName;
      this.clearListeners();

      this.ordersLoading = true;
      this.menusLoading = true;
      this.isError = false;
      this.errorMessage = '';

      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.allOrders = orders;
        this.ordersLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Error fetching dashboard orders:", error);
        this.ordersLoading = false;
        this.isError = true;
        this.errorMessage = "ไม่สามารถโหลดข้อมูลออเดอร์ได้";
      });

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
        this.isError = true;
        this.errorMessage = "ไม่สามารถโหลดข้อมูลเมนูได้";
      });

      const restaurantQuery = query(collection(db, 'Restaurant'), where('Name', '==', restaurantName));
      onSnapshot(restaurantQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          this.commissionRate = data.CommissionRate || 0;
        }
      });
    },

    
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

    
    processPeakHours(orders) {
      const hourlyDistribution = Array(24).fill(0);
      orders.forEach(order => {
        if (order.CreatedAt) {

          let orderDate;
          if (order.CreatedAt.toDate) {
            orderDate = order.CreatedAt.toDate();
          } else if (order.CreatedAt.seconds) {
            orderDate = new Date(order.CreatedAt.seconds * 1000);
          } else {
            orderDate = new Date(order.CreatedAt);
          }

          if (!isNaN(orderDate.getTime())) {
            const hour = orderDate.getHours();
            hourlyDistribution[hour]++;
          }
        }
      });

      const chartData = hourlyDistribution.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: count
      }));

      chartData.push({
        hour: "23:59",
        count: 0
      });

      this.ordersByHour = chartData;
    }
  }
});

