import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { doc, setDoc, query, collection, onSnapshot } from 'firebase/firestore';
import { useDashboardStore } from '@/stores/admin/dashboard';

export const useCommissionStore = defineStore('commission', {
  state: () => ({
    rates: {},
    nameToId: {},
    loading: false,
    unsubscribe: null,
    
    // UI State
    localRates: {},
    isEditing: false
  }),

  getters: {
    restaurantData: (state) => {
      const dashboardStore = useDashboardStore();
      if (!dashboardStore.availableRestaurants) return [];

      // 1. Filter orders based on time once
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      let startTime = new Date(0);

      if (dashboardStore.timeFilter === 'today') {
        startTime = new Date();
        startTime.setHours(0, 0, 0, 0);
      } else if (dashboardStore.timeFilter === '7days') {
        startTime = new Date();
        startTime.setHours(0, 0, 0, 0);
        startTime.setDate(startTime.getDate() - 6);
      } else if (dashboardStore.timeFilter === 'thisMonth') {
        startTime = new Date();
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
      } else if (dashboardStore.timeFilter === 'custom' && dashboardStore.customStartDate && dashboardStore.customEndDate) {
        startTime = new Date(dashboardStore.customStartDate);
        startTime.setHours(0, 0, 0, 0);
        now.setTime(new Date(dashboardStore.customEndDate).getTime());
        now.setHours(23, 59, 59, 999);
      }

      const filteredOrders = dashboardStore.allOrders.filter(order => {
        const createdAt = order.CreatedAt;
        if (!createdAt) return false;
        const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        return orderDate >= startTime && orderDate <= now;
      });

      // 2. Map revenue by restaurant
      return dashboardStore.availableRestaurants.map(restName => {
        let revenue = 0;
        filteredOrders.forEach(order => {
          if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
            if (order.Menu && Array.isArray(order.Menu)) {
              order.Menu.forEach(item => {
                if (item.Restaurant === restName && item.itemStatus !== 'cancelled') {
                  revenue += (Number(item.Price || 0) * Number(item.Quantity || 1));
                }
              });
            } else if (order.Restaurant === restName) {
              revenue += Number(order.localTotal || 0);
            }
          }
        });

        const rate = state.localRates[restName] !== undefined ? state.localRates[restName] : (state.rates[restName] || 0);
        const commission = (revenue * rate) / 100;

        return {
          name: restName,
          revenue,
          rate,
          commission,
          net: revenue - commission
        };
      });
    },

    totalSystemRevenue() {
      return this.restaurantData.reduce((sum, r) => sum + r.revenue, 0);
    },

    totalCommissions() {
      return this.restaurantData.reduce((sum, r) => sum + r.commission, 0);
    },

    totalNetPayout() {
      return this.restaurantData.reduce((sum, r) => sum + r.net, 0);
    }
  },

  actions: {
    async loadCommissionRates() {
      if (this.unsubscribe) this.unsubscribe();
      
      this.loading = true;
      const q = query(collection(db, 'Restaurant'));
      
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const newRates = {};
        const newNameToId = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const name = data.Name || doc.id;
          newNameToId[name] = doc.id;
          newRates[name] = data.CommissionRate !== undefined ? Number(data.CommissionRate) : 0;
        });
        this.rates = newRates;
        this.nameToId = newNameToId;
        
        // Sync local rates if not editing
        if (!this.isEditing) {
          this.localRates = { ...newRates };
        }
        
        this.loading = false;
      }, (error) => {
        console.error("Error loading commission rates:", error);
        this.loading = false;
      });
    },

    updateLocalRate(name, val) {
      this.localRates[name] = Number(val);
    },

    async saveAll() {
      this.loading = true;
      try {
        const promises = Object.entries(this.localRates).map(([name, rate]) => {
          const id = this.nameToId[name] || name;
          const restaurantRef = doc(db, 'Restaurant', id);
          return setDoc(restaurantRef, { 
            CommissionRate: Number(rate),
            UpdatedAt: new Date()
          }, { merge: true });
        });
        await Promise.all(promises);
        this.isEditing = false;
      } catch (e) {
        console.error('Error saving rates:', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    cancelEdit() {
      this.localRates = { ...this.rates };
      this.isEditing = false;
    },

    startEditing() {
      this.isEditing = true;
      this.localRates = { ...this.rates };
    },

    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  }
});
