import { defineStore } from 'pinia';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '@/firebase';
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
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();
          if (firebaseUser) {
            try {
              const userDocRef = doc(db, 'User', firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                this.user = { uid: firebaseUser.uid, ...userData };
                this.role = userData.Role;
                this.isLoggedIn = true;
                resolve(true);
                return;
              }
            } catch (e) {
              console.error("Auth state verify error:", e);
            }
          }
          this.logout();
          resolve(false);
        });
      });
    },

    
    async login(username, password) {
      try {
        // 1. Authenticate with Firebase Auth first to get permission to read the User doc
        const email = `${username.toLowerCase().trim()}@system.local`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Fetch the user document by UID (authorized by request.auth.uid == userId rule)
        const userDocRef = doc(db, 'User', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await signOut(auth);
          throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ');
        }

        const userData = userDocSnap.data();

        if (userData.Status === 'blocked') {
          await signOut(auth);
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        }

        const userInfo = { uid: uid, ...userData };
        this.user = userInfo;
        this.isLoggedIn = true;
        this.role = userData.Role;

        sessionStorage.setItem('user-session', JSON.stringify(userInfo));

        return this.role;
      } catch (error) {
        console.error("Store Login Error:", error.code, error.message);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          throw new Error('Username หรือ Password ไม่ถูกต้อง');
        }
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

      try {
        await signOut(auth);
      } catch (e) {
        console.error("SignOut error:", e);
      }

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
