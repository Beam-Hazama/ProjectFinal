import { defineStore } from 'pinia';

import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, query, where, deleteField } from 'firebase/firestore';

import { db } from '@/firebase';

export const useMenuStore = defineStore('product', {
  state: () => ({
    list: [],
    unsubscribe: null,
  }),
  actions: {
    
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

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
      this.clearListener();
      console.log('loadProducts RUN');

      const productList = collection(db, 'Menu');
      this.unsubscribe = onSnapshot(productList, (productSnapshot) => {
        console.log('Docs:', productSnapshot.size);
        this.list = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('LIST:', this.list);
      });
    },
    async productUpdate(productId, productData) {
      console.log('Update Product:', productId, productData);
      const product = {
        ...productData,
        UpdatedAt: serverTimestamp(),
        status: deleteField(),
        updatedAt: deleteField()
      };
      const thisProduct = doc(db, 'Menu', productId);
      await setDoc(thisProduct, product, { merge: true });
    },
    category(selectRole) {
      return this.list.filter((product) => product.role.includes(selectRole));
    },
    async addProduct(productData) {
      await addDoc(collection(db, 'Menu'), {
        ...productData,
        UpdatedAt: serverTimestamp(),
      });
    },
    async loadMenuRestaurant(RestaurantName) {
      this.clearListener();
      const MenuList = query(
        collection(db, 'Menu'),
        where('Restaurant', '==', RestaurantName)
      );
      this.unsubscribe = onSnapshot(MenuList, (menuSnapshot) => {
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
