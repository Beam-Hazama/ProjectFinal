import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase';

export const usePosterStore = defineStore('poster', {
  state: () => ({
    list: [],
    unsubscribe: null,
  }),
  getters: {
    activePosters: (state) => state.list.filter(p => {
      if (!p.isActive) return false;
      if (p.hasSchedule && p.startTime && p.endTime) {
        const now = new Date();
        const start = new Date(p.startTime);
        const end = new Date(p.endTime);
        if (now < start || now > end) {
          return false;
        }
      }
      return true;
    })
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
        // When querying by restaurant name, we remove orderBy to avoid requiring a composite index
        q = query(posterRef, where('RestaurantName', '==', restaurantName));
      } else {
        q = query(posterRef, orderBy('createdAt', 'desc'));
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort in memory instead
        if (restaurantName) {
          docs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
            return timeB - timeA;
          });
        }

        this.list = docs;

        // Filter out global from restaurant-specific if no restaurantName was given
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
