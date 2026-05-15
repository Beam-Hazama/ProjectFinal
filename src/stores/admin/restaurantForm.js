import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { uploadImage } from "@/utils/upload";
import { getShopAutoStatus } from "@/utils/shopStatus";

const ALL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_RESTAURANT = {
  RestaurantName: "",
  Phone: "",
  Distance: "",
  Address: "",
  ImageUrl: "",
  BgUrl: "",
  OpenTime: "",
  CloseTime: "",
  OpenDays: [...ALL_DAYS],
  Status: "open",
};

export const useRestaurantFormStore = defineStore("restaurantForm", {
  state: () => ({
    isLoading: false,
    selectedFile: null,
    imagePreview: "",
    selectedBgFile: null,
    bgImagePreview: "",
    restaurantData: { ...DEFAULT_RESTAURANT, OpenDays: [...ALL_DAYS] },
  }),

  actions: {
    resetForm() {
      this.restaurantData = { ...DEFAULT_RESTAURANT, OpenDays: [...ALL_DAYS] };
      this.selectedFile = null;
      this.imagePreview = "";
      this.selectedBgFile = null;
      this.bgImagePreview = "";
    },

    async save(router) {
      try {
        this.isLoading = true;

        // ตรวจสอบชื่อร้านซ้ำ
        const q = query(
          collection(db, "Restaurant"),
          where(
            "RestaurantName",
            "==",
            this.restaurantData.RestaurantName.trim(),
          ),
        );
        const checkSnap = await getDocs(q);
        if (!checkSnap.empty) {
          alert("ชื่อร้านอาหารนี้ถูกใช้งานไปแล้ว กรุณาใช้ชื่ออื่น");
          return false;
        }

        let ImageUrl = this.restaurantData.ImageUrl;
        let BgUrl = this.restaurantData.BgUrl;

        if (this.selectedFile) {
          const newUrl = await uploadImage(this.selectedFile, "restaurants");
          if (newUrl) {
            ImageUrl = newUrl;
          }
        }

        if (this.selectedBgFile) {
          const newBgUrl = await uploadImage(
            this.selectedBgFile,
            "restaurants",
          );
          if (newBgUrl) {
            BgUrl = newBgUrl;
          }
        }

        const Status = this.restaurantData.Status;

        await addDoc(collection(db, "Restaurant"), {
          ...this.restaurantData,
          ImageUrl,
          BgUrl,
          Status,
          CreatedAt: serverTimestamp(),
          UpdatedAt: serverTimestamp(),
        });

        this.resetForm();
        if (router) {
          router.push("/Admin/Restaurantlist");
        }
        return true;
      } catch (error) {
        console.error("Error saving restaurant:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
