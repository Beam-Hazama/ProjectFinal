import { defineStore } from 'pinia';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase'; 

export const useAccountStore = defineStore('user-account', {
  state: () => ({
    isLoggedIn: false,
    role: null,
    user: null, 
  }),
  actions: {
    
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

   
    async signIn(username, password) {
      try {
        
        const userQuery = query(
          collection(db, 'User'), 
          where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบ Username นี้ในระบบ');
        }

       
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        
        if (userData.status === 'blocked') {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        if (userData.password !== password) {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        
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