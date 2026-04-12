import { defineStore } from 'pinia';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    allOrders: [],
    allProducts: [],
    allRestaurants: [],
    availableRestaurants: [],
    availableCategories: [],
    availableMenus: [],
    timeFilter: '7days',
    restaurantFilter: 'all',
    menuCategoryFilter: 'all',
    menuFilter: 'all',

    totalProducts: 0,
    filteredTotalProducts: 0,
    totalRestaurants: 0,

    topRestaurants: [],
    topMenuItems: [],
    recentOrders: [],
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },

    ordersLoading: true,
    productsLoading: true,
    restaurantsLoading: true,
    
    
    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],
    
    unsubscribeOrders: null,
    unsubscribeProducts: null,
    unsubscribeRestaurants: null,
    unsubscribeCategories: null,
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.productsLoading || state.restaurantsLoading,
    
    
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
          fontFamily: 'inherit',
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              colors: '#64748b',
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          labels: {
            formatter: (value) => `฿${value.toLocaleString()}`,
            style: {
              colors: '#64748b',
              fontSize: '12px'
            }
          }
        },
        dataLabels: { enabled: false },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '45%',
          }
        },
        colors: ['#4f46e5'],
        tooltip: {
          y: {
            formatter: function (val) {
              return "฿" + val.toLocaleString()
            }
          }
        }
      }
    },

   
    categoryChartSeries: (state) => {
      return state.categoriesCount.map(cat => cat.count);
    },

   
    categoryChartOptions: (state) => {
      const labels = state.categoriesCount.map(cat => cat.name);
      return {
        chart: {
          id: 'category-donut-chart',
          fontFamily: 'inherit',
        },
        labels: labels,
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
        legend: {
          position: 'bottom'
        },
        dataLabels: {
          enabled: false
        },
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
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return a + b
                    }, 0)
                  }
                }
              }
            }
          }
        }
      }
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
        tooltip: {
          y: { formatter: (val) => val + " ออเดอร์" }
        }
      }
    }
  },

  actions: {
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
    applyFilters() {
      let filteredRevenue = 0;
      let filteredOrdersCount = 0;
      let validOrdersForChart = [];
      let recentOrdersArray = [];

      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const restRevenueMap = {};
      const menuMetricsMap = {};

      // Filter by Time boundary
      const now = new Date();
      now.setHours(23,59,59,999);
      
      let startTime = new Date(0); // All time
      if (this.timeFilter === 'today') {
          startTime = new Date();
          startTime.setHours(0,0,0,0);
      } else if (this.timeFilter === '7days') {
          startTime = new Date();
          startTime.setHours(0,0,0,0);
          startTime.setDate(startTime.getDate() - 6);
      } else if (this.timeFilter === 'thisMonth') {
          startTime = new Date();
          startTime.setDate(1);
          startTime.setHours(0,0,0,0);
      }

      // Create maps to quickly look up product properties
      const categoryMap = {};
      const productsDict = {};
      this.allProducts.forEach(p => {
          if (p.id) {
              categoryMap[p.id] = p.Category;
              productsDict[p.id] = p;
          }
      });

      this.allOrders.forEach(order => {
         const createdAt = order.CreatedAt;
         if (!createdAt) return;
         
         const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
         if (orderDate < startTime || orderDate > now) return;

         // For legacy orders without Menu
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

         // Find valid matching items regardless of their specific itemStatus for general match checks
         const matchingItemsForFilterChecks = order.Menu.filter(item => {
             if (this.restaurantFilter !== 'all' && item.Restaurant !== this.restaurantFilter) return false;
             if (this.menuCategoryFilter !== 'all') {
                 const itemCategory = categoryMap[item.id] || categoryMap[item.menuId] || 'ไม่ระบุหมวดหมู่';
                 if (itemCategory !== this.menuCategoryFilter) return false;
             }
             if (this.menuFilter !== 'all') {
                 const itemId = item.menuId || item.id;
                 if (itemId !== this.menuFilter) return false;
             }
             return true;
         });

         if (matchingItemsForFilterChecks.length > 0) {
             const cStatus = order.statusOrder || 'pending';
             statusCounts[cStatus] = (statusCounts[cStatus] || 0) + 1;
             recentOrdersArray.push(order);

             if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
                  const validRevenueItems = matchingItemsForFilterChecks.filter(i => i.itemStatus !== 'cancelled' && i.itemStatus !== 'returned');
                  if(validRevenueItems.length > 0) {
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
                              const refProd = productsDict[menuId];
                              menuMetricsMap[menuId] = { 
                                  name: item.Name || (refProd?.Name) || 'ไม่ระบุชื่อเมนู', 
                                  restaurant: restName,
                                  qty: 0, 
                                  revenue: 0,
                                  image: item.ImageUrl || (refProd?.ImageUrl)
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

      this.orderStatuses = statusCounts;
      
      this.recentOrders = recentOrdersArray
          .sort((a,b) => {
              const tA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
              const tB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
              return tB - tA;
          })
          .slice(0, 10);
      
      this.topRestaurants = Object.entries(restRevenueMap)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a,b) => b.revenue - a.revenue)
          .slice(0, 5);

      this.topMenuItems = Object.values(menuMetricsMap)
          .sort((a,b) => b.qty - a.qty)
          .slice(0, 5);

      this.totalOrders = filteredOrdersCount;
      this.totalRevenue = filteredRevenue;
      
      this.processRevenueByDay(validOrdersForChart);
      this.processPeakHours(validOrdersForChart);

      let filteredProducts = this.allProducts;
      if (this.restaurantFilter !== 'all') {
          filteredProducts = this.allProducts.filter(p => p.Restaurant === this.restaurantFilter);
      }
      
      this.filteredTotalProducts = filteredProducts.length;
      this.processCategoriesCount(filteredProducts);
    },
    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeProducts) this.unsubscribeProducts();
      if (this.unsubscribeRestaurants) this.unsubscribeRestaurants();
      if (this.unsubscribeCategories) this.unsubscribeCategories();
      
      this.unsubscribeOrders = null;
      this.unsubscribeProducts = null;
      this.unsubscribeRestaurants = null;
      this.unsubscribeCategories = null;
    },

    async loadDashboardData() {
      this.clearListeners();
      
      this.ordersLoading = true;
      this.productsLoading = true;
      this.restaurantsLoading = true;

      
      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const orders = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          let orderTotal = 0;
          if (data.statusOrder !== 'cancelled' && data.statusOrder !== 'returned') {
            if (data.Netprice) {
                orderTotal = Number(data.Netprice);
            } else if (data.TotalPrice) {
                orderTotal = Number(data.TotalPrice);
            } else if (data.Menu && Array.isArray(data.Menu)) {
                orderTotal = data.Menu.reduce((sum, item) => {
                    if (item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned') {
                         return sum + (Number(item.Price || 0) * Number(item.Quantity || 1));
                    }
                    return sum;
                }, 0);
            }
          }
          data.localTotal = orderTotal;
          orders.push({ id: doc.id, ...data });
        });

        this.allOrders = orders;
        this.ordersLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Error fetching orders:", error);
        this.ordersLoading = false;
      });

      
      const productsQuery = query(collection(db, 'Menu'));
      this.unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const products = [];
        snapshot.forEach(doc => {
          products.push({ id: doc.id, ...doc.data() });
        });
        
        this.allProducts = products;
        this.availableMenus = products.filter(p => p.Name).map(p => ({ id: p.id, Name: p.Name, Restaurant: p.Restaurant }));
        this.totalProducts = Number(products.length);
        this.productsLoading = false;
        this.applyFilters();
      }, (error) => {
        console.error("Error fetching products:", error);
        this.productsLoading = false;
      });

      const restaurantsQuery = query(collection(db, 'Restaurant'));
      this.unsubscribeRestaurants = onSnapshot(restaurantsQuery, (snapshot) => {
        const restaurants = [];
        snapshot.forEach(doc => {
          restaurants.push(doc.data().Name || doc.id);
        });
        
        this.allRestaurants = restaurants;
        this.availableRestaurants = [...new Set(restaurants)];
        this.totalRestaurants = Number(snapshot.size);
        this.restaurantsLoading = false;
        this.applyFilters();
      }, (error) => {
         console.error("Error fetching restaurants:", error);
         this.restaurantsLoading = false;
      });

      const categoriesQuery = query(collection(db, 'categories'));
      this.unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const categories = [];
        snapshot.forEach(doc => {
           const name = doc.data().name;
           if (name && name.trim() !== '') {
               categories.push(name);
           }
        });
        
        this.availableCategories = [...new Set(categories)];
      }, (error) => {
         console.error("Error fetching categories:", error);
      });
    },


    processRevenueByDay(orders) {
      const days = {};
      const today = new Date();
      today.setHours(0,0,0,0);

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
        if (order.filteredLocalTotal > 0 && order.CreatedAt) {
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          orderDate.setHours(0,0,0,0);
          
          const timeDiff = today.getTime() - orderDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          if (daysDiff >= 0 && daysDiff <= Math.max(daysCount, 6)) {
             const dateString = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
             if (days[dateString] !== undefined) {
                 days[dateString] += Number(order.filteredLocalTotal);
             }
          }
        }
      });

   
      this.revenueByDay = Object.keys(days).map(key => ({
        date: key,
        revenue: days[key]
      }));
    },

    processCategoriesCount(products) {
      const counts = {};
      products.forEach(p => {
        const cat = p.Category || 'ไม่ระบุหมวดหมู่';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      this.categoriesCount = Object.keys(counts).map(key => ({
        name: key,
        count: counts[key]
      })).sort((a,b) => b.count - a.count); 
    },

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
