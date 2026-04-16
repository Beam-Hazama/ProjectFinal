import { defineStore } from 'pinia';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useOderlistStore } from './OrderList';
import { useMenuStore } from './menuStore';

/**
 * Account Store
 * Handles user authentication state, roles, and session persistence.
 */
export const useAccountStore = defineStore('user-account', {
  // --- State ---
  state: () => ({
    isLoggedIn: false,
    role: null, // 'admin' | 'restaurant'
    user: null,
  }),

  // --- Actions ---
  actions: {
    /**
     * Check if a user session exists in sessionStorage and restore state.
     */
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

    /**
     * Authenticate user with Username and Password.
     */
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

        // 1. Check account status
        if (userData.Status === 'blocked') {
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        // 2. Validate password (plain text per current design)
        if (userData.Password !== password) {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }

        // 3. Prepare user session
        const userInfo = { uid: userDoc.id, ...userData };
        this.user = userInfo;
        this.isLoggedIn = true;
        this.role = userData.Role;

        // 4. Persist to storage
        sessionStorage.setItem('user-session', JSON.stringify(userInfo));

        return this.role;
      } catch (error) {
        console.error("Store Login Error:", error.message);
        throw error;
      }
    },

    /**
     * Sign out user and clear session data and listeners.
     */
    async logout() {
      const orderStore = useOderlistStore();
      const menuStore = useMenuStore();

      // Clear Firebase listeners
      orderStore.clearListener();
      menuStore.clearListener();

      // Reset state
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;

      // Clear storage
      sessionStorage.removeItem('user-session');
    },
  },
});