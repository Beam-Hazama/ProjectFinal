import { defineStore } from "pinia";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  query,
  where,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { uploadImage } from "@/utils/upload";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    list: [],
    unsubscribe: null,

    // UI State for Admin Category Management
    showModal: false,
    newCategoryName: "",
    newCategoryImageUrl: "",
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

      const categoryRef = collection(db, "Category");
      let q;

      if (restaurantName) {
        q = query(categoryRef, where("Restaurant", "==", restaurantName));
      } else {
        q = query(categoryRef);
      }

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let newList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Name: data.Name,
            Restaurant: data.Restaurant,
            ImageUrl: data.ImageUrl,
            CreatedAt: data.CreatedAt,
            Position: data.Position,
          };
        });

        newList.sort((a, b) => {
          const aPos = typeof a.Position === "number" ? a.Position : Infinity;
          const bPos = typeof b.Position === "number" ? b.Position : Infinity;

          if (aPos !== Infinity && bPos !== Infinity) {
            return aPos - bPos;
          }
          if (aPos !== Infinity) return -1;
          if (bPos !== Infinity) return 1;

          const timeA = a.CreatedAt?.seconds || 0;
          const timeB = b.CreatedAt?.seconds || 0;
          return timeB - timeA;
        });

        this.list = newList;
      });
    },
    async fetchCategories(restaurantName = null) {
      const categoryRef = collection(db, "Category");
      let q;

      if (restaurantName) {
        q = query(categoryRef, where("Restaurant", "==", restaurantName));
      } else {
        q = query(categoryRef);
      }

      const snapshot = await getDocs(q);
      let newList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          Name: data.Name,
          Restaurant: data.Restaurant,
          ImageUrl: data.ImageUrl,
          CreatedAt: data.CreatedAt,
          Position: data.Position,
        };
      });

      newList.sort((a, b) => {
        const aPos = typeof a.Position === "number" ? a.Position : Infinity;
        const bPos = typeof b.Position === "number" ? b.Position : Infinity;

        if (aPos !== Infinity && bPos !== Infinity) {
          return aPos - bPos;
        }
        if (aPos !== Infinity) return -1;
        if (bPos !== Infinity) return 1;

        const timeA = a.CreatedAt?.seconds || 0;
        const timeB = b.CreatedAt?.seconds || 0;
        return timeB - timeA;
      });

      this.list = newList;
    },

    // UI Actions
    onImageSelected(file) {
      if (
        this.newCategoryImageUrl &&
        this.newCategoryImageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(this.newCategoryImageUrl);
      }
      this.selectedFile = file;
      if (this.selectedFile) {
        const previewUrl = URL.createObjectURL(this.selectedFile);
        this.newCategoryImageUrl = previewUrl;
      }
    },

    closeModal() {
      if (
        this.newCategoryImageUrl &&
        this.newCategoryImageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(this.newCategoryImageUrl);
      }
      this.showModal = false;
      this.newCategoryName = "";
      this.newCategoryImageUrl = "";
      this.selectedFile = null;
      this.isSubmitting = false;
    },

    async addCategory() {
      if (!this.newCategoryName.trim()) {
        return;
      }

      try {
        this.isSubmitting = true;
        let ImageUrl = "";

        const newUrl = await uploadImage(this.selectedFile, "categories");
        if (newUrl) ImageUrl = newUrl;

        if (!ImageUrl) {
          this.isSubmitting = false;
          return;
        }

        await addDoc(collection(db, "Category"), {
          Name: this.newCategoryName.trim(),
          ImageUrl: ImageUrl,
          Position: this.list.length,
          CreatedAt: serverTimestamp(),
        });

        this.closeModal();
      } catch (error) {
        console.error("Error adding category:", error);
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteCategory(categoryId) {
      try {
        await deleteDoc(doc(db, "Category", categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },

    async updateCategoryPosition(orderedIds) {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const ref = doc(db, "Category", id);
        batch.update(ref, { Position: index });
      });
      await batch.commit();
    },
  },
});
