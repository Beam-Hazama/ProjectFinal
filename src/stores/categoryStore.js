import { defineStore } from 'pinia';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { storage, db } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useCategoryStore = defineStore('category', {

  state: () => ({
    list: [],
    unsubscribe: null,
    
    // UI State for Admin Category Management
    showModal: false,
    newCategoryName: '',
    newCategoryImageUrl: '',
    selectedFile: null,
    isSubmitting: false,
  }),

  actions: {
    
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    
    async loadCategories(restaurantName = null) {
      this.clearListener();

      const categoryRef = collection(db, 'categories');
      let q;

      if (restaurantName) {
        q = query(categoryRef, where('RestaurantName', '==', restaurantName));
      } else {
        q = query(categoryRef);
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let newList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!restaurantName) {
          newList = newList.filter(item => !item.RestaurantName);
        }

        newList.sort((a, b) => {
          const aOrder = typeof a.order === 'number' ? a.order : Infinity;
          const bOrder = typeof b.order === 'number' ? b.order : Infinity;

          if (aOrder !== Infinity && bOrder !== Infinity) {
            return aOrder - bOrder;
          }
          if (aOrder !== Infinity) return -1;
          if (bOrder !== Infinity) return 1;
          
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        this.list = newList;
      });
    },

    // UI Actions
    onImageSelected(file) {
      if (this.newCategoryImageUrl && this.newCategoryImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.newCategoryImageUrl);
      }
      this.selectedFile = file;
      if (this.selectedFile) {
        const previewUrl = URL.createObjectURL(this.selectedFile);
        this.newCategoryImageUrl = previewUrl;
      }
    },

    closeModal() {
      if (this.newCategoryImageUrl && this.newCategoryImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.newCategoryImageUrl);
      }
      this.showModal = false;
      this.newCategoryName = '';
      this.newCategoryImageUrl = '';
      this.selectedFile = null;
      this.isSubmitting = false;
    },

    async addCategory() {
      if (!this.newCategoryName.trim()) {
        return;
      }
      
      try {
        this.isSubmitting = true;
        let ImageUrl = '';

        if (this.selectedFile) {
          try {
            const fileName = `categories/${Date.now()}_${this.selectedFile.name}`;
            const fileRef = storageRef(storage, fileName);
            const snapshot = await uploadBytes(fileRef, this.selectedFile);
            ImageUrl = await getDownloadURL(snapshot.ref);
          } catch (uploadError) {
            console.error('Error uploading category image:', uploadError);
            this.isSubmitting = false;
            return;
          }
        }

        if (!ImageUrl) {
          this.isSubmitting = false;
          return;
        }

        await addDoc(collection(db, 'categories'), {
          name: this.newCategoryName.trim(),
          ImageUrl: ImageUrl,
          order: this.list.length,
          createdAt: serverTimestamp()
        });
        
        this.closeModal();
      } catch (error) {
        console.error('Error adding category:', error);
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteCategory(categoryId) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    },

    async updateCategoryOrder(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'categories', id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    }
  },
});
