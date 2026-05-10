import { defineStore } from "pinia";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    list: [],
    unsubscribe: null,
    isLoading: false,
  }),

  actions: {
    clearListener() {
      if (this.unsubscribe) {     //ถ้าไม่มีโค้ดจะเกิดError
        this.unsubscribe();
      }
      this.unsubscribe = null;
      this.list = [];
    },

    async loadMenu(restaurantName = null) {
      this.clearListener();
      this.isLoading = true;

      let ref;
      if (restaurantName) {
        ref = query(
          collection(db, "Menu"),
          where("RestaurantName", "==", restaurantName),
        );
      } else {
        ref = collection(db, "Menu");
      }

      this.unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          this.list = snapshot.docs.map((doc) => {
            const menuData = doc.data();
            return {
              MenuId: doc.id,
              ...menuData,
              MenuName: menuData.MenuName,
              Restaurant: menuData.RestaurantName,
            };
          });
          this.isLoading = false;
        },
        (error) => {
          console.error("Menu load error:", error);
          this.isLoading = false;
        },
      );
    },

    async addMenu(menuData) {
      const timestamp = serverTimestamp();
      await addDoc(collection(db, "Menu"), {
        ...menuData,
        CreatedAt: timestamp,
        UpdatedAt: timestamp,
      });
    },

    async updateMenu(menuId, menuData) {
      const menuRef = doc(db, "Menu", menuId);

      const updatedData = {
        ...menuData,
        UpdatedAt: serverTimestamp(),
      };
      await setDoc(menuRef, updatedData, { merge: true });
    },

    async fetchMenuById(id) {
      try {
        const menuRef = doc(db, "Menu", id);
        const menuSnap = await getDoc(menuRef);
        if (menuSnap.exists()) {
          return menuSnap.data();
        }
        return null;
      } catch (error) {
        console.error("Error fetching menu by id:", error);
        return null;
      }
    },

    async toggleStatus(id, currentStatus) {
      try {
        const newStatus = currentStatus === "open" ? "close" : "open";
        const menuRef = doc(db, "Menu", id);
        await updateDoc(menuRef, {
          Status: newStatus,
          UpdatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error toggling status:", error);
        throw error;
      }
    },

    async deleteMenuById(id) {
      try {
        const menuRef = doc(db, "Menu", id);
        await deleteDoc(menuRef);
      } catch (error) {
        console.error("Error deleting menu:", error);
        throw error;
      }
    },
  },
});
