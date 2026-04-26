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

export const useOrderlistStore = defineStore("orderlist", {

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
    
    _recalculateGlobalStatus(updatedMenu) {
      const allItemsFinished = updatedMenu.every(item =>
        ['received', 'dispatched', 'cancelled', 'returned'].includes(item.itemStatus)
      );

      if (allItemsFinished) {
        const anySuccessful = updatedMenu.some(item => ['received', 'dispatched'].includes(item.itemStatus));
        if (anySuccessful) return 'completed';
        
        const allCancelled = updatedMenu.every(item => item.itemStatus === 'cancelled');
        if (allCancelled) return 'cancelled';
        
        return 'returned';
      } else {
        const anyCooking = updatedMenu.some(item => item.itemStatus === 'cooking' || item.itemStatus === 'dispatched');
        return anyCooking ? 'cooking' : 'pending';
      }
    },

    
    async updateOrderStatus(orderId, newStatus, restaurantName) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.Restaurant === restaurantName) {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = this._recalculateGlobalStatus(updatedMenu);

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

    
    async updateSingleItemStatus(orderId, itemId, newStatus) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.cartItemId === itemId) {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = this._recalculateGlobalStatus(updatedMenu);

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
          const updatedMenu = orderData.Menu.map(item => {
            const update = updates.find(u => u.itemId === item.cartItemId);
            if (update) {
              return { ...item, itemStatus: update.newStatus };
            }
            return item;
          });

          const globalStatus = this._recalculateGlobalStatus(updatedMenu);

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

    
    async rejectOrderGlobal(orderId) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => ({
            ...item,
            itemStatus: (item.itemStatus === 'cancelled') ? 'cancelled' : 'returned'
          }));

          transaction.update(orderRef, {
            Menu: updatedMenu,
            statusOrder: 'returned',
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
        const newOrders = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.list = newOrders;
      });
    },

    
    async addToOrderList(orderData) {
      const { Menu, ...orderref } = orderData;

      const cleanedMenu = Menu.map((item) => {
        const { Status, Remainquantity, ImageUrl, ...filtered } = item;
        return { ...filtered, itemStatus: "waiting" };
      });

      const finalOrder = { ...orderref, Menu: cleanedMenu };
      
      await addDoc(collection(db, "Order"), {
        ...finalOrder,
        statusOrder: "pending",
        CreatedAt: serverTimestamp(),
      });
    },

    
    async loadOrder() {
      this.clearListener();

      const orderListVisible = query(
        collection(db, "Order"),
        where("statusOrder", "==", "pending")
      );
      this.unsubscribe = onSnapshot(orderListVisible, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },

    
    async loadOrderinadmin() {
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
