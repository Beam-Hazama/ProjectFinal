import { defineStore } from 'pinia';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useOrderlistStore } from '../orderlistStore';
import { useMenuStore } from '../menuStore';

export const useAccountStore = defineStore('user-account', {

  state: () => ({
    isLoggedIn: false,
    role: null,
    user: null,
    isLoading: false,
    errorMessage: '',
  }),

  actions: {
    
    async checkAuthState() {
      const savedUser = sessionStorage.getItem('user-session');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          this.user = userData;
          this.isLoggedIn = true;
          this.role = userData.Role;
          return true;
        } catch (e) {
          console.error("Failed to parse session data", e);
          sessionStorage.removeItem('user-session');
        }
      }
      return false;
    },

    
    async login(username, password) {
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
          router.push({ name: 'Admin' });
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

      this.user = null;
      this.isLoggedIn = false;
      this.role = null;

      sessionStorage.removeItem('user-session');
    },

    forgotPassword() {
      return 'หากลืมรหัสผ่าน โปรดติดต่อผู้ดูแลระบบ';
    },
  },
});
