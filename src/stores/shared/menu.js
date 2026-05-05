import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDoc,
  updateDoc,
  deleteDoc,
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
    isLoading: false,
  }),

  getters: {
    getMenuNameById: (state) => (id) => {
      const menu = state.list.find(m => m.id === id);
      return menu ? menu.Name : 'เมนู (ไม่ทราบชื่อ)';
    }
  },

  actions: {
    
    clearListener() {
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.list = [];
    },

    
    async loadMenu(restaurantName = null) {
      this.clearListener();
      this.isLoading = true;
      
      const ref = restaurantName
        ? query(collection(db, 'Menu'), where('Restaurant', '==', restaurantName))
        : collection(db, 'Menu');
      
      this.unsubscribe = onSnapshot(ref, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.isLoading = false;
      }, (error) => {
        console.error('Menu load error:', error);
        this.isLoading = false;
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

    async fetchById(id) {
      try {
        const menuRef = doc(db, 'Menu', id);
        const menuSnap = await getDoc(menuRef);
        if (menuSnap.exists()) {
          return menuSnap.data();
        }
        return null;
      } catch (error) {
        console.error('Error fetching menu by id:', error);
        return null;
      }
    },

    async toggleStatus(id, currentStatus) {
      try {
        const newStatus = currentStatus === 'open' ? 'close' : 'open';
        const menuRef = doc(db, 'Menu', id);
        await updateDoc(menuRef, {
          Status: newStatus,
          UpdatedAt: serverTimestamp(),
          status: deleteField(),
          updatedAt: deleteField()
        });
      } catch (error) {
        console.error("Error toggling status:", error);
        throw error;
      }
    },

    async deleteById(id) {
      try {
        const menuRef = doc(db, 'Menu', id);
        await deleteDoc(menuRef);
      } catch (error) {
        console.error("Error deleting menu:", error);
        throw error;
      }
    }
  },
});

