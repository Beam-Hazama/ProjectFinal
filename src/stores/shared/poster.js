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
  writeBatch,
  getDocs
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
      if (p.IsActive === false) return false;
      
      if (p.HasSchedule && p.StartTime && p.EndTime) {
        const now = new Date();
        const start = new Date(p.StartTime);
        const end = new Date(p.EndTime);
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
      const posterRef = collection(db, 'Poster');
      let q;
      if (restaurantName) {
        q = query(posterRef, where('Restaurant', '==', decodeURIComponent(restaurantName)));
      } else {
        q = query(posterRef);
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let docs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Restaurant: data.Restaurant,
            CreatedAt: data.CreatedAt,
            UpdatedAt: data.UpdatedAt,
            IsActive: data.IsActive,
            Position: data.Position,
            HasSchedule: data.HasSchedule,
            StartTime: data.StartTime,
            EndTime: data.EndTime,
            DisplayDuration: data.DisplayDuration,
          };
        });

        if (!restaurantName) {
          docs = docs.filter(item => !item.Restaurant);
        }

        docs.sort((a, b) => {
          const aPos = typeof a.Position === "number" ? a.Position : Infinity;
          const bPos = typeof b.Position === "number" ? b.Position : Infinity;

          if (aPos !== Infinity && bPos !== Infinity) {
            if (aPos !== bPos) return aPos - bPos;
          } else if (aPos !== Infinity) {
            return -1;
          } else if (bPos !== Infinity) {
            return 1;
          }
          const timeA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : (a.CreatedAt || 0);
          const timeB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : (b.CreatedAt || 0);
          return timeB - timeA;
        });
        this.list = docs;
      });
    },
    async fetchPosters(restaurantName = null) {
      const posterRef = collection(db, 'Poster');
      let q;
      if (restaurantName) {
        q = query(posterRef, where('Restaurant', '==', decodeURIComponent(restaurantName)));
      } else {
        q = query(posterRef);
      }

      const snapshot = await getDocs(q);
      let docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          Restaurant: data.Restaurant,
          CreatedAt: data.CreatedAt,
          UpdatedAt: data.UpdatedAt,
          IsActive: data.IsActive,
          Position: data.Position,
          HasSchedule: data.HasSchedule,
          StartTime: data.StartTime,
          EndTime: data.EndTime,
          DisplayDuration: data.DisplayDuration,
        };
      });

      if (!restaurantName) {
        docs = docs.filter(item => !item.Restaurant);
      }

      docs.sort((a, b) => {
        const aPos = typeof a.Position === "number" ? a.Position : Infinity;
        const bPos = typeof b.Position === "number" ? b.Position : Infinity;

        if (aPos !== Infinity && bPos !== Infinity) {
          if (aPos !== bPos) return aPos - bPos;
        } else if (aPos !== Infinity) {
          return -1;
        } else if (bPos !== Infinity) {
          return 1;
        }
        const timeA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : (a.CreatedAt || 0);
        const timeB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : (b.CreatedAt || 0);
        return timeB - timeA;
      });
      this.list = docs;
    },

    // UI Actions
    onImageSelected(file) {
      if (this.newPosterUrl && this.newPosterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.newPosterUrl);
      }
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
      this.displayDuration = poster.DisplayDuration || 5;
      this.hasSchedule = !!poster.HasSchedule;
      this.startTime = poster.StartTime || '';
      this.endTime = poster.EndTime || '';
      this.showModal = true;
    },

    closeModal() {
      if (this.newPosterUrl && this.newPosterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.newPosterUrl);
      }
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
          HasSchedule: this.hasSchedule,
          DisplayDuration: this.displayDuration || 5
        };

        if (this.hasSchedule) {
          posterData.StartTime = this.startTime;
          posterData.EndTime = this.endTime;
        } else {
          posterData.StartTime = null;
          posterData.EndTime = null;
        }

        if (this.isEditing && this.editingPosterId) {
          const posterRef = doc(db, 'Poster', this.editingPosterId);
          await setDoc(posterRef, {
            ...posterData,
            UpdatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          await addDoc(collection(db, 'Poster'), {
            ...posterData,
            Position: this.list.length,
            CreatedAt: serverTimestamp(),
            UpdatedAt: serverTimestamp(),
            IsActive: true
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
      try {
        await deleteDoc(doc(db, 'Poster', posterId));
      } catch (error) {
        console.error('Error deleting poster:', error);
      }
    },

    async toggleActive(posterId, currentStatus) {
      try {
        const posterRef = doc(db, 'Poster', posterId);
        await setDoc(posterRef, { 
          IsActive: !currentStatus,
          UpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        alert('Error updating status: ' + error.message);
      }
    },

    async addPoster(posterData) {
      try {
        await addDoc(collection(db, 'Poster'), {
          ...posterData,
          Position: this.list.length,
          CreatedAt: serverTimestamp(),
          UpdatedAt: serverTimestamp(),
          IsActive: true
        });
      } catch (error) {
        console.error("Error adding poster:", error);
        throw error;
      }
    },

    async updatePoster(posterId, posterData) {
      try {
        const posterRef = doc(db, 'Poster', posterId);
        await setDoc(posterRef, {
          ...posterData,
          UpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Error updating poster:", error);
        throw error;
      }
    },

    async updatePosterPosition(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, 'Poster', id);
        batch.update(ref, { 
          Position: index 
        });
      });
      await batch.commit();
    }
  },
});
