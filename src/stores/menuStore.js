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

export const useMenuStore = defineStore('menu', {

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

    
    async addMenu(menuData) {
      const timestamp = serverTimestamp();
      await addDoc(collection(db, 'Menu'), {
        ...menuData,
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
      });
    },

    
    async menuUpdate(menuId, menuData) {
      const menuRef = doc(db, 'Menu', menuId);
      
      const updatedData = {
        ...menuData,
        UpdatedAt: serverTimestamp(),

        status: deleteField(),
        updatedAt: deleteField()
      };

      await setDoc(menuRef, updatedData, { merge: true });
    },
  },
});

