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
  deleteField
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

      // 3. Status Hierarchy (The "earliest" active status determines the global status)
      // Hierarchy: waiting/pending > cooking > dispatched > received (completed)
      
      if (activeStatuses.some(s => ['waiting', 'pending'].includes(s))) {
        return 'pending';
      }
      
      if (activeStatuses.some(s => s === 'cooking')) {
        return 'cooking';
      }
      
      if (activeStatuses.some(s => s === 'dispatched')) {
        return 'dispatched';
      }
      
      if (activeStatuses.every(s => s === 'received')) {
        return 'completed';
      }

      return 'pending';
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

    
    async loadOrderUser(building, floor, room) {
      this.clearListener();

      const orderQuery = query(
        collection(db, "Order"),
        where("building", "==", building),
        where("floor", "==", floor),
        where("room", "==", room)
      );

      this.unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
        const twelveHoursAgo = Math.floor(Date.now() / 1000) - (12 * 60 * 60);
        const newOrders = orderSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(order => (order.CreatedAt?.seconds || 0) >= twelveHoursAgo);
        this.list = newOrders;
      });
    },

    
    async loadOrder() {
      this.clearListener();

      const orderListVisible = query(
        collection(db, "Order"),
        where("statusOrder", "in", ["pending", "cooking", "dispatched"])
      );
      this.unsubscribe = onSnapshot(orderListVisible, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },

    
    async loadAllOrders() {
      this.clearListener();

      this.unsubscribe = onSnapshot(collection(db, "Order"), (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },
  },
});
