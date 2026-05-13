import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadImage } from "@/utils/upload";

const DEFAULT_USER = {
  Firstname: "",
  Lastname: "",
  Username: "",
  Password: "",
  Email: "",
  Phone: "",
  Address: "",
  Status: "active",
  Role: "restaurant",
  ImageUrl: "",
  Restaurant: "",
  Age: "",
};

export const useUserFormStore = defineStore("userForm", {
  state: () => ({
    isLoading: false,
    restaurants: [],
    selectedFile: null,
    userData: { ...DEFAULT_USER },
  }),

  actions: {
    resetForm() {
      this.userData = { ...DEFAULT_USER };
      this.selectedFile = null;
    },

    async loadRestaurants() {
      try {
        const snap = await getDocs(collection(db, "Restaurant"));
        this.restaurants = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    },

    async isUsernameTaken(username) {
      const q = query(
        collection(db, "User"),
        where("Username", "==", username),
      );
      const snap = await getDocs(q);
      return !snap.empty;
    },

    async save(router) {
      try {
        this.isLoading = true;

        const taken = await this.isUsernameTaken(this.userData.Username.trim());
        if (taken) {
          alert("Username นี้ถูกใช้งานไปแล้ว");
          return false;
        }

        let finalImageUrl = this.userData.ImageUrl;
        if (this.selectedFile) {
          const newUrl = await uploadImage(this.selectedFile, "users");
          if (newUrl) {
            finalImageUrl = newUrl;
          }
        }

        await addDoc(collection(db, "User"), {
          ...this.userData,
          Username: this.userData.Username.trim(),
          ImageUrl: finalImageUrl || "",
          CreatedAt: serverTimestamp(),
          UpdatedAt: serverTimestamp(),
        });

        this.resetForm();
        if (router) router.push("/Admin/Restaurantuser");
        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
