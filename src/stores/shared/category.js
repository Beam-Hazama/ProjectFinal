import { defineStore } from "pinia";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  query,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { uploadImage } from "@/utils/upload";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    list: [],
    unsubscribe: null,

    isLoading: false,
  }),

  actions: {
    clearListener() {
      if (this.unsubscribe) {     //ถ้าไม่มีโค้ดจะเกิดError
        this.unsubscribe();
      }
      this.unsubscribe = null;
      this.list = [];
    },

    //admin เรียกข้อมูลตลอดเวลา
    async loadCategories() {
      this.clearListener();

      const categoryRef = collection(db, "Category");
      const q = query(categoryRef);

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        let newList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Category: data.Category,
            ImageUrl: data.ImageUrl,
            CreatedAt: data.CreatedAt,
            Position: data.Position,
          };
        });
        
        newList.sort((a, b) => a.Position - b.Position);
        this.list = newList;
      });
    },

    //ลูกค้า เรียกข้อมูลครั้งเดียว ประหยัดเน็ต
    async fetchCategories() {
      const categoryRef = collection(db, "Category");
      const q = query(categoryRef);

      const snapshot = await getDocs(q);
      let newList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          Category: data.Category,
          ImageUrl: data.ImageUrl,
          CreatedAt: data.CreatedAt,
          Position: data.Position,
        };
      });

      newList.sort((a, b) => a.Position - b.Position);
      this.list = newList;
    },


    async addCategory(name, file) {
      try {
        const ImageUrl = await uploadImage(file, "categories");

        await addDoc(collection(db, "Category"), {
          Category: name.trim(),
          ImageUrl: ImageUrl,
          Position: this.list.length,
          CreatedAt: serverTimestamp(),
        });

        return { success: true };
      } catch (error) {
        console.error("Error adding category:", error);
        return { success: false, error: error.message };
      }
    },

    async deleteCategory(categoryId) {
      try {
        await deleteDoc(doc(db, "Category", categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },

    async updateCategoryPosition(categoryId) {
      const batch = writeBatch(db);                      //อัพเดต position ทีเดียว
      categoryId.forEach((id, index) => {
        const ref = doc(db, "Category", id);
        batch.update(ref, { Position: index });           //กำหนดindex = position
      });
      await batch.commit();                               //commit ทีเดียว
    }, 
  },
});
