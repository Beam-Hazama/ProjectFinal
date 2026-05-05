import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

export const useUserListStore = defineStore('userList', () => {
  const users = ref([]);
  const restaurants = ref([]);
  const isLoading = ref(false);

  const fetchUsers = async () => {
    try {
      const q = query(
        collection(db, 'User'),
        where('Role', '==', 'restaurant')
      );
      const querySnapshot = await getDocs(q);
      users.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Restaurant'));
      restaurants.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const loadAll = async () => {
    isLoading.value = true;
    await Promise.all([fetchUsers(), fetchRestaurants()]);
    isLoading.value = false;
  };

  const toggleStatus = async (user) => {
    const currentStatus = user.Status || 'active';
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const userRef = doc(db, 'User', user.id);
      await updateDoc(userRef, {
        Status: newStatus,
        UpdatedAt: serverTimestamp()
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, 'User', id));
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return {
    users,
    restaurants,
    isLoading,
    loadAll,
    toggleStatus,
    delete: deleteUser
  };
});
