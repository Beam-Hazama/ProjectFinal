import { defineStore } from "pinia";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  runTransaction,
  deleteField,
  Timestamp
} from "firebase/firestore";
import { db } from "@/firebase";

export const useOrderlistStore = defineStore("orderlistStore", {

  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  getters: {
    
    sortedOrders: (state) => {
      return [...state.list].sort((a, b) => {
        if (!a.CreatedAt || !b.CreatedAt) return 0;
        return a.CreatedAt.seconds - b.CreatedAt.seconds;
      });
    },
  },

  actions: {
    
    _deriveOrderStatus(updatedMenu) {
      if (!updatedMenu || updatedMenu.length === 0) return 'pending';

      const statuses = updatedMenu.map(item => item.itemStatus || 'waiting');
      
      // 1. If all items are cancelled, the entire order is cancelled
      if (statuses.every(s => s === 'cancelled')) return 'cancelled';

      // 2. Filter out cancelled items to determine the active status
      const activeStatuses = statuses.filter(s => s !== 'cancelled');
      if (activeStatuses.length === 0) return 'cancelled';

      // 3. Status Hierarchy Ranking (Lower number = Higher Priority for global status)
      const statusRank = {
        'waiting': 0,
        'pending': 0,
        'cooking': 1,
        'dispatched': 2,
        'received': 3
      };

      // Determine global status by the "least progressed" item (minimum rank)
      let minRank = 3; 
      let foundActive = false;

      activeStatuses.forEach(s => {
        const rank = statusRank[s] !== undefined ? statusRank[s] : 0;
        if (rank < minRank) minRank = rank;
        foundActive = true;
      });

      if (!foundActive) return 'cancelled';

      const rankToGlobalStatus = {
        0: 'pending',
        1: 'cooking',
        2: 'dispatched',
        3: 'completed'
      };

      return rankToGlobalStatus[minRank];
    },

    
    async updateOrderStatus(orderId, newStatus, restaurantName) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.Restaurant === restaurantName && item.itemStatus !== 'cancelled') {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = this._deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },

    
    async updateSingleItemStatus(orderId, itemId, itemIndex, newStatus) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map((item, index) => {
            const isMatch = itemId ? item.cartItemId === itemId : index === itemIndex;
            if (isMatch) {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = this._deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error updating single item status:", error);
        throw error;
      }
    },

    
    async updateMultipleItemsStatus(orderId, updates) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map((item, index) => {
            const update = updates.find(u => u.itemId ? u.itemId === item.cartItemId : u.itemIndex === index);
            if (update) {
              return { ...item, itemStatus: update.newStatus };
            }
            return item;
          });

          const globalStatus = this._deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error updating multiple items:", error);
        throw error;
      }
    },

    
    async cancelEntireOrder(orderId) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => ({
            ...item,
            itemStatus: 'cancelled'
          }));

          transaction.update(orderRef, {
            Menu: updatedMenu,
            statusOrder: 'cancelled',
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error rejecting global order:", error);
        throw error;
      }
    },

    
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    
    async loadOrderUser(room) {
      this.clearListener();

      const twelveHoursAgo = Timestamp.fromMillis(Date.now() - (12 * 60 * 60 * 1000));

      const orderQuery = query(
        collection(db, "Order"),
        where("room", "==", room),
        where("CreatedAt", ">=", twelveHoursAgo)
      );

      this.unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },

    
    async loadOrder(restaurantName = null) {
      this.clearListener();

      let orderQuery;
      if (restaurantName) {
        orderQuery = query(
          collection(db, "Order"),
          where("statusOrder", "in", ["pending", "cooking", "dispatched"]),
          where("RestaurantsInOrder", "array-contains", restaurantName)
        );
      } else {
        orderQuery = query(
          collection(db, "Order"),
          where("statusOrder", "in", ["pending", "cooking", "dispatched"])
        );
      }

      this.unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },

    
    async loadAllOrders(restaurantName = null) {
      this.clearListener();

      let orderQuery;
      if (restaurantName) {
        orderQuery = query(
          collection(db, "Order"),
          where("RestaurantsInOrder", "array-contains", restaurantName)
        );
      } else {
        orderQuery = collection(db, "Order");
      }

      this.unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },
  },
});
