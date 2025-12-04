import { defineStore } from 'pinia';

import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc,} from 'firebase/firestore';

import { db } from '@/firebase';

export const useRestaurant = defineStore('Restaurant', {
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
    async loadRestaurant() {
      console.log('loadProducts RUN');

      const Restaurant = collection(db, 'Restaurant');
      onSnapshot(Restaurant, (RestaurantSnapshot) => {
        console.log('Docs:', RestaurantSnapshot.size);
        this.list = RestaurantSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('LIST:', this.list);
      });
    },
    /*async productUpdate(productId, productData) {
      const product = {
        ...productData,
        updatedAt: new Date(),
      };
      const thisProduct = doc(db, 'Restaurant', productId);
      await setDoc(thisProduct, product);
    },
    category(selectRole) {
      return this.list.filter((product) => product.role.includes(selectRole));
    },
    async addProduct(productData) {
      await addDoc(collection(db, 'Restaurant'), {
        ...productData,
      });
    },*/
  },
});
