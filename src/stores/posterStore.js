import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
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
    async loadPosters() {
      this.clearListener();
      console.log('Loading Posters');
      
      const posterRef = collection(db, 'posters');
      // Ordering by timestamp ensures consistent display order
      const q = query(posterRef, orderBy('createdAt', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
