import { defineStore } from "pinia";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAccountStore } from "@/stores/auth";
import { useRestaurant } from "@/stores/shared/restaurant";
import { uploadImage } from "@/utils/upload";
import { cleanupBlobUrl } from "@/composables/useImagePreview";
import { DAYS_OF_WEEK } from "@/utils/constants";

export const useProfileStore = defineStore('restaurantProfile', {
  state: () => ({
    loading: true,
    docId: null,
    imagePreview: '',
    backgroundPreview: '',
    selectedFile: null,
    selectedBgFile: null,
    isEditing: false,
    isSubmitting: false,
    RestaurantData: {
      RestaurantName: '',
      Phone: '',
      Distance: '',
      Address: '',
      ImageUrl: '',
      BgUrl: '',
      OpenTime: '',
      CloseTime: '',
      OpenDays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      Status: 'close',
      StatusMode: 'auto',
      CreatedAt: null,
      UpdatedAt: null,
    },
    daysOfWeek: DAYS_OF_WEEK,
  }),

  actions: {
    // ภายใน actions

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

          // ค่าเริ่มต้นของ StatusMode
          if (!this.RestaurantData.StatusMode) {
            this.RestaurantData.StatusMode = 'auto';
          }

          // Status ใช้เฉพาะ open / close เท่านั้น
          if (
            this.RestaurantData.Status !== 'open' &&
            this.RestaurantData.Status !== 'close'
          ) {
            this.RestaurantData.Status = 'close';
          }

          // โหลดรูป preview
          this.imagePreview = this.RestaurantData.ImageUrl || '';
          this.backgroundPreview = this.RestaurantData.BgUrl || '';
        }
      } catch (error) {
        console.error('Fetch Restaurant Profile Error:', error);
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

        // อัปโหลดรูปโลโก้
        const newUrl = await uploadImage(this.selectedFile, 'restaurants');
        if (newUrl) ImageUrl = newUrl;

        // อัปโหลดรูปพื้นหลัง
        const newBgUrl = await uploadImage(this.selectedBgFile, 'restaurants');
        if (newBgUrl) BgUrl = newBgUrl;

        const mode = this.RestaurantData.StatusMode || 'auto';

        // กำหนด Status สำหรับโหมด open / close
        // ถ้าเป็น auto จะคำนวณภายหลังด้วย updateStatusByTime()
        let statusToSave = this.RestaurantData.Status;

        if (mode === 'open') {
          statusToSave = 'open';
        } else if (mode === 'close') {
          statusToSave = 'close';
        }

        // อัปเดต state
        this.RestaurantData.Status = statusToSave;
        this.RestaurantData.StatusMode = mode;
        this.RestaurantData.ImageUrl = ImageUrl;
        this.RestaurantData.BgUrl = BgUrl;

        // บันทึกข้อมูล
        await updateDoc(doc(db, 'Restaurant', this.docId), {
          RestaurantName: this.RestaurantData.RestaurantName,
          Phone: this.RestaurantData.Phone,
          Distance: this.RestaurantData.Distance,
          Address: this.RestaurantData.Address,
          ImageUrl,
          BgUrl,
          OpenTime: this.RestaurantData.OpenTime,
          CloseTime: this.RestaurantData.CloseTime,
          OpenDays: this.RestaurantData.OpenDays,

          // Status มีเฉพาะ open / close
          Status: statusToSave,

          // โหมดควบคุม
          StatusMode: mode,

          UpdatedAt: serverTimestamp(),
        });

        // ถ้าเป็น auto ให้คำนวณสถานะจริงทันที
        if (mode === 'auto') {
          await this.updateStatusByTime();
        }

        this.isEditing = false;
        this.selectedFile = null;
        this.selectedBgFile = null;

        // โหลดข้อมูลล่าสุด
        await this.fetchRestaurantByName();
      } catch (error) {
        console.error('Save Profile Error:', error);
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateStatusByTime() {
      if (!this.docId) return;

      const restaurant = this.RestaurantData;
      const mode = restaurant.StatusMode || 'auto';

      let newStatus = 'close';

      // บังคับเปิดตลอดเวลา
      if (mode === 'open') {
        newStatus = 'open';
      }
      // บังคับปิดตลอดเวลา
      else if (mode === 'close') {
        newStatus = 'close';
      }
      // โหมดอัตโนมัติ
      else {
        // ถ้ายังไม่ได้กำหนดเวลา ให้ปิดร้าน
        if (!restaurant.OpenTime || !restaurant.CloseTime) {
          newStatus = 'close';
        } else {
          const now = new Date();

          // วันปัจจุบัน เช่น Monday
          const currentDay = now.toLocaleDateString('en-US', {
            weekday: 'long',
          });

          // ตรวจสอบว่าวันนี้เปิดร้านหรือไม่
          const isOpenDay =
            Array.isArray(restaurant.OpenDays) &&
            restaurant.OpenDays.includes(currentDay);

          if (!isOpenDay) {
            newStatus = 'close';
          } else {
            // เวลาในรูปแบบ HH:mm
            const currentTime = now.toTimeString().slice(0, 5);

            // กรณีปิดหลังเที่ยงคืน เช่น 18:00 - 02:00
            if (restaurant.OpenTime > restaurant.CloseTime) {
              newStatus =
                currentTime >= restaurant.OpenTime ||
                currentTime <= restaurant.CloseTime
                  ? 'open'
                  : 'close';
            } else {
              // กรณีปกติ เช่น 08:00 - 20:00
              newStatus =
                currentTime >= restaurant.OpenTime &&
                currentTime <= restaurant.CloseTime
                  ? 'open'
                  : 'close';
            }
          }
        }
      }

      // ถ้าสถานะไม่เปลี่ยน ไม่ต้องเขียน Firestore
      if (restaurant.Status === newStatus) {
        return;
      }

      // อัปเดต state ทันที
      restaurant.Status = newStatus;

      // บันทึกลง Firestore
      await updateDoc(doc(db, 'Restaurant', this.docId), {
        Status: newStatus,
        UpdatedAt: serverTimestamp(),
      });
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
