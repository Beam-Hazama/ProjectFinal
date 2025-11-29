import { defineStore } from 'pinia';

import { collection,addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export const useOderlistStore = defineStore('oderlist', {
  state: () => ({
    list: [],
  }),
  getters:{
    sortedOrders:(state)=>{
        return [...state.list].sort((a,b)=> {
            if(!a.createdAt || !b.createdAt)return 0
            return a.createdAt.seconds - b.createdAt.seconds
    })}
  },
  actions: {
    async addToOrderList(orderData) {
      const {userImageUrl,...orderref} = orderData
      const productData = orderData.products.map(product =>{
        const {status,remainQuantity,updatedAt,imageUrl,...productref} = product;
        return productref
      })
      const finalOrder = {
        ...orderref,
        products:productData
      }
      await addDoc(collection(db,'Order'),{
        ...finalOrder,
        statusOrder:'pending',
        createdAt:serverTimestamp()
      }) 
      console.log('orderlist', this.list);
    },
    async loadOrder(){
      const orderList = query(collection(db,'Order'),where('statusOrder','==','pending'))
      onSnapshot(orderList,(orderSnapshot)=>{
        const order = orderSnapshot.docs.map(doc=>{
          const convertedData = doc.data()
          convertedData.id = doc.id
          return convertedData
      })
      this.list = order
     })
    },
  },
});
