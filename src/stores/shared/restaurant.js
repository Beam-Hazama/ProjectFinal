import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  onSnapshot, 
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/firebase';
import { checkShopClosed } from '@/utils/shopStatus';

export const useRestaurant = defineStore('Restaurant', {

  state: () => ({
    list: [],
    unsubscribe: null,
    isLoading: true
  }),
  
  getters: {
    // เช็คว่าร้านชื่อนี้กำลังปิดอยู่หรือไม่ (ใช้ทั้ง ManualStatus + เวลาเปิด-ปิด)
    isShopClosedByName: (state) => (name, now) => {
      const shop = state.list.find(r => r.Name === name);
      return checkShopClosed(shop, now);
    }
  },

  actions: {
    // โหลดร้านอาหารทั้งหมด (real-time listener)
    async loadListRestaurant() {
      this.clearListener();
      this.isLoading = true;
      this.unsubscribe = onSnapshot(
        collection(db, 'Restaurant'),
        (snapshot) => {
          this.list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          this.isLoading = false;
        },
        (error) => {
          console.error("Error loading restaurants:", error);
          this.isLoading = false;
        }
      );
    },

    clearListener() {
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.list = [];
    },

    // ดึงข้อมูลร้านอาหารตามชื่อ (one-time fetch สำหรับหน้า detail)
    async fetchByName(name) {
      try {
        const q = query(collection(db, "Restaurant"), where("Name", "==", name));
        const snap = await getDocs(q);
        return snap.empty ? null : snap.docs[0].data();
      } catch (error) {
        console.error("Error fetching restaurant by name:", error);
        return null;
      }
    },

    async deleteById(id) {
      try {
        await deleteDoc(doc(db, 'Restaurant', id));
        await this.loadListRestaurant();
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        throw error;
      }
    }
  },
});

