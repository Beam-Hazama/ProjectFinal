import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const useUserAdminStore = defineStore('userAdmin', {
  actions: {
    async fetchByUsername(username) {
      if (!username) return null;
      try {
        const q = query(collection(db, 'User'), where('Username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data();
        }
        return null;
      } catch (error) {
        console.error("Error fetching user by username:", error);
        return null;
      }
    }
  }
});
