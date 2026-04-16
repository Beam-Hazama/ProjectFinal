import { defineStore } from 'pinia';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db , auth } from '@/firebase';

/**
 * Restaurant Store
 * Manages core restaurant information and the relationship between a user and their restaurant.
 */
export const useRestaurant = defineStore('Restaurant', {
  // --- State ---
  state: () => ({
    list: [],           // All restaurants (Admin View)
    restaurantName: '', // Current user's restaurant name
    menus: [],          // Current user's restaurant menus
    restaurant: null    // Current user's restaurant details
  }),

  // --- Actions ---
  actions: {
    /**
     * Load specific details for the currently authenticated restaurant user.
     */
    async loadRestaurant() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snap = await getDoc(doc(db, 'Restaurant', uid));
      if (!snap.exists()) throw new Error('ไม่พบข้อมูลร้าน');

      this.restaurant = snap.data();
    },

    /**
     * Restore the user session and load all menus belonging to their restaurant.
     */
    async loadMenusByRestaurant() {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) return reject('ยังไม่ได้ login');

          // 1. Get the restaurant name associated with this user
          const userSnap = await getDoc(doc(db, 'User', user.uid));
          if (!userSnap.exists()) return reject('ไม่พบข้อมูลร้าน');

          this.restaurantName = userSnap.data().restaurant;

          // 2. Fetch all menus for this restaurant
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

    /**
     * Load a real-time list of all restaurants in the system.
     */
    async loadListRestaurant() {
      const RestaurantCol = collection(db, 'Restaurant');
      onSnapshot(RestaurantCol, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },
  },
});
