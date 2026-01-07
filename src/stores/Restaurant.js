import { defineStore } from 'pinia';

import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc,query,where,getDoc,getDocs} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db , auth} from '@/firebase';

export const useRestaurant = defineStore('Restaurant', {
  state: () => ({
    list: [],
    restaurantName: '',
    menus: [],
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
      const uid = auth.currentUser.uid;

      // ดึงข้อมูลร้าน
      const snap = await getDoc(doc(db, 'Restaurant', uid));
      if (!snap.exists()) throw new Error('ไม่พบข้อมูลร้าน');

      this.restaurant = snap.data();
    },

    async loadMenusByRestaurant() {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) return reject('ยังไม่ได้ login');

          // 1. ดึงชื่อร้านจาก User
          const userSnap = await getDoc(doc(db, 'User', user.uid));
          if (!userSnap.exists()) return reject('ไม่พบข้อมูลร้าน');

          this.restaurantName = userSnap.data().restaurant;

          // 2. ดึงเมนูตามชื่อร้าน
          const q = query(
            collection(db, 'Menu'),
            where('Restaurant', '==', this.restaurantName)
          );

          const snap = await getDocs(q);
          this.menus = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

          resolve(true);
        });
      });
    },

    async loadListRestaurant() {
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
