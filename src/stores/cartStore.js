import { defineStore } from "pinia";
import { db } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export const useCartStore = defineStore("cart", {

  state: () => ({
    item: [],
    building: null,
    floor: null,
    room: null,
  }),

  getters: {
    
    getItemById: (state) => {
      return (menuId) => state.item.find(i => i.id === menuId) || null;
    },

    
    summaryQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.Quantity, 0);
    },

    
    summaryPrice(state) {
      return state.item.reduce((acc, item) => acc + (item.Price * item.Quantity), 0);
    },
  },

  actions: {
    
    loadcart(building, floor, room) {
      this.building = building;
      this.floor = floor;
      this.room = room;
      
      const storageKey = `cart-data-${building}-${floor}-${room}`;
      const previousCart = localStorage.getItem(storageKey);
      
      if (previousCart) {
        try {
          this.item = JSON.parse(previousCart);
        } catch (e) {
          console.error("Cart parse error:", e);
          this.item = [];
        }
      } else {
        this.item = [];
      }
    },

    
    saveToStorage() {
      if (this.building && this.floor && this.room) {
        const storageKey = `cart-data-${this.building}-${this.floor}-${this.room}`;
        if (this.item.length === 0) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify(this.item));
        }
      }
    },

    
    addOrUpdateItem(menu, quantity, note, unitPrice) {
      const priceToUse = unitPrice !== undefined ? unitPrice : menu.Price;

      this.item.push({
        id: menu.id,
        Name: menu.Name,
        cartItemId: `${menu.id}-${Math.random().toString(36).substr(2, 9)}`,
        Price: priceToUse,
        basePrice: menu.Price,
        ImageUrl: menu.ImageUrl,
        Quantity: quantity,
        note: note,
        Restaurant: menu.Restaurant
      });

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

    
    async placeorder() {
      try {
        const orderRef = doc(collection(db, 'Order'));
        const orderData = {
          OrderNumber: orderRef.id.substring(0, 7).toUpperCase(),
          building: this.building,
          floor: this.floor,
          room: this.room,
          Menu: this.item.map(i => ({
            ...i,
            cartItemId: i.cartItemId || `${i.id}-${Math.random().toString(36).substr(2, 9)}`,
            id: i.menuId || i.id,
            itemStatus: 'waiting'
          })),
          TotalPrice: this.summaryPrice,
          statusOrder: 'pending',
          CreatedAt: serverTimestamp()
        };

        await setDoc(orderRef, orderData);
        this.clearcart();
        return true;
      } catch (error) {
        console.error("Order placement error:", error);
        alert("สั่งซื้อไม่สำเร็จ");
        throw error;
      }
    },

    
    clearcart() {
      this.item = [];
      this.saveToStorage();
    }
  }
});

