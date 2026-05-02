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
    
    _recalculateGlobalStatus(updatedMenu) {
      const allFinished = updatedMenu.every(item => 
        ['received', 'cancelled'].includes(item.itemStatus)
      );

      if (allFinished) {
        const anyReceived = updatedMenu.some(item => item.itemStatus === 'received');
        return anyReceived ? 'completed' : 'cancelled';
      }

      const allDispatchedOrFinished = updatedMenu.every(item => 
        ['dispatched', 'received', 'cancelled'].includes(item.itemStatus)
      );

      if (allDispatchedOrFinished) {
        return 'dispatched';
      }

      const anyActive = updatedMenu.some(item => 
        ['cooking', 'pending', 'waiting', 'dispatched'].includes(item.itemStatus)
      );
      
      if (anyActive) {
        const anyCooking = updatedMenu.some(item => 
          ['cooking', 'dispatched'].includes(item.itemStatus)
        );
        return anyCooking ? 'cooking' : 'pending';
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
          const updatedMenu = orderData.Menu.map((item, index) => {
            const update = updates.find(u => u.itemId ? u.itemId === item.cartItemId : u.itemIndex === index);
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
        where("statusOrder", "in", ["pending", "cooking", "dispatched"])
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
