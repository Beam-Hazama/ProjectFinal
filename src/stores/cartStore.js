import { defineStore } from "pinia";
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
    tableId: null,
  }),
  getters: {
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
    // โหลดตะกร้าตามเลขโต๊ะ เพื่อให้ข้อมูลหน้า User และ Cart ตรงกันเสมอ
    loadcart(tableId) {
      this.tableId = tableId;
      const storageKey = `cart-data-${tableId}`;
      const previousCart = localStorage.getItem(storageKey);
      if (previousCart) {
        this.item = JSON.parse(previousCart);
      } else {
        this.item = [];
      }
    },
    saveToStorage() {
      if (this.tableId) {
        const storageKey = `cart-data-${this.tableId}`;
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
    async placeorder(tableId) {
      try {
        // อิงการแยกเลขห้อง ชั้น ตึก จาก tableId ที่ได้รับมา
        const parts = tableId ? tableId.split('-') : [];
        const building = parts[0] || '-';
        const floor = parts[1] || '-';
        const room = parts[2] || '-';

        const orderData = {
          OrderNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
          tableId: tableId,
          building: building, // ส่งตึก
          floor: floor,       // ส่งชั้น
          room: room,         // ส่งห้อง
          item: this.item,
          TotalPrice: this.summaryPrice,
          statusOrder: 'pending',
          CreatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'Order'), orderData);
        localStorage.setItem("order-data", JSON.stringify(orderData));
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