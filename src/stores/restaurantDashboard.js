import { defineStore } from 'pinia';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export const useRestaurantDashboardStore = defineStore('restaurantDashboard', {
  state: () => ({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    
    ordersLoading: true,
    productsLoading: true,
    
    
    revenueByDay: [],
    categoriesCount: [],
    
    unsubscribeOrders: null,
    unsubscribeProducts: null,
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.productsLoading,
    
    
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
    }
  },

  actions: {
    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeProducts) this.unsubscribeProducts();
      
      this.unsubscribeOrders = null;
      this.unsubscribeProducts = null;
    },

    async loadDashboardData(restaurantName) {
      if(!restaurantName) {
        console.warn('loadDashboardData called without restaurantName');
        return;
      }
      this.clearListeners();
      
      this.ordersLoading = true;
      this.productsLoading = true;

      
      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        let revenue = 0;
        let orderCount = 0;
        const validOrders = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const items = data.Menu || [];

          
          const myItems = items.filter(item => item.Restaurant === restaurantName);

          if(myItems.length > 0) {
            orderCount++;
            let localTotal = 0;
            
            myItems.forEach(item => {
               
               if (item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned') {
                 localTotal += Number(item.Price) * Number(item.Quantity);
               }
            });
            revenue += localTotal;
            
         
            validOrders.push({
                ...data, 
                localTotal: localTotal
            });
          }
        });

        this.totalOrders = orderCount;
        this.totalRevenue = revenue;
        
        this.processRevenueByDay(validOrders);
        this.ordersLoading = false;
      }, (error) => {
        console.error("Error fetching restaurant orders:", error);
        this.ordersLoading = false;
      });

      // 2. Listen to Menu Collection filtered by Restaurant
      const productsQuery = query(collection(db, 'Menu'), where('Restaurant', '==', restaurantName));
      this.unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const products = [];
        snapshot.forEach(doc => {
          products.push(doc.data());
        });
        
        this.totalProducts = Number(products.length);
        this.processCategoriesCount(products);
        this.productsLoading = false;
      }, (error) => {
        console.error("Error fetching restaurant products:", error);
        this.productsLoading = false;
      });
    },

    processRevenueByDay(orders) {
      // Group revenue by the last 7 days
      const days = {};
      const today = new Date();
      today.setHours(0,0,0,0);

      // Initialize with last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Format as DD/MM
        const dateString = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days[dateString] = 0;
      }

      orders.forEach(order => {
        if (order.localTotal > 0 && order.CreatedAt) {
          // Convert Firestore timestamp to Date
          const orderDate = order.CreatedAt.toDate ? order.CreatedAt.toDate() : new Date(order.CreatedAt);
          orderDate.setHours(0,0,0,0);
          
          const timeDiff = today.getTime() - orderDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          if (daysDiff >= 0 && daysDiff <= 6) {
             const dateString = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
             if (days[dateString] !== undefined) {
                 days[dateString] += Number(order.localTotal);
             }
          }
        }
      });

      // Convert back to sorted array
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
      })).sort((a,b) => b.count - a.count); // Sort highest first
    }
  }
});
