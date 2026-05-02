import { defineStore } from 'pinia';
import { db } from '@/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { nextTick } from 'vue';

export const useQrcodeStore = defineStore('qrcodeStore', {
  state: () => ({
    rooms: [],
    // UI State for Admin QRCode page
    isModalOpen: false,
    selectedRoom: null,
    roomForm: { roomNumber: '', floor: '', building: '' },
    baseUrl: 'https://192.168.1.40:5173'
  }),

  actions: {
    
    fetchRooms() {
      const roomCol = collection(db, 'QRCodes');
      const q = query(roomCol, orderBy('createdAt', 'desc'));

      onSnapshot(q, (snapshot) => {
        this.rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    },

    
    openAddModal() {
      this.roomForm = { roomNumber: '', floor: '', building: '' };
      this.isModalOpen = true;
    },

    async saveRoom() {
      if (!this.roomForm.roomNumber || !this.roomForm.building || !this.roomForm.floor) {
        alert('กรุณากรอกข้อมูล ตึก ชั้น และเลขห้อง ให้ครบถ้วนเพื่อให้ระบบแสดงผลได้ถูกต้อง');
        return;
      }

      try {
        await addDoc(collection(db, 'QRCodes'), {
          ...this.roomForm,
          createdAt: serverTimestamp()
        });
        this.isModalOpen = false;
      } catch (error) {
        console.error("Save error:", error);
      }
    },

    async deleteRoom(roomId) {
      if (confirm('ยืนยันการลบข้อมูลห้องนี้หรือไม่?')) {
        try {
          await deleteDoc(doc(db, 'QRCodes', roomId));
        } catch (error) {
          console.error("Delete error:", error);
        }
      }
    },

    async printSpecificQR(room) {
      this.selectedRoom = room;
      await nextTick();
      window.print();
    },

    
    async validateRoom(building, floor, roomNumber) {
      const roomCol = collection(db, 'QRCodes');
      const q = query(
        roomCol,
        where('building', '==', building),
        where('floor', '==', floor),
        where('roomNumber', '==', roomNumber)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    }
  }
});
