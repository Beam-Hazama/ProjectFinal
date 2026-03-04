import { defineStore } from 'pinia';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    ordersLoading: true,
    productsLoading: true,
    usersLoading: true,
    
    
    revenueByDay: [],
    categoriesCount: [],
    
    unsubscribeOrders: null,
    unsubscribeProducts: null,
    unsubscribeUsers: null,
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.productsLoading || state.usersLoading,
    
    
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
      if (this.unsubscribeUsers) this.unsubscribeUsers();
      
      this.unsubscribeOrders = null;
      this.unsubscribeProducts = null;
      this.unsubscribeUsers = null;
    },

    async loadDashboardData() {
      this.clearListeners();
      
      this.ordersLoading = true;
      this.productsLoading = true;
      this.usersLoading = true;

      
      const ordersQuery = query(collection(db, 'Order'));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        let revenue = 0;
        const orders = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          orders.push({ id: doc.id, ...data });
         
          if (data.statusOrder !== 'cancelled' && data.statusOrder !== 'returned') {
            let orderTotal = 0;
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
            revenue += orderTotal;
            data.localTotal = orderTotal;
          }
        });

        this.totalOrders = Number(orders.length);
        this.totalRevenue = revenue;
        
        this.processRevenueByDay(orders);
        this.ordersLoading = false;
      }, (error) => {
        console.error("Error fetching orders:", error);
        this.ordersLoading = false;
      });

      
      const productsQuery = query(collection(db, 'Menu'));
      this.unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const products = [];
        snapshot.forEach(doc => {
          products.push(doc.data());
        });
        
        this.totalProducts = Number(products.length);
        this.processCategoriesCount(products);
        this.productsLoading = false;
      }, (error) => {
        console.error("Error fetching products:", error);
        this.productsLoading = false;
      });

     
      const usersQuery = query(collection(db, 'User'));
      this.unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        this.totalUsers = Number(snapshot.size);
        this.usersLoading = false;
      }, (error) => {
         console.error("Error fetching users:", error);
         this.usersLoading = false;
      });
    },


    processRevenueByDay(orders) {
      
      const days = {};
      const today = new Date();
      today.setHours(0,0,0,0);

    
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
      
        const dateString = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days[dateString] = 0;
      }

      orders.forEach(order => {
        if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned' && order.localTotal && order.CreatedAt) {
       
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
    }
  }
});
