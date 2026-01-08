import { defineStore } from 'pinia';

import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, query, where, } from 'firebase/firestore';

import { db } from '@/firebase';

export const useMenuStore = defineStore('product', {
  state: () => ({
    list: [],
    
  }),
  actions: {
    /*async getImageUrl(productId){
      try{
        const imgRef = ref(storage,`products/${productId}.jpeg`)
        const url = await getDownloadURL(imgRef)
        this.imageList[productId] = url
      }catch(error){
        console.error('no image')
      }
      
    },*/
    async loadMenu() {
      console.log('loadProducts RUN');

      const productList = collection(db, 'Menu');
      onSnapshot(productList, (productSnapshot) => {
        console.log('Docs:', productSnapshot.size);
        this.list = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('LIST:', this.list);
      });
    },
    async productUpdate(productId, productData) {
      const product = {
        ...productData,
        updatedAt: new Date(),
      };
      const thisProduct = doc(db, 'Menu', productId);
      await setDoc(thisProduct, product);
    },
    category(selectRole) {
      return this.list.filter((product) => product.role.includes(selectRole));
    },
    async addProduct(productData) {
      await addDoc(collection(db, 'Menu'), {
        ...productData,
        updatedAt: serverTimestamp(),
      });
    },
    async loadMenuRestaurant(RestaurantName) {
      const MenuList = query(
        collection(db, 'Menu'),
        where('Restaurant', '==', RestaurantName)
      );
      onSnapshot(MenuList, (menuSnapshot) => {
        const Menu = menuSnapshot.docs.map((doc) => {
          const convertedData = doc.data();
          convertedData.id = doc.id;
          return convertedData;
        });
        this.list = Menu;
      });
    },
  },
});
