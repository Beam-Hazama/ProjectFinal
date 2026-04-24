import { defineStore } from 'pinia';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
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

      const categoryRef = collection(db, 'categories');
      let q;

      if (restaurantName) {
        q = query(categoryRef, where('RestaurantName', '==', restaurantName));
      } else {
        q = query(categoryRef);
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let newList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!restaurantName) {
          newList = newList.filter(item => !item.RestaurantName);
        }

        newList.sort((a, b) => {
          const aOrder = typeof a.order === 'number' ? a.order : Infinity;
          const bOrder = typeof b.order === 'number' ? b.order : Infinity;

          if (aOrder !== Infinity && bOrder !== Infinity) {
            return aOrder - bOrder;
          }
          if (aOrder !== Infinity) return -1;
          if (bOrder !== Infinity) return 1;
          
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        this.list = newList;
      });
    },

    
    async addCategory(categoryData) {
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        order: this.list.length,
        createdAt: serverTimestamp()
      });
    },

    
    async deleteCategory(categoryId) {
      await deleteDoc(doc(db, 'categories', categoryId));
    },

    
    async updateCategoryOrder(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'categories', id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    }
  },
});

