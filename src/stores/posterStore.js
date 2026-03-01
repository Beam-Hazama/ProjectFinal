import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase';

export const usePosterStore = defineStore('poster', {
  state: () => ({
    list: [],
    unsubscribe: null,
  }),
  getters: {
    activePosters: (state) => state.list.filter(p => p.isActive)
  },
  actions: {
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },
    async loadPosters(restaurantName = null) {
      this.clearListener();
      console.log('Loading Posters', restaurantName ? `for ${restaurantName}` : 'All');

      const posterRef = collection(db, 'posters');

      let q;
      if (restaurantName) {
        // When querying by restaurant name, we need to add a where clause
        q = query(posterRef, where('RestaurantName', '==', restaurantName), orderBy('createdAt', 'desc'));
      } else {
        // Ordering by timestamp ensures consistent display order for global posters (which we might still support, or maybe they don't have RestaurantName)
        // Assuming global posters don't have RestaurantName set.
        q = query(posterRef, orderBy('createdAt', 'desc'));
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter out global from restaurant-specific if no restaurantName was given (optional based on logic, but safer to let query handle it)
        if (!restaurantName) {
          this.list = this.list.filter(item => !item.RestaurantName)
        }
        console.log('Posters LOADED:', this.list);
      });
    },
    async addPoster(posterData) {
      await addDoc(collection(db, 'posters'), {
        ...posterData,
        createdAt: serverTimestamp(),
        isActive: true
      });
    },
    async updatePoster(posterId, updateData) {
      const posterRef = doc(db, 'posters', posterId);
      await setDoc(posterRef, updateData, { merge: true });
    },
    async deletePoster(posterId) {
      await deleteDoc(doc(db, 'posters', posterId));
    },
    async toggleActive(posterId, currentStatus) {
      const posterRef = doc(db, 'posters', posterId);
      await setDoc(posterRef, { isActive: !currentStatus }, { merge: true });
    }
  },
});
