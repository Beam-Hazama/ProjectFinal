import { defineStore } from "pinia";
import {
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { sortOrdersByDate, getProgressStatus } from "@/utils/orderHelpers";

export const useOrderlistStore = defineStore("orderlistStore", {
  state: () => ({
    list: [],
    unsubscribe: null,
  }),

  getters: {
    sortedOrders: (state) => sortOrdersByDate(state.list, "desc"),
  },

  actions: {
    async updateOrderStatus(orderId, newStatus, restaurantName) {
      try {
        const orderRef = doc(db, "Order", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return;

        const orderData = orderSnap.data();
        const updatedMenu = orderData.Menu.map((item) => {
          const isMyRestaurant = item.RestaurantName === restaurantName;
          const isNotCancelled = item.MenuStatus !== "cancelled";
          if (isMyRestaurant && isNotCancelled) {
            return { ...item, MenuStatus: newStatus };
          }
          return item;
        });

        const globalStatus = getProgressStatus(updatedMenu);

        const updateObj = {
          Menu: updatedMenu,
          OrderStatus: globalStatus,
          UpdatedAt: serverTimestamp(),
        };

        if (globalStatus === 'completed' || globalStatus === 'dispatched') {
          updateObj.CompletedAt = serverTimestamp();
        }

        await updateDoc(orderRef, updateObj);
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },

    async updateSingleMenuStatus(orderId, itemId, itemIndex, newStatus) {
      try {
        const orderRef = doc(db, "Order", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return;

        const orderData = orderSnap.data();
        const updatedMenu = orderData.Menu.map((item, index) => {
          let isMatch;
          if (itemId) {
            isMatch = item.cartItemId === itemId;
          } else {
            isMatch = index === itemIndex;
          }
          if (isMatch) {
            return { ...item, MenuStatus: newStatus };
          }
          return item;
        });

        const globalStatus = getProgressStatus(updatedMenu);

        const updateObj = {
          Menu: updatedMenu,
          OrderStatus: globalStatus,
          UpdatedAt: serverTimestamp(),
        };

        if (globalStatus === 'completed' || globalStatus === 'dispatched') {
          updateObj.CompletedAt = serverTimestamp();
        }

        await updateDoc(orderRef, updateObj);
      } catch (error) {
        console.error("Error updating single item status:", error);
        throw error;
      }
    },

    async updateMultipleItemsStatus(orderId, updates) {
      try {
        const orderRef = doc(db, "Order", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return;

        const orderData = orderSnap.data();
        const updatedMenu = orderData.Menu.map((item) => {
          const update = updates.find((u) => u.cartItemId === item.cartItemId);
          if (update) {
            return { ...item, MenuStatus: update.newStatus };
          }
          return item;
        });

        const globalStatus = getProgressStatus(updatedMenu);
        const updateObj = {
          Menu: updatedMenu,
          OrderStatus: globalStatus,
          UpdatedAt: serverTimestamp(),
        };

        if (globalStatus === 'completed' || globalStatus === 'dispatched') {
          updateObj.CompletedAt = serverTimestamp();
        }

        await updateDoc(orderRef, updateObj);
      } catch (error) {
        console.error("Error updating multiple items:", error);
        throw error;
      }
    },

    async cancelEntireOrder(orderId) {
      try {
        const orderRef = doc(db, "Order", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return;

        const orderData = orderSnap.data();
        const updatedMenu = orderData.Menu.map((item) => ({
          ...item,
          MenuStatus: "cancelled",
        }));

        await updateDoc(orderRef, {
          Menu: updatedMenu,
          OrderStatus: "cancelled",
          UpdatedAt: serverTimestamp(),
          CancelledAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error rejecting global order:", error);
        throw error;
      }
    },

    clearListener() {
      if (this.unsubscribe) {     //ถ้าไม่มีโค้ดจะเกิดError
        this.unsubscribe();
      }
      this.unsubscribe = null;
      this.list = [];
    },


    subscribeToQuery(queryRef) {
      this.unsubscribe = onSnapshot(queryRef, (snapshot) => {
        this.list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      });
    },

    // โหลดออเดอร์ของห้องนี้ใน 12 ชม.ล่าสุด (ฝั่งลูกค้า)
    async loadOrderUser(room) {
      this.clearListener();
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const q = query(collection(db, "Order"), where("RoomNumber", "==", room));
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.list = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((order) => {
            if (!order.CreatedAt) return true;
            const ms = order.CreatedAt.toMillis
              ? order.CreatedAt.toMillis()
              : order.CreatedAt;
            return ms >= twelveHoursAgo;
          });
      });
    },

    // โหลดออเดอร์ทั้งหมด (ถ้ามี restaurantName ก็กรองเฉพาะของร้านนั้น)
    async loadAllOrders(restaurantName = null) {
      this.clearListener();
      let ref;
      if (restaurantName) {
        ref = query(
          collection(db, "Order"),
          where("RestaurantsInOrder", "array-contains", restaurantName),
        );
      } else {
        ref = collection(db, "Order");
      }
      this.subscribeToQuery(ref);
    },
    async submitOrderReview(orderId, rating, feedback) {
      try {
        const orderRef = doc(db, "Order", orderId);
        await updateDoc(orderRef, {
          Rating: Number(rating),
          Feedback: feedback,
          ReviewedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error submitting review:", error);
        throw error;
      }
    },
  },
});
