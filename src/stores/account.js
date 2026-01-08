import { defineStore } from 'pinia';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export const useAccountStore = defineStore('user-account', {
  state: () => ({
    isLoggedIn: false,
    role: null,
    user: {},
  }),
  actions: {
    async checkAuthState() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            this.user = null;
            this.isLoggedIn = false;
            this.role = null;
            return resolve(false);
          }
          this.user = user;
          this.isLoggedIn = true;
          const snap = await getDoc(doc(db, 'User', user.uid));
          this.role = snap.exists() ? snap.data().role : null;
          resolve(true);
        });
      });
    },

    // ล็อกอินด้วย Username
    async signIn(username, password) {
      try {
        // 1. ค้นหา Email จาก Username ใน Firestore
        const userQuery = query(
          collection(db, 'User'), 
          where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบ Username นี้ในระบบ');
        }

        const userData = querySnapshot.docs[0].data();
        const email = userData.email; // นี่คือ Email ปลอมที่เราสร้างไว้ตอน Add User

        // 2. ใช้ Email ล็อกอินเบื้องหลัง
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        this.user = result.user;
        this.isLoggedIn = true;
        this.role = userData.role;

        return this.role;
      } catch (error) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }
        throw error;
      }
    },

    async logout() {
      await signOut(auth);
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
    },
  },
});