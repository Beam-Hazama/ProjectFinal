import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { doc, setDoc, query, collection, onSnapshot } from 'firebase/firestore';

/**
 * Commission Store
 * Manages commission rates and logic for restaurants.
 */
export const useCommissionStore = defineStore('commission', {
  state: () => ({
    rates: {}, // Map of restaurantId -> commission percentage
    nameToId: {}, // Map of restaurantName -> restaurantId
    loading: false,
    unsubscribe: null
  }),

  actions: {
    /**
     * Load all restaurant documents to get the commission rates.
     * We sync this in real-time.
     */
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
          // Default to 0 if not set
          newRates[name] = data.CommissionRate !== undefined ? Number(data.CommissionRate) : 0;
        });
        this.rates = newRates;
        this.nameToId = newNameToId;
        this.loading = false;
      }, (error) => {
        console.error("Error loading commission rates:", error);
        this.loading = false;
      });
    },

    /**
     * Update the commission rate for a specific restaurant.
     * @param {string} restaurantId 
     * @param {number} rate 
     */
    async updateRate(idOrName, rate) {
      const id = this.nameToId[idOrName] || idOrName;
      const restaurantRef = doc(db, 'Restaurant', id);
      await setDoc(restaurantRef, { 
        CommissionRate: Number(rate),
        UpdatedAt: new Date()
      }, { merge: true });
    },

    async saveRates(localRatesMap) {
      this.loading = true;
      try {
        const promises = Object.entries(localRatesMap).map(([name, rate]) => {
          return this.updateRate(name, rate);
        });
        await Promise.all(promises);
      } finally {
        this.loading = false;
      }
    },

    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  }
});
