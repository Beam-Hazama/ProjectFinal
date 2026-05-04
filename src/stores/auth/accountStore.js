import { defineStore } from 'pinia';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useOrderlistStore } from '../orderlistStore';
import { useMenuStore } from '../menuStore';

export const useAccountStore = defineStore('user-account', {

  state: () => ({
    isLoggedIn: false,
    isAuthChecked: false,
    role: null,
    user: null,
    isLoading: false,
    errorMessage: '',
  }),

  actions: {
    
    async checkAuthState() {
      if (this.isAuthChecked && this.isLoggedIn && this.user) {
        return true;
      }

      const savedUid = sessionStorage.getItem('userId');
      if (savedUid) {
        try {
          const userDocRef = doc(db, 'User', savedUid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.Status !== 'blocked') {
              this.user = { uid: savedUid, ...userData };
              this.role = userData.Role;
              this.isLoggedIn = true;
              this.isAuthChecked = true;
              return true;
            }
          }
        } catch (e) {
          console.error("Auth state verify error:", e);
        }
      }
      
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
      this.isAuthChecked = true;
      sessionStorage.removeItem('userId');
      return false;
    },

    
    async login(username, password) {
      try {
        const usersRef = collection(db, 'User');
        const q = query(usersRef, where('Username', '==', username.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ');
        }

        let matchedUser = null;
        querySnapshot.forEach((doc) => {
          if (doc.data().Password === password) {
            matchedUser = { uid: doc.id, ...doc.data() };
          }
        });

        if (!matchedUser) {
           throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        if (matchedUser.Status === 'blocked') {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        this.user = matchedUser;
        this.isLoggedIn = true;
        this.role = matchedUser.Role;
        
        sessionStorage.setItem('userId', matchedUser.uid);

        return this.role;
      } catch (error) {
        console.error("Store Login Error:", error.message);
        throw error;
      }
    },

    async processLogin(username, password, router) {
      if (this.isLoading) return;
      try {
        this.isLoading = true;
        this.errorMessage = '';
        const role = await this.login(username, password);

        if (role === 'admin') {
          router.replace({ name: 'Admin' });
        } else {
          router.replace({ name: 'Restaurants' });
        }
      } catch (error) {
        console.error('Login Error:', error.message);
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    
    async logout() {
      const orderStore = useOrderlistStore();
      const menuStore = useMenuStore();

      orderStore.clearListener();
      menuStore.clearListener();

      sessionStorage.removeItem('userId');
      
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
    },

    forgotPassword() {
      return 'หากลืมรหัสผ่าน โปรดติดต่อผู้ดูแลระบบ';
    },
  },
});
