import { defineStore } from 'pinia';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export const useOderlistStore = defineStore('oderlist', {
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
    async addToOrderList(orderData) {
      const { Menu, ...orderref } = orderData;
      
      // เพิ่มสถานะ itemStatus: 'pending' ให้กับแต่ละรายการอาหาร
      const cleanedMenu = Menu.map((item) => {
        const { Status, Remainquantity, ImageUrl, ...filtered } = item;
        return {
          ...filtered,
          itemStatus: 'pending' // สถานะเริ่มต้นสำหรับแต่ละเมนู
        };
      });

      const finalOrder = {
        ...orderref,
        Menu: cleanedMenu,
      };

      // บันทึกลง Firestore
      await addDoc(collection(db, 'Order'), {
        ...finalOrder,
        statusOrder: 'pending', // สถานะภาพรวมของออเดอร์
        CreatedAt: serverTimestamp(),
      });
    },
    async loadOrder() {
      const orderList = query(
        collection(db, 'Order'),
        where('statusOrder', '==', 'pending')
      );
      onSnapshot(orderList, (orderSnapshot) => {
        const order = orderSnapshot.docs.map((doc) => {
          const convertedData = doc.data();
          convertedData.id = doc.id;
          return convertedData;
        });
        this.list = order;
      });
    },
    async loadOrderinadmin() {
      const orderList = collection(db, 'Order');
      onSnapshot(orderList, (orderSnapshot) => {
        const order = orderSnapshot.docs.map((doc) => {
          const convertedData = doc.data();
          convertedData.id = doc.id;
          return convertedData;
        });
        this.list = order;
      });
    },
  },
});