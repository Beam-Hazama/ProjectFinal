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
import { sortOrdersByDate, deriveOrderStatus } from "@/utils/orderHelpers";

export const useOrderlistStore = defineStore("orderlistStore", {

  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  getters: {
    // เรียงจากเก่าไปใหม่ (asc) เพื่อให้ component แสดงตามลำดับเวลาที่ออเดอร์เข้ามา
    sortedOrders: (state) => sortOrdersByDate(state.list, 'asc'),
  },

  actions: {
    
    async updateOrderStatus(orderId, newStatus, restaurantName) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map(item => {
            if (item.Restaurant === restaurantName && item.MenuStatus !== 'cancelled') {
              return { ...item, MenuStatus: newStatus };
            }
            return item;
          });

          const globalStatus = deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            OrderStatus: globalStatus,
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },

    
    async updateSingleMenuStatus(orderId, itemId, itemIndex, newStatus) {
      try {
        const orderRef = doc(db, 'Order', orderId);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) return;

          const orderData = orderSnap.data();
          const updatedMenu = orderData.Menu.map((item, index) => {
            const isMatch = itemId ? item.cartItemId === itemId : index === itemIndex;
            if (isMatch) {
              return { ...item, MenuStatus: newStatus };
            }
            return item;
          });

          const globalStatus = deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            OrderStatus: globalStatus,
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
              return { ...item, MenuStatus: update.newStatus };
            }
            return item;
          });

          const globalStatus = deriveOrderStatus(updatedMenu);

          transaction.update(orderRef, {
            Menu: updatedMenu,
            OrderStatus: globalStatus,
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
            MenuStatus: 'cancelled'
          }));

          transaction.update(orderRef, {
            Menu: updatedMenu,
            OrderStatus: 'cancelled',
            UpdatedAt: serverTimestamp()
          });
        });
      } catch (error) {
        console.error("Error rejecting global order:", error);
        throw error;
      }
    },

    
    clearListener() {
      // ใช้ optional chaining ให้สั้นลง
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.list = [];
    },

    // Helper ภายใน: subscribe ไปที่ query แล้วอัพเดท list
    _listenTo(queryRef) {
      this.unsubscribe = onSnapshot(queryRef, (snap) => {
        this.list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    },

    // โหลดออเดอร์ของห้องนี้ใน 12 ชม.ล่าสุด (ฝั่งลูกค้า)
    async loadOrderUser(room) {
      this.clearListener();
      const twelveHoursAgo = Timestamp.fromMillis(Date.now() - (12 * 60 * 60 * 1000));
      this._listenTo(query(
        collection(db, "Order"),
        where("Roomnumber", "==", room),
        where("CreatedAt", ">=", twelveHoursAgo)
      ));
    },

    // โหลดออเดอร์ที่กำลังดำเนินการอยู่ (ถ้ามี restaurantName ก็กรองเฉพาะของร้านนั้น)
    async loadOrder(restaurantName = null) {
      this.clearListener();
      const conditions = [
        collection(db, "Order"),
        where("OrderStatus", "in", ["pending", "cooking", "dispatched"]),
      ];
      if (restaurantName) {
        conditions.push(where("RestaurantsInOrder", "array-contains", restaurantName));
      }
      this._listenTo(query(...conditions));
    },

    // โหลดออเดอร์ทั้งหมด (ถ้ามี restaurantName ก็กรองเฉพาะของร้านนั้น)
    async loadAllOrders(restaurantName = null) {
      this.clearListener();
      const ref = restaurantName
        ? query(collection(db, "Order"), where("RestaurantsInOrder", "array-contains", restaurantName))
        : collection(db, "Order");
      this._listenTo(ref);
    },
  },
});
