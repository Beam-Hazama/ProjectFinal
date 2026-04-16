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

/**
 * Category Store
 * Manages food categories for restaurants, including real-time loading, 
 * sorting logic, and drag-and-drop order updates.
 */
export const useCategoryStore = defineStore('category', {
  // --- State ---
  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  // --- Actions ---
  actions: {
    /**
     * Clear the active Firestore listener and reset the category list.
     */
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    /**
     * Load categories in real-time. Can be filtered by a specific restaurant.
     */
    async loadCategories(restaurantName = null) {
      this.clearListener();

      const categoryRef = collection(db, 'categories');
      let q;

      // 1. Determine the query based on whether we are filtering by restaurant
      if (restaurantName) {
        q = query(categoryRef, where('RestaurantName', '==', restaurantName));
      } else {
        q = query(categoryRef);
      }

      // 2. Set up the real-time listener
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let newList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 3. Filter out global categories if a restaurant name is provided
        if (!restaurantName) {
          newList = newList.filter(item => !item.RestaurantName);
        }

        // 4. Apply sorting logic: by order (asc), then by creation time (desc)
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

    /**
     * Add a new category to the database.
     */
    async addCategory(categoryData) {
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        order: this.list.length, // Add to the end of the list by default
        createdAt: serverTimestamp()
      });
    },

    /**
     * Remove a category from the system.
     */
    async deleteCategory(categoryId) {
      await deleteDoc(doc(db, 'categories', categoryId));
    },

    /**
     * Synchronize the new order of categories after a drag-and-drop operation.
     */
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
