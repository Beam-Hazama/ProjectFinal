import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    list: [],
    unsubscribe: null,
  }),
  actions: {
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },
    async loadCategories() {
      this.clearListener();
      console.log('Loading Categories');
      
      const categoryRef = collection(db, 'categories');
      const q = query(categoryRef, orderBy('createdAt', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Categories LOADED:', this.list);
      });
    },
    async addCategory(categoryData) {
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: serverTimestamp()
      });
    },
    async deleteCategory(categoryId) {
       await deleteDoc(doc(db, 'categories', categoryId));
    }
  },
});
