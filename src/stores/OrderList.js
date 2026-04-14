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
  deleteField
} from "firebase/firestore";
import { db } from "@/firebase";

export const useOderlistStore = defineStore("oderlist", {
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
    async _recalculateGlobalStatus(updatedMenu) {
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
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.Restaurant === restaurantName) {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = await this._recalculateGlobalStatus(updatedMenu);

          await updateDoc(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });

          if (newStatus === 'cancelled') {
            for (const item of updatedMenu) {
              if (item.Restaurant === restaurantName) {
                const menuRef = doc(db, 'Menu', item.id);
                await updateDoc(menuRef, {
                  Status: 'close',
                  UpdatedAt: serverTimestamp(),
                  status: deleteField(),
                  updatedAt: deleteField()
                }).catch(e => console.error("Menu sync fail:", e));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },
    async updateSingleItemStatus(orderId, itemId, newStatus) {
      try {
        const orderRef = doc(db, 'Order', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.id === itemId) {
              return { ...item, itemStatus: newStatus };
            }
            return item;
          });

          const globalStatus = await this._recalculateGlobalStatus(updatedMenu);

          await updateDoc(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });

          if (newStatus === 'cancelled') {
            const menuRef = doc(db, 'Menu', itemId);
            await updateDoc(menuRef, {
              Status: 'close',
              UpdatedAt: serverTimestamp(),
              status: deleteField(),
              updatedAt: deleteField()
            }).catch(e => console.error("Menu sync fail:", e));
          }
        }
      } catch (error) {
        console.error("Error updating single item status:", error);
        throw error;
      }
    },
    async updateMultipleItemsStatus(orderId, updates) {
      try {
        const orderRef = doc(db, 'Order', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            const update = updates.find(u => u.itemId === item.id);
            if (update) {
              return { ...item, itemStatus: update.newStatus };
            }
            return item;
          });

          const globalStatus = await this._recalculateGlobalStatus(updatedMenu);

          await updateDoc(orderRef, {
            Menu: updatedMenu,
            statusOrder: globalStatus,
            UpdatedAt: serverTimestamp()
          });

          for (const update of updates) {
            if (update.newStatus === 'cancelled') {
              const menuRef = doc(db, 'Menu', update.itemId);
              await updateDoc(menuRef, {
                Status: 'close',
                UpdatedAt: serverTimestamp(),
                status: deleteField(),
                updatedAt: deleteField()
              }).catch(e => console.error("Menu sync fail:", e));
            }
          }
        }
      } catch (error) {
        console.error("Error updating multiple items:", error);
        throw error;
      }
    },

    async rejectOrderGlobal(orderId) {
      try {
        const orderRef = doc(db, 'Order', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();


          const updatedMenu = orderData.Menu.map(item => ({
            ...item,
            itemStatus: (item.itemStatus === 'cancelled') ? 'cancelled' : 'returned'
          }));

          await updateDoc(orderRef, {
            Menu: updatedMenu,
            statusOrder: 'returned'
          });


          for (const item of updatedMenu) {
            if (item.itemStatus === 'cancelled') {
              const menuRef = doc(db, 'Menu', item.id);
              await updateDoc(menuRef, {
                Status: 'close',
                UpdatedAt: serverTimestamp(),
                status: deleteField(),
                updatedAt: deleteField()
              }).catch(e => console.error("Global return sync fail:", e));
            }
          }
        }
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


    async loadOrderUser(tableId) {
      this.clearListener();

      const orderQuery = query(
        collection(db, "Order"),
        where("tableId", "==", tableId)
      );

      this.unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
        const newOrders = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (this.list.length > 0) {
          // Local notification triggers removed, Cloud Function handles it.
        }

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

      const orderList = query(
        collection(db, "Order"),
        where("statusOrder", "==", "pending")
      );
      this.unsubscribe = onSnapshot(orderList, (orderSnapshot) => {
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