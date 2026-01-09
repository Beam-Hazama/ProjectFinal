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
  getDoc
} from "firebase/firestore";
import { db } from "@/firebase";

export const useOderlistStore = defineStore("oderlist", {
  state: () => ({
    list: [],
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

          await updateDoc(orderRef, {
            Menu: updatedMenu
          });
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },
    
    async loadOrderUser(tableId) {
      const orderQuery = query(
        collection(db, "Order"),
        where("tableId", "==", tableId)
      );

      onSnapshot(orderQuery, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },
    async addToOrderList(orderData) {
      const { Menu, ...orderref } = orderData;
      const cleanedMenu = Menu.map((item) => {
        const { Status, Remainquantity, ImageUrl, ...filtered } = item;
        return { ...filtered, itemStatus: "pending" };
      });
      const finalOrder = { ...orderref, Menu: cleanedMenu };
      await addDoc(collection(db, "Order"), {
        ...finalOrder,
        statusOrder: "pending",
        CreatedAt: serverTimestamp(),
      });
    },
    async loadOrder() {
      const orderList = query(
        collection(db, "Order"),
        where("statusOrder", "==", "pending")
      );
      onSnapshot(orderList, (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },
    async loadOrderinadmin() {
      onSnapshot(collection(db, "Order"), (orderSnapshot) => {
        this.list = orderSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
      });
    },
  },
});