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
    isModalOpen: false,
    selectedRoom: null,
    roomForm: { Roomnumber: '' },
    baseUrl: import.meta.env.VITE_QR_BASE_URL || window.location.origin,
    unsubscribe: null
  }),

  actions: {
    
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.rooms = [];
    },

    loadRooms() {
      this.clearListener();
      const roomCol = collection(db, 'Qrcode');
      const q = query(roomCol, orderBy('CreatedAt', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    },

    
    openAddModal() {
      this.roomForm = { Roomnumber: '' };
      this.isModalOpen = true;
    },

    async addRoom() {
      if (!this.roomForm.Roomnumber) {
        alert('กรุณากรอกเลขห้อง');
        return;
      }

      try {
        await addDoc(collection(db, 'Qrcode'), {
          ...this.roomForm,
          CreatedAt: serverTimestamp()
        });
        this.isModalOpen = false;
      } catch (error) {
        console.error("Save error:", error);
      }
    },

    async deleteRoom(roomId) {
      try {
        await deleteDoc(doc(db, 'Qrcode', roomId));
      } catch (error) {
        console.error("Delete error:", error);
      }
    },

    async printRoomQR(room) {
      this.selectedRoom = room;
      await nextTick();
      window.print();
    },

    
    async validateRoom(roomNumber) {
      const roomCol = collection(db, 'Qrcode');
      const q = query(
        roomCol,
        where('Roomnumber', '==', roomNumber)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    }
  }
});
