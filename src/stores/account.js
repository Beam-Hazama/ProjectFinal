import { defineStore } from 'pinia';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase'; 
import { useOderlistStore } from './OrderList'; 
import { useMenuStore } from './menu'; 

export const useAccountStore = defineStore('user-account', {
  state: () => ({
    isLoggedIn: false,
    role: null,
    user: null, 
  }),
  actions: {
    
    async checkAuthState() {
      const savedUser = sessionStorage.getItem('user-session');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        this.user = userData;
        this.isLoggedIn = true;
        this.role = userData.Role;
        return true;
      }
      return false;
    },

   
    async signIn(username, password) {
      try {
        
        const userQuery = query(
          collection(db, 'User'), 
          where('Username', '==', username)
        );
        
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบ Username นี้ในระบบ');
        }

       
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        
        if (userData.Status === 'blocked') {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        if (userData.Password !== password) {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        
        const userInfo = { uid: userDoc.id, ...userData };
        this.user = userInfo;
        this.isLoggedIn = true;
        this.role = userData.Role;

        sessionStorage.setItem('user-session', JSON.stringify(userInfo));

        return this.role;
      } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
      }
    },

    async logout() {
      
      const orderStore = useOderlistStore();
      const menuStore = useMenuStore();
      
      orderStore.clearListener();
      menuStore.clearListener();

      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
      sessionStorage.removeItem('user-session');
    },
  },
});