import { defineStore } from 'pinia';

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc , getDoc } from 'firebase/firestore';
import { auth,db } from '@/firebase';

const provider = new GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export const useAccountStore = defineStore('user-account', {
  state: () => ({
    isLoggedIn: false,
    isAdmin: false,
    role:null,
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
    async signInWithGoogle() {
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        this.isLoggedIn = true;
      } catch (error) {
        console.log('error', error.code);
        throw new Error('Login invalid');
      }
    },
    async signIn(email, password) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      this.user = result.user;
      this.isLoggedIn = true;

      const userRef = doc(db, 'User', result.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        this.role = null
        throw new Error('ไม่พบข้อมูลผู้ใช้ใน Firestore');
      }

      const data = snap.data()

      if (!data.role) {
        this.role = null
        throw new Error('ไม่พบ role ของผู้ใช้');
      }
      //console.log('LOGIN UID:', result.user.uid);
      //console.log('LOGIN EMAIL:', result.user.email);


      this.role = data.role; // admin | restaurant
      return this.role;
    },
    async logout() {
      await signOut(auth);
      this.user = null;
      this.isLoggedIn = false;
      this.role = null;
    },
  },
});
