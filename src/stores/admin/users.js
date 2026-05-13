import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

export const useUserListStore = defineStore('userList', {
  state: () => ({
    users: [],
    restaurants: [],
    isLoading: false
  }),

  actions: {
    async fetchUsers() {
      try {
        const q = query(
          collection(db, 'User'),
          where('Role', '==', 'restaurant')
        );
        const querySnapshot = await getDocs(q);
        this.users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    async fetchRestaurants() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Restaurant'));
        this.restaurants = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    },

    async fetchAll() {
      this.isLoading = true;
      await Promise.all([this.fetchUsers(), this.fetchRestaurants()]);
      this.isLoading = false;
    },

    async toggleStatus(user) {
      const currentStatus = user.Status;
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      try {
        const userRef = doc(db, 'User', user.id);
        await updateDoc(userRef, {
          Status: newStatus,
          UpdatedAt: serverTimestamp()
        });
        await this.fetchUsers();
      } catch (error) {
        console.error("Error updating status:", error);
        throw error;
      }
    },

    async delete(id) {
      try {
        await deleteDoc(doc(db, 'User', id));
        await this.fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    }
  }
});
