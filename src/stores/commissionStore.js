import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { doc, setDoc, query, collection, onSnapshot } from 'firebase/firestore';

export const useCommissionStore = defineStore('commission', {
  state: () => ({
    rates: {},
    nameToId: {},
    loading: false,
    unsubscribe: null
  }),

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
        this.loading = false;
      }, (error) => {
        console.error("Error loading commission rates:", error);
        this.loading = false;
      });
    },

    
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

