import { defineStore } from "pinia";
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
    tableId: null,
  }),
  getters: {
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
    addToCart(productdata) {
      const index = this.item.findIndex((item) => item.Name === productdata.Name);
      if (productdata.Remainquantity > 0) {
        if (index < 0) {
          this.item.push({ ...productdata, Quantity: 1 });
        } else if (this.item[index].Quantity < productdata.Remainquantity) {
          this.item[index].Quantity++;
        }
      }
      this.saveToStorage();
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