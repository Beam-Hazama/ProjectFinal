import { defineStore } from 'pinia';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, deleteDoc, query, orderBy, where } from 'firebase/firestore';
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
    async loadCategories(restaurantName = null) {
      this.clearListener();
      console.log('Loading Categories', restaurantName ? `for ${restaurantName}` : 'All');

      const categoryRef = collection(db, 'categories');
      let q;

      if (restaurantName) {
        q = query(categoryRef, where('RestaurantName', '==', restaurantName), orderBy('createdAt', 'desc'));
      } else {
        q = query(categoryRef, orderBy('createdAt', 'desc'));
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out global from restaurant-specific if no restaurantName was given
        if (!restaurantName) {
          this.list = this.list.filter(item => !item.RestaurantName);
        }

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
