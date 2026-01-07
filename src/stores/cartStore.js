import { defineStore } from "pinia";
import { useOderlistStore } from "@/stores/OrderList";
import { db } from "@/firebase"; // ตรวจสอบว่านำเข้า db หรือยัง
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
      return state.item.reduce((acc, item) => {
        return acc + item.Price * item.Quantity;
      }, 0);
    },
  },
  actions: {
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
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });
      if (productdata.Remainquantity > 0) {
        if (fineProductIndex < 0) {
          const newItem = { ...productdata, Quantity: 1 };
          this.item.push(newItem);
        } else {
          const currentItem = this.item[fineProductIndex];
          if (currentItem.Quantity < productdata.Remainquantity) {
            this.updateQuantity(fineProductIndex, currentItem.Quantity + 1);
          }
        }
      }
      this.saveToStorage();
    },
    decreaseToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });

      if (fineProductIndex !== -1) {
        const currentItem = this.item[fineProductIndex];
        if (currentItem.Quantity > 1) {
          this.updateQuantity(fineProductIndex, currentItem.Quantity - 1);
        } else {
          this.removeItemInCart(fineProductIndex);
        }
      }
      this.saveToStorage();
    },
    updateQuantity(index, quantity) {
      this.item[index].Quantity = quantity;
      this.saveToStorage();
    },
    removeItemInCart(index) {
      this.item.splice(index, 1);
      this.saveToStorage();
    },
    
    // --- แก้ไขฟังก์ชัน placeorder ตรงนี้ ---
    async placeorder(tableId) {
      try {
        // 1. แยกข้อมูล ตึก-ชั้น-ห้อง จาก tableId (เช่น A-3-301)
        const locationParts = tableId ? tableId.split('-') : [];
        const building = locationParts[0] || '-';
        const floor = locationParts[1] || '-';
        const room = locationParts[2] || '-';

        // 2. เตรียมข้อมูลออเดอร์
        const orderData = {
          OrderNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
          tableId: tableId, // เก็บแบบรวมเดิมไว้
          building: building, // แยกตึก
          floor: floor,       // แยกชั้น
          room: room,         // แยกห้อง
          item: this.item,
          TotalPrice: this.summaryPrice,
          statusOrder: 'pending',
          CreatedAt: serverTimestamp() // ใช้เวลาจาก Server Firebase
        };

        // 3. บันทึกลง Firebase Collection 'Order'
        await addDoc(collection(db, 'Order'), orderData);
        
        // 4. บันทึกลง LocalStorage สำหรับหน้า Bill (ถ้าจำเป็น)
        localStorage.setItem("order-data", JSON.stringify(orderData));

        console.log("Order placed successfully with location:", building, floor, room);
      } catch (error) {
        console.error("Error placing order:", error);
        alert("สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    },

    clearcart() {
      this.item = [];
      this.saveToStorage();
    },
  },
});