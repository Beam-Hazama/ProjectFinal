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

/**
 * QR Code Store
 * Manages the generation and validation of location-based QR codes (Building, Floor, Room).
 */
export const useQRCodeStore = defineStore('qrcode', {
  // --- State ---
  state: () => ({
    rooms: [] // List of registered locations/rooms
  }),

  // --- Actions ---
  actions: {
    /**
     * Fetch all registered rooms in real-time, sorted by creation date.
     */
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

    /**
     * Add a new location/room to the system.
     */
    async addRoom(roomData) {
      await addDoc(collection(db, 'QRCodes'), {
        ...roomData,
        createdAt: serverTimestamp()
      });
    },

    /**
     * Update details for an existing room.
     */
    async updateRoom(roomId, roomData) {
      const roomRef = doc(db, 'QRCodes', roomId);
      await updateDoc(roomRef, roomData);
    },

    /**
     * Remove a room from the system permanently.
     */
    async deleteRoom(roomId) {
      await deleteDoc(doc(db, 'QRCodes', roomId));
    },

    /**
     * Validate if a specific location (Building/Floor/Room) exists in the system. 
     * Used for routing security on the customer side.
     */
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