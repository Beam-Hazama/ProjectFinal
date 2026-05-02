import { defineStore } from 'pinia';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { storage, db } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const usePosterStore = defineStore('poster', {

  state: () => ({
    list: [],
    unsubscribe: null,

    // UI State for Admin Poster Management
    showModal: false,
    isEditing: false,
    editingPosterId: null,
    newPosterUrl: '',
    selectedFile: null,
    hasSchedule: false,
    startTime: '',
    endTime: '',
    displayDuration: 5,
    isSubmitting: false,
  }),

  getters: {
    activePosters: (state) => state.list.filter(p => {
      if (!p.isActive) return false;
      if (p.hasSchedule && p.startTime && p.endTime) {
        const now = new Date();
        const start = new Date(p.startTime);
        const end = new Date(p.endTime);
        if (now < start || now > end) {
          return false;
        }
      }
      return true;
    })
  },

  actions: {
    clearListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.list = [];
    },

    async loadPosters(restaurantName = null) {
      this.clearListener();
      const posterRef = collection(db, 'posters');
      let q;
      if (restaurantName) {
        q = query(posterRef, where('RestaurantName', '==', decodeURIComponent(restaurantName)));
      } else {
        q = query(posterRef, orderBy('createdAt', 'desc'));
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!restaurantName) {
          docs = docs.filter(item => !item.RestaurantName);
        }

        docs.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            if (a.order !== b.order) return a.order - b.order;
          } else if (a.order !== undefined) {
            return -1;
          } else if (b.order !== undefined) {
            return 1;
          }
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return timeB - timeA;
        });
        this.list = docs;
      });
    },

    // UI Actions
    handleFileUpload(file) {
      this.selectedFile = file;
      if (this.selectedFile) {
        const previewUrl = URL.createObjectURL(this.selectedFile);
        this.newPosterUrl = previewUrl;
      }
    },

    openEditModal(poster) {
      this.isEditing = true;
      this.editingPosterId = poster.id;
      this.newPosterUrl = poster.ImageUrl;
      this.displayDuration = poster.displayDuration || 5;
      this.hasSchedule = !!poster.hasSchedule;
      this.startTime = poster.startTime || '';
      this.endTime = poster.endTime || '';
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.editingPosterId = null;
      this.newPosterUrl = '';
      this.hasSchedule = false;
      this.startTime = '';
      this.endTime = '';
      this.displayDuration = 5;
      this.selectedFile = null;
      this.isSubmitting = false;
    },

    async savePoster() {
      try {
        this.isSubmitting = true;
        let ImageUrl = this.newPosterUrl || '';

        if (this.selectedFile) {
          try {
            const fileName = `posters/admin_${Date.now()}`;
            const fileRef = storageRef(storage, fileName);
            const snapshot = await uploadBytes(fileRef, this.selectedFile);
            ImageUrl = await getDownloadURL(snapshot.ref);
          } catch (uploadError) {
            console.error('Error uploading poster image:', uploadError);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            this.isSubmitting = false;
            return;
          }
        }

        if (!ImageUrl) {
          alert('Please select a poster image file');
          this.isSubmitting = false;
          return;
        }

        if (this.hasSchedule && (!this.startTime || !this.endTime)) {
          alert('Please select both start and end times for the schedule.');
          this.isSubmitting = false;
          return;
        }

        const posterData = {
          ImageUrl: ImageUrl,
          hasSchedule: this.hasSchedule,
          displayDuration: this.displayDuration || 5
        };

        if (this.hasSchedule) {
          posterData.startTime = this.startTime;
          posterData.endTime = this.endTime;
        } else {
          posterData.startTime = null;
          posterData.endTime = null;
        }

        if (this.isEditing && this.editingPosterId) {
          const posterRef = doc(db, 'posters', this.editingPosterId);
          await setDoc(posterRef, {
            ...posterData,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          await addDoc(collection(db, 'posters'), {
            ...posterData,
            order: this.list.length,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true
          });
        }

        this.closeModal();
      } catch (error) {
        alert('Error saving poster: ' + error.message);
      } finally {
        this.isSubmitting = false;
      }
    },

    async deletePoster(posterId) {
      if (confirm('Are you sure you want to delete this poster? This cannot be undone.')) {
        try {
          await deleteDoc(doc(db, 'posters', posterId));
        } catch (error) {
          alert('Error deleting poster: ' + error.message);
        }
      }
    },

    async toggleActive(posterId, currentStatus) {
      try {
        const posterRef = doc(db, 'posters', posterId);
        await setDoc(posterRef, { 
          isActive: !currentStatus,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        alert('Error updating status: ' + error.message);
      }
    },

    async updatePosterOrder(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'posters', id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    }
  },
});
