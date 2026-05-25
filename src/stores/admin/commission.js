import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { doc, setDoc, query, collection, onSnapshot } from 'firebase/firestore';

export const useCommissionStore = defineStore('commission', {
  state: () => ({
    rates: {}, // { 'ร้านค้า A': 10, 'ร้านค้า B': 15 }
    nameToId: {}, // { 'ร้านค้า A': 'doc_id_123' }
    loading: false,
    unsubscribe: null,

    // UI State สำหรับการแก้ไข
    localRates: {},
    isEditing: false,

    bulkRate: '',
    bulkCap: '',
  }),

  actions: {
    async loadCommissionRates() {
      if (this.unsubscribe) this.unsubscribe();

      this.loading = true;
      const q = query(collection(db, 'Restaurant'));

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newRates = {};
          const newNameToId = {};
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const name = data.RestaurantName || doc.id;
            newNameToId[name] = doc.id;
            newRates[name] = {
              rate:
                data.CommissionRate !== undefined
                  ? Number(data.CommissionRate)
                  : 0,

              cap:
                data.CommissionCap !== undefined && data.CommissionCap !== null
                  ? Number(data.CommissionCap)
                  : null,
            };
          });
          this.rates = newRates;
          this.nameToId = newNameToId;

          // ถ้าไม่ได้กำลังแก้ไข ให้ซิงค์ข้อมูลล่าสุด
          if (!this.isEditing) {
            this.localRates = { ...newRates };
          }

          this.loading = false;
        },
        (error) => {
          console.error('Error loading commission rates:', error);
          this.loading = false;
        },
      );
    },

    async applyCommissionToAll() {
      this.loading = true;

      try {
        const promises = Object.entries(this.nameToId).map(([name, id]) => {
          const restaurantRef = doc(db, 'Restaurant', id);

          return setDoc(
            restaurantRef,
            {
              CommissionRate: Number(this.bulkRate || 0),

              CommissionCap: this.bulkCap === '' ? null : Number(this.bulkCap),

              UpdatedAt: new Date(),
            },
            { merge: true },
          );
        });

        await Promise.all(promises);
      } catch (e) {
        console.error('Error applying commission:', e);

        throw e;
      } finally {
        this.loading = false;
      }
    },

    startEditing() {
      this.localRates = { ...this.rates };
      this.isEditing = true;
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
          return setDoc(
            restaurantRef,
            {
              CommissionRate: Number(rate),
              UpdatedAt: new Date(),
            },
            { merge: true },
          );
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

    clearListener() {
      if (this.unsubscribe) {
        //ถ้าไม่มีโค้ดจะเกิดError
        this.unsubscribe();
      }
      this.unsubscribe = null;
    },
  },
});
