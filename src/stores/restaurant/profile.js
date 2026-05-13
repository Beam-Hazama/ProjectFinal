import { defineStore } from "pinia";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAccountStore } from "@/stores/auth";
import { useRestaurant } from "@/stores/shared/restaurant";
import { uploadImage } from "@/utils/upload";
import { cleanupBlobUrl } from "@/composables/useImagePreview";
import { DAYS_OF_WEEK } from "@/utils/constants";

export const useProfileStore = defineStore("restaurantProfile", {
  state: () => ({
    loading: true,
    docId: null,
    imagePreview: "",
    backgroundPreview: "",
    selectedFile: null,
    selectedBgFile: null,
    isEditing: false,
    isSubmitting: false,
    RestaurantData: {
      RestaurantName: "",
      Phone: "",
      Distance: "",
      Address: "",
      ImageUrl: "",
      BgUrl: "",
      OpenTime: "",
      CloseTime: "",
      OpenDays: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      Status: "auto",
      CreatedAt: null,
      UpdatedAt: null,
    },
    daysOfWeek: DAYS_OF_WEEK,
  }),

  actions: {
    async fetchRestaurantByName() {
      const accountStore = useAccountStore();
      const restaurantStore = useRestaurant();

      if (!accountStore.isLoggedIn) {
        await accountStore.checkAuthState();
      }

      const nameFromUser = accountStore.user?.Restaurant;
      if (!nameFromUser) {
        this.loading = false;
        return;
      }

      this.loading = true;
      try {
        const result = await restaurantStore.fetchByName(nameFromUser);
        if (result) {
          const { id, ...data } = result;
          this.docId = id;
          Object.assign(this.RestaurantData, data);
          if (!this.RestaurantData.Status) this.RestaurantData.Status = "auto";
          
          this.imagePreview = this.RestaurantData.ImageUrl || "";
          this.backgroundPreview = this.RestaurantData.BgUrl || "";
        }
      } catch (error) {
        console.error("Fetch Restaurant Profile Error:", error);
      } finally {
        this.loading = false;
      }
    },

    async saveProfile() {
      if (!this.docId) return;

      try {
        this.isSubmitting = true;
        let ImageUrl = this.RestaurantData.ImageUrl;
        let BgUrl = this.RestaurantData.BgUrl;

        // อัปโหลดโลโก้ใหม่ ถ้ามีการเลือกไฟล์
        const newUrl = await uploadImage(this.selectedFile, "restaurants");
        if (newUrl) ImageUrl = newUrl;

        const newBgUrl = await uploadImage(this.selectedBgFile, "restaurants");
        if (newBgUrl) BgUrl = newBgUrl;

        await updateDoc(doc(db, "Restaurant", this.docId), {
          RestaurantName: this.RestaurantData.RestaurantName,
          Phone: this.RestaurantData.Phone,
          Distance: this.RestaurantData.Distance,
          Address: this.RestaurantData.Address,
          ImageUrl: ImageUrl,
          BgUrl: BgUrl,
          OpenTime: this.RestaurantData.OpenTime,
          CloseTime: this.RestaurantData.CloseTime,
          OpenDays: this.RestaurantData.OpenDays,
          Status: this.RestaurantData.Status || "auto",
          UpdatedAt: serverTimestamp(),
        });

        this.isEditing = false;
        this.selectedFile = null;
        this.selectedBgFile = null;
        await this.fetchRestaurantByName(); // โหลดข้อมูลใหม่มาทับให้เป็นเวอร์ชันล่าสุด
      } catch (error) {
        console.error("Save Profile Error:", error);
      } finally {
        this.isSubmitting = false;
      }
    },

    cancelEdit() {
      cleanupBlobUrl(this.imagePreview);
      cleanupBlobUrl(this.backgroundPreview);
      this.selectedFile = null;
      this.selectedBgFile = null;
      this.fetchRestaurantByName(); // ย้อนข้อมูลกลับไปเป็นของเดิมจาก Database
      this.isEditing = false;
    },

    onImageSelected(event) {
      const file = event?.target?.files?.[0];
      if (file) {
        cleanupBlobUrl(this.imagePreview);
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },

    onCoverSelected(event) {
      const file = event?.target?.files?.[0];
      if (file) {
        cleanupBlobUrl(this.backgroundPreview);
        this.selectedBgFile = file;
        this.backgroundPreview = URL.createObjectURL(file);
      }
    },
  },
});
