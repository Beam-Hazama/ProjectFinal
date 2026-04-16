import { defineStore } from 'pinia';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Poster Store
 * Manages promotional banners and marketing posters for restaurants. 
 * Includes complex logic for scheduling, real-time fetching, and sorting.
 */
export const usePosterStore = defineStore('poster', {
  // --- State ---
  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  // --- Getters ---
  getters: {
    /**
     * Filter the list to only include posters that are currently active and within their scheduled timeframe.
     */
    activePosters: (state) => state.list.filter(p => {
      // 1. Basic active check
      if (!p.isActive) return false;

      // 2. Schedule timeframe check
      if (p.hasSchedule && p.startTime && p.endTime) {
        const now = new Date();
        const start = new Date(p.startTime);
        const end = new Date(p.endTime);
        if (now < start || now > end) {
          return false;
        }
      }
      return true;
    })
  },

  // --- Actions ---
  actions: {
    /**
     * Clear the active Firestore listener and reset the poster list.
     */
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    /**
     * Load posters in real-time. Can be filtered by a specific restaurant or shown globally.
     */
    async loadPosters(restaurantName = null) {
      this.clearListener();

      const posterRef = collection(db, 'posters');
      let q;

      // 1. Build Query
      if (restaurantName) {
        // Find posters for a specific restaurant
        q = query(posterRef, where('RestaurantName', '==', decodeURIComponent(restaurantName)));
      } else {
        // Admin view: fetch all posters
        q = query(posterRef, orderBy('createdAt', 'desc'));
      }

      // 2. Set up listener
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 3. Filter for admin view: only show global posters if restaurantName is null
        if (!restaurantName) {
          docs = docs.filter(item => !item.RestaurantName);
        }

        // 4. Sort posters: by custom order (if set), then by creation date (newest first)
        docs.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            if (a.order !== b.order) return a.order - b.order;
          } else if (a.order !== undefined) {
            return -1;
          } else if (b.order !== undefined) {
            return 1;
          }

          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return timeB - timeA;
        });

        this.list = docs;
      });
    },

    /**
     * Save a new poster to the collection.
     */
    async addPoster(posterData) {
      await addDoc(collection(db, 'posters'), {
        ...posterData,
        order: this.list.length, // Add to the end by default
        createdAt: serverTimestamp(),
        isActive: true
      });
    },

    /**
     * Update existing poster metadata.
     */
    async updatePoster(posterId, updateData) {
      const posterRef = doc(db, 'posters', posterId);
      await setDoc(posterRef, updateData, { merge: true });
    },

    /**
     * Delete a poster permanentally.
     */
    async deletePoster(posterId) {
      await deleteDoc(doc(db, 'posters', posterId));
    },

    /**
     * Toggle a poster's visibility status.
     */
    async toggleActive(posterId, currentStatus) {
      const posterRef = doc(db, 'posters', posterId);
      await setDoc(posterRef, { isActive: !currentStatus }, { merge: true });
    },

    /**
     * Update the display order of multiple posters (Admin/Restaurant reordering).
     */
    async updatePosterOrder(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'posters', id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    }
  },
});
