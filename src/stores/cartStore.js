import { defineStore } from "pinia";
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
    building: null,
    floor: null,
    room: null,
  }),
  getters: {
    // ... existing getters
    getItemById: (state) => {
      return (productId) =>
        state.item.find(i => i.id === productId) || null
    },
    summaryQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.Quantity, 0);
    },
    summaryPrice(state) {
      return state.item.reduce((acc, item) => acc + item.Price * item.Quantity, 0);
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
        this.item = JSON.parse(previousCart);
      } else {
        this.item = [];
      }
    },
    saveToStorage() {
      if (this.building && this.floor && this.room) {
        const storageKey = `cart-data-${this.building}-${this.floor}-${this.room}`;
        localStorage.setItem(storageKey, JSON.stringify(this.item));
      }
    },
    addOrUpdateItem(product, quantity, note) {
      const index = this.item.findIndex(i => i.id === product.id)
    
      if (index === -1) {
        this.item.push({
          id: product.id,
          Name: product.Name,
          Price: product.Price,
          ImageUrl: product.ImageUrl,
          Quantity: quantity,
          note: note,
          Restaurant: product.Restaurant
        })
      } else {
        this.item[index].Quantity = quantity
        this.item[index].note = note
      }
    
      this.saveToStorage()
    },
    
    removeItemInCart(index) {
      this.item.splice(index, 1);
      this.saveToStorage();
    },
    async placeorder() {
      try {
        const orderData = {
          OrderNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
          tableId: `${this.building}-${this.floor}-${this.room}`, // Keeping tableId as composite string for backward compatibility or ease of display? Or removing? User said "replace tableId". 
          // But Admin might expect tableId for display if I don't update it yet. 
          // I will store both for safety during transition, OR just building/floor/room.
          // Let's store individual fields AND the composite as Reference if needed.
          building: this.building, 
          floor: this.floor,       
          room: this.room,         
          Menu: this.item.map(i => ({...i, itemStatus: 'pending'})),
          TotalPrice: this.summaryPrice,
          statusOrder: 'pending',
          CreatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'Order'), orderData);
        // localStorage.setItem("order-data", JSON.stringify(orderData)); // Is this needed?
      } catch (error) {
        console.error("Error:", error);
        alert("สั่งซื้อไม่สำเร็จ");
      }
    },
    clearcart() {
      this.item = [];
      this.saveToStorage();
    }
  }
});