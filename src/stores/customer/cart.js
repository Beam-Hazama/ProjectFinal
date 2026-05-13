import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { useMenuStore } from "@/stores/shared/menu";

const makeCartItemId = (id) =>
  `${id}-${Math.random().toString(36).substr(2, 9)}`;

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
    room: (() => {
      const saved = localStorage.getItem("lastRoom");
      return saved && saved !== "undefined" ? saved : "-";
    })(),
  }),

  getters: {
    getItemById: (state) => {
      return (menuId) => state.item.find((i) => i.MenuId === menuId) || null;
    },

    totalQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.Quantity, 0);
    },

    totalPrice(state) {
      return state.item.reduce(
        (acc, item) => acc + item.Price * item.Quantity,
        0,
      );
    },
  },

  actions: {
    setRoom(roomNumber) {
      if (roomNumber && roomNumber !== "-" && roomNumber !== "undefined") {
        this.room = roomNumber;
        localStorage.setItem("lastRoom", roomNumber);
        this.loadCart(roomNumber); // อัปเดตและโหลดรายการอาหารในตะกร้าของห้องนี้ทันที
      }
    },

    loadCart(room) {
      this.room = room;

      const storageKey = `cart-data-${room}`;
      const previousCart = localStorage.getItem(storageKey);

      if (previousCart) {
        try {
          const parsed = JSON.parse(previousCart);

          this.item = parsed.map((i) => ({
            ...i,
            cartItemId: i.cartItemId || makeCartItemId(i.MenuId || i.id),
          }));
        } catch (e) {
          console.error("Cart parse error:", e);
          this.item = [];
        }
      } else {
        this.item = [];
      }
    },

    saveToStorage() {
      if (this.room) {
        const storageKey = `cart-data-${this.room}`;
        if (this.item.length === 0) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify(this.item));
        }
      }
    },

    addOrUpdateItem(menu, quantity, Note, unitPrice) {
      const priceToUse = unitPrice !== undefined ? unitPrice : menu.Price;
      const existingItem = this.item.find(
        (i) =>
          i.MenuId === menu.MenuId &&
          i.Note === Note &&
          i.Price === priceToUse,
      );

      if (existingItem) {
        existingItem.Quantity += quantity;
      } else {
        const id = menu.MenuId;
        this.item.push({
          MenuId: id,
          MenuName: menu.MenuName,
          cartItemId: makeCartItemId(id),
          Price: priceToUse,
          basePrice: menu.Price,
          ImageUrl: menu.ImageUrl,
          Quantity: quantity,
          Note: Note,
          RestaurantName: menu.RestaurantName,
        });
      }

      this.saveToStorage();
    },

    removeItemInCart(index) {
      this.item.splice(index, 1);
      this.saveToStorage();
    },

    updateQuantity(index, increment) {
      if (this.item[index]) {
        const newQuantity = this.item[index].Quantity + increment;
        if (newQuantity >= 1) {
          this.item[index].Quantity = newQuantity;
          this.saveToStorage();
        } else if (newQuantity === 0) {
          this.removeItemInCart(index);
        }
      }
    },

    async placeOrder() {
      try {
        const menuStore = useMenuStore();
        const cartItems = [...this.item];
        const room = this.room;
        const totalPrice = this.totalPrice;
        const restaurants = [
          ...new Set(cartItems.map((i) => i.RestaurantName || i.Restaurant || "Unknown")),
        ];

        // 1. Prepare Order Document & ID
        const orderRef = doc(collection(db, "Order"));
        const finalOrderNumber = orderRef.id.slice(0, 8).toUpperCase();

        const orderData = {
          OrderNumber: finalOrderNumber,
          RoomNumber: room,
          Menu: cartItems.map((i) => {
            const menuId = i.MenuId;
            return {
              ...i,
              cartItemId: i.cartItemId || makeCartItemId(menuId),
              MenuId: menuId,
              MenuStatus: "pending",
            };
          }),
          TotalPrice: totalPrice,
          OrderStatus: "pending",
          CreatedAt: serverTimestamp(),
          RestaurantsInOrder: restaurants,
        };

        // 2. Save Document to Firestore
        await setDoc(orderRef, orderData);

        // Clear cart after successful save
        this.clearCart();
        return true;
      } catch (error) {
        console.error("Order placement error:", error);
        alert("สั่งซื้อไม่สำเร็จ: " + error.message);
        throw error;
      }
    },

    clearCart() {
      this.item = [];
      this.saveToStorage();
    },
  },
});
