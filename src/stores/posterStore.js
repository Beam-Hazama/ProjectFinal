import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, deleteDoc, query, orderBy, where, writeBatch } from 'firebase/firestore';
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
        q = query(posterRef, where('RestaurantName', '==', decodeURIComponent(restaurantName)));
      } else {
        q = query(posterRef, orderBy('createdAt', 'desc'));
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        
        if (!restaurantName) {
          docs = docs.filter(item => !item.RestaurantName);
        }

        
        docs.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            if (a.order !== b.order) return a.order - b.order;
          } else if (a.order !== undefined) {
            return -1;
          } else if (b.order !== undefined) {
            return 1;
          }

          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return timeB - timeA;
        });

        this.list = docs;
        console.log('Posters LOADED:', this.list);
      });
    },
    async addPoster(posterData) {
      await addDoc(collection(db, 'posters'), {
        ...posterData,
        order: this.list.length, 
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
    },
    async updatePosterOrder(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'posters', id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    }
  },
});
