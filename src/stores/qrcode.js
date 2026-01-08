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
  orderBy
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
    }
  }
});