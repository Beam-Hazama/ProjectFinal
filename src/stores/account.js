import { defineStore } from 'pinia';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase'; // นำเข้า db จาก firebase.js

export const useAccountStore = defineStore('user-account', {
  state: () => ({
    isLoggedIn: false,
    role: null,
    user: null, // เก็บข้อมูลผู้ใช้ที่พบจาก Firestore
  }),
  actions: {
    // ปรับปรุงฟังก์ชันตรวจสอบสถานะให้ดึงจาก Session/LocalStorage แทน Firebase Auth
    async checkAuthState() {
      const savedUser = localStorage.getItem('user-session');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        this.user = userData;
        this.isLoggedIn = true;
        this.role = userData.role;
        return true;
      }
      return false;
    },

    // ล็อกอินด้วยการค้นหาใน Firestore ตรงๆ
    async signIn(username, password) {
      try {
        // 1. ค้นหาเอกสารในคอลเลกชัน 'User' ที่มีฟิลด์ username ตรงกับที่ระบุ
        const userQuery = query(
          collection(db, 'User'), 
          where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบ Username นี้ในระบบ');
        }

        // 2. ตรวจสอบรหัสผ่าน (เปรียบเทียบค่าตรงๆ)
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== password) {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        // 3. ตั้งค่าข้อมูลลง Store และบันทึกลง LocalStorage เพื่อจำการ Login
        const userInfo = { uid: userDoc.id, ...userData };
        this.user = userInfo;
        this.isLoggedIn = true;
        this.role = userData.role;

        localStorage.setItem('user-session', JSON.stringify(userInfo));

        return this.role;
      } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
      }
    },

    async logout() {
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
      localStorage.removeItem('user-session');
    },
  },
});