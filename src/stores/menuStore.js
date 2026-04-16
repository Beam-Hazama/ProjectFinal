import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  addDoc,
  query, 
  where, 
  deleteField 
} from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Menu Store
 * Manages the menu items for all restaurants, including real-time loading and persistence.
 */
export const useMenuStore = defineStore('menu', {
  // --- State ---
  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  // --- Actions ---
  actions: {
    /**
     * Clear the active Firestore listener and reset the menu list.
     */
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    /**
     * Load all menu items from the system in real-time.
     */
    async loadMenu() {
      this.clearListener();
      
      const menuCollection = collection(db, 'Menu');
      this.unsubscribe = onSnapshot(menuCollection, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }, (error) => {
        console.error('Error loading all menus:', error);
      });
    },

    /**
     * Load menu items belonging to a specific restaurant in real-time.
     */
    async loadMenuRestaurant(restaurantName) {
      this.clearListener();

      const q = query(
        collection(db, 'Menu'),
        where('Restaurant', '==', restaurantName)
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }, (error) => {
        console.error(`Error loading menus for ${restaurantName}:`, error);
      });
    },

    /**
     * Add a new menu item to the database.
     */
    async addMenu(menuData) {
      const timestamp = serverTimestamp();
      await addDoc(collection(db, 'Menu'), {
        ...menuData,
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
      });
    },

    /**
     * Update an existing menu item and perform field cleanup.
     */
    async menuUpdate(menuId, menuData) {
      const menuRef = doc(db, 'Menu', menuId);
      
      const updatedData = {
        ...menuData,
        UpdatedAt: serverTimestamp(),
        // Cleanup legacy snake_case fields if they exist
        status: deleteField(),
        updatedAt: deleteField()
      };

      await setDoc(menuRef, updatedData, { merge: true });
    },
  },
});
