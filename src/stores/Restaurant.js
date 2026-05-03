import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db , auth } from '@/firebase';

export const useRestaurant = defineStore('Restaurant', {

  state: () => ({
    list: [],
    restaurantName: '',
    menus: [],
    restaurant: null,
    unsubscribe: null,
    isLoading: false
  }),

  actions: {
    
    async loadRestaurant() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snap = await getDoc(doc(db, 'Restaurant', uid));
      if (!snap.exists()) throw new Error('ไม่พบข้อมูลร้าน');

      this.restaurant = snap.data();
    },

    
    async loadMenusByRestaurant() {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) return reject('ยังไม่ได้ login');

          const userSnap = await getDoc(doc(db, 'User', user.uid));
          if (!userSnap.exists()) return reject('ไม่พบข้อมูลร้าน');

          this.restaurantName = userSnap.data().restaurant;

          const q = query(
            collection(db, 'Menu'),
            where('Restaurant', '==', this.restaurantName)
          );

          const snap = await getDocs(q);
          this.menus = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

          resolve(true);
        });
      });
    },

    
    async loadListRestaurant() {
      this.clearListener();
      this.isLoading = true;
      const RestaurantCol = collection(db, 'Restaurant');
      this.unsubscribe = onSnapshot(RestaurantCol, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.isLoading = false;
      }, (error) => {
        console.error("Error loading restaurants:", error);
        this.isLoading = false;
      });
    },

    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    }
  },
});

