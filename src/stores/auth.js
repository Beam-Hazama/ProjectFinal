import { defineStore } from 'pinia';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useOrderlistStore } from './shared/orderlist';
import { useMenuStore } from './shared/menu';

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
      const savedUid = sessionStorage.getItem('userId');
      if (!savedUid) return this.logout();

      try {
        const userDocSnap = await getDoc(doc(db, 'User', savedUid));
        if (userDocSnap.exists() && userDocSnap.data().Status !== 'blocked') {
          const userData = userDocSnap.data();
          this.user = { uid: savedUid, ...userData };
          this.role = userData.Role;
          this.isLoggedIn = true;
          this.isAuthChecked = true;
          return true;
        }
      } catch (e) {
        console.error("Auth verify error:", e);
      }

      return this.logout();
    },

    async login(username, password, router) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const q = query(collection(db, 'User'), where('Username', '==', username.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.Password !== password) {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        if (userData.Status === 'blocked') {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
        }

        // Set State
        this.user = { uid: userDoc.id, ...userData };
        this.isLoggedIn = true;
        this.role = userData.Role;
        this.isAuthChecked = true;
        
        sessionStorage.setItem('userId', userDoc.id);

        // Handle Routing
        if (router) {
          const routeName = this.role === 'admin' ? 'Admin' : 'Restaurants';
          router.replace({ name: routeName });
        }

        return this.role;
      } catch (error) {
        this.errorMessage = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      // Clear Listeners
      useOrderlistStore().clearListener();
      useMenuStore().clearListener();

      // Clear Session
      sessionStorage.removeItem('userId');
      
      // Reset State
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
      this.isAuthChecked = true;
      
      return false;
    },

    forgotPassword() {
      this.errorMessage = 'หากลืมรหัสผ่าน โปรดติดต่อผู้ดูแลระบบ';
    },
  },
});
