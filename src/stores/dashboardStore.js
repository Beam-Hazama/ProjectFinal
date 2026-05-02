import { defineStore } from 'pinia';
import { collection, onSnapshot, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase';

export const useDashboardStore = defineStore('dashboardStore', {

  state: () => ({

    allOrders: [],
    allMenus: [],
    allRestaurants: [],

    timeFilter: 'thisMonth',
    customStartDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], 
    customEndDate: new Date().toISOString().split('T')[0],
    restaurantFilters: [],
    menuCategoryFilters: [],
    menuFilters: [],

    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    filteredTotalMenus: 0,
    totalRestaurants: 0,
    totalCommission: 0,
    netPayouts: 0,

    topRestaurants: [],
    topMenuItems: [],
    recentOrders: [],
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },

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
    unsubscribeCategories: null,
  }),

  getters: {
    
    isLoading: (state) => state.ordersLoading || state.menusLoading || state.restaurantsLoading,

    
    salesChartSeries: (state) => {
      const data = state.revenueByDay.map(day => day.revenue);
      return [{ name: 'ยอดขาย (บาท)', data }];
    },

    
    salesChartOptions: (state) => {
      const categories = state.revenueByDay.map(day => day.date);
      return {
        chart: {
          id: 'revenue-bar-chart',
          toolbar: { show: false },
          zoom: { enabled: false },
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

    
    peakHoursChartSeries: (state) => {
      const data = state.ordersByHour.map(h => h.count);
      return [{ name: 'จำนวนออเดอร์', data }];
    },

    
    peakHoursChartOptions: (state) => {
      const categories = state.ordersByHour.map(h => h.hour);
      return {
        chart: {
          id: 'peak-hours-chart',
          toolbar: { show: false },
          zoom: { enabled: false },
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
    },
    
    hasActiveFilters: (state) => {
      return state.restaurantFilters.length > 0 || state.menuCategoryFilters.length > 0 || state.menuFilters.length > 0;
    }
  },

  actions: {

    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },
    toggleRestaurantFilter(name) {
      const index = this.restaurantFilters.indexOf(name);
      if (index > -1) {
        this.restaurantFilters.splice(index, 1);
      } else {
        this.restaurantFilters.push(name);
      }
      this.menuFilters = [];
      if (this.restaurantFilters.length > 0 && this.menuCategoryFilters.length > 0) {
        const validCategoriesForRests = new Set(this.allMenus.filter(m => this.restaurantFilters.includes(m.Restaurant)).map(m => m.Category));
        this.menuCategoryFilters = this.menuCategoryFilters.filter(c => validCategoriesForRests.has(c));
      }
      this.applyFilters();
    },
    clearRestaurantFilters() {
      this.restaurantFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },
    toggleCategoryFilter(category) {
      const index = this.menuCategoryFilters.indexOf(category);
      if (index > -1) {
        this.menuCategoryFilters.splice(index, 1);
      } else {
        this.menuCategoryFilters.push(category);
      }
      this.menuFilters = [];
      if (this.menuCategoryFilters.length > 0 && this.restaurantFilters.length > 0) {
        const validRestsForCats = new Set(this.allMenus.filter(m => this.menuCategoryFilters.includes(m.Category)).map(m => m.Restaurant));
        this.restaurantFilters = this.restaurantFilters.filter(r => validRestsForCats.has(r));
      }
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
    setCustomDates(start, end) {
      this.customStartDate = start;
      this.customEndDate = end;
      if (this.timeFilter === 'custom') {
        this.applyFilters();
      }
    },
    clearAllFilters() {
      this.restaurantFilters = [];
      this.menuCategoryFilters = [];
      this.menuFilters = [];
      this.applyFilters();
    },

    
    applyFilters() {
      let filteredRevenue = 0;
      let filteredOrdersCount = 0;
      let validOrdersForChart = [];
      let recentOrdersArray = [];

      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const restRevenueMap = {};
      const menuMetricsMap = {};

      let totalCommissionCalc = 0;

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
      } else if (this.timeFilter === 'custom' && this.customStartDate && this.customEndDate) {
        startTime = new Date(this.customStartDate);
        startTime.setHours(0, 0, 0, 0);
        now.setTime(new Date(this.customEndDate).getTime());
        now.setHours(23, 59, 59, 999);
      }

      const categoryMap = {};
      const menusDict = {};
      this.allMenus.forEach(m => {
        if (m.id) {
          categoryMap[m.id] = m.Category;
          menusDict[m.id] = m;
        }
      });

      const restRateMap = {};
      this.allRestaurants.forEach(r => {
        if (r.Name) restRateMap[r.Name] = Number(r.CommissionRate || 0);
      });

      this.allOrders.forEach(order => {
        const createdAt = order.CreatedAt;
        if (!createdAt) return;

        const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        if (orderDate < startTime || orderDate > now) return;

        if (!order.Menu || order.Menu.length === 0) {
          if (this.restaurantFilters.length > 0 || this.menuCategoryFilters.length > 0 || this.menuFilters.length > 0) {
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

        const matchingItems = order.Menu.filter(item => {

          if (this.restaurantFilters.length > 0 && !this.restaurantFilters.includes(item.Restaurant)) return false;

          if (this.menuCategoryFilters.length > 0) {
            const itemCategory = categoryMap[item.id] || categoryMap[item.menuId] || 'ไม่ระบุหมวดหมู่';
            if (!this.menuCategoryFilters.includes(itemCategory)) return false;
          }

          if (this.menuFilters.length > 0) {
            const itemId = item.menuId || item.id;
            if (!this.menuFilters.includes(itemId)) return false;
          }
          return true;
        });

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

                const restName = item.Restaurant || 'ไม่ระบุร้าน';
                restRevenueMap[restName] = (restRevenueMap[restName] || 0) + itemRevenue;

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

                const restRate = restRateMap[restName] || 0;
                totalCommissionCalc += (itemRevenue * restRate) / 100;
              });

              filteredRevenue += orderLocalTotal;
              validOrdersForChart.push({ ...order, filteredLocalTotal: orderLocalTotal });
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

      this.topRestaurants = Object.entries(restRevenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      this.topMenuItems = Object.values(menuMetricsMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      this.totalOrders = filteredOrdersCount;
      this.totalRevenue = filteredRevenue;
      this.totalCommission = totalCommissionCalc;
      this.netPayouts = filteredRevenue - totalCommissionCalc;

      this.processRevenueByDay(validOrdersForChart);
      this.processPeakHours(validOrdersForChart);

      let filteredMenus = this.allMenus;
      if (this.restaurantFilters.length > 0) {
        filteredMenus = filteredMenus.filter(m => this.restaurantFilters.includes(m.Restaurant));
      }
      if (this.menuCategoryFilters.length > 0) {
        filteredMenus = filteredMenus.filter(m => this.menuCategoryFilters.includes(m.Category));
      }
      this.filteredTotalMenus = filteredMenus.length;
      this.processCategoriesCount(filteredMenus);
      this.availableMenus = filteredMenus.filter(m => m.Name).map(m => ({ id: m.id, Name: m.Name, Restaurant: m.Restaurant }));
      
      const catList = this.allMenus
        .filter(m => this.restaurantFilters.length === 0 || this.restaurantFilters.includes(m.Restaurant))
        .map(m => m.Category)
        .filter(c => c && c.trim() !== '');
      this.availableCategories = [...new Set(catList)];
      
      const restList = this.allMenus
        .filter(m => this.menuCategoryFilters.length === 0 || this.menuCategoryFilters.includes(m.Category))
        .map(m => m.Restaurant)
        .filter(r => r && r.trim() !== '');
      this.availableRestaurants = [...new Set(restList)];
    },

    
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

    
    async loadDashboardData() {
      this.clearListeners();

      this.ordersLoading = true;
      this.menusLoading = true;
      this.restaurantsLoading = true;

      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          let orderTotal = 0;

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

      const menusQuery = query(collection(db, 'Menu'));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        const menus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.allMenus = menus;
        this.availableMenus = menus.filter(m => m.Name).map(m => ({ id: m.id, Name: m.Name, Restaurant: m.Restaurant }));
        this.totalMenus = menus.length;
        this.menusLoading = false;
        this.applyFilters();
      });

      const restaurantsQuery = query(collection(db, 'Restaurant'));
      this.unsubscribeRestaurants = onSnapshot(restaurantsQuery, (snapshot) => {
        const fullData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const names = fullData.map(r => r.Name || r.id);
        
        this.allRestaurants = fullData;
        this.availableRestaurants = [...new Set(names)];
        this.totalRestaurants = snapshot.size;
        this.restaurantsLoading = false;
        this.applyFilters();
      });

      const categoriesQuery = query(collection(db, 'categories'));
      this.unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const categories = snapshot.docs
          .map(doc => doc.data().name)
          .filter(name => name && name.trim() !== '');
        this.availableCategories = [...new Set(categories)];
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
      else if (this.timeFilter === 'custom' && this.customStartDate && this.customEndDate) {
        const start = new Date(this.customStartDate);
        const end = new Date(this.customEndDate);
        daysCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysCount > 31) daysCount = 31;
        if (daysCount < 0) daysCount = 0;

        today.setTime(end.getTime());
        today.setHours(0, 0, 0, 0);
      }

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

