import { defineStore } from 'pinia';
import { db } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';

export const useQRCodeStore = defineStore('qrcode', {
  state: () => ({
    rooms: []
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

    async addRoom(roomData) {
      await addDoc(collection(db, 'QRCodes'), {
        ...roomData,
        createdAt: serverTimestamp()
      });
    },

    async updateRoom(roomId, roomData) {
      const roomRef = doc(db, 'QRCodes', roomId);
      await updateDoc(roomRef, roomData);
    },

    async deleteRoom(roomId) {
      await deleteDoc(doc(db, 'QRCodes', roomId));
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