import { defineStore } from 'pinia';
import { db } from '@/firebase'; // อ้างอิงจาก src/firebase.js
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
    // ดึงข้อมูลแบบ Real-time และเรียงลำดับตามวันที่สร้างล่าสุด
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
    // เพิ่มข้อมูลห้องใหม่ลง Firestore
    async addRoom(roomData) {
      await addDoc(collection(db, 'QRCodes'), {
        ...roomData,
        createdAt: serverTimestamp() // ใช้เวลาจาก Server เพื่อความแม่นยำ
      });
    },
    // แก้ไขข้อมูลห้อง
    async updateRoom(roomId, roomData) {
      const roomRef = doc(db, 'QRCodes', roomId);
      await updateDoc(roomRef, roomData);
    },
    // ลบข้อมูลห้อง
    async deleteRoom(roomId) {
      await deleteDoc(doc(db, 'QRCodes', roomId));
    }
  }
});