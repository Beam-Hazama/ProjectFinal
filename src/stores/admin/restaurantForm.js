import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { db } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '@/utils/upload';
import { getShopAutoStatus } from '@/utils/shopStatus';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ค่าเริ่มต้นของฟอร์มเพิ่มร้านอาหาร — แยกออกมาเพื่อใช้ตอน init และตอน reset
const DEFAULT_RESTAURANT = {
  RestaurantName: '',
  Phone: '',
  Distance: '',
  Address: '',
  ImageUrl: '',
  BgUrl: '',
  OpenTime: '',
  CloseTime: '',
  OpenDays: [...ALL_DAYS],
};

export const useRestaurantFormStore = defineStore('restaurantForm', () => {
  const isLoading = ref(false);
  const selectedFile = ref(null);
  const imagePreview = ref('');
  const selectedBgFile = ref(null);
  const bgImagePreview = ref('');

  const restaurantData = reactive({ ...DEFAULT_RESTAURANT, OpenDays: [...ALL_DAYS] });

  // คืนค่าฟอร์มกลับเป็นค่าเริ่มต้น
  const resetForm = () => {
    Object.assign(restaurantData, DEFAULT_RESTAURANT);
    restaurantData.OpenDays = [...ALL_DAYS]; // ต้องสร้าง array ใหม่ไม่ให้แชร์ reference
    selectedFile.value = null;
    imagePreview.value = '';
    selectedBgFile.value = null;
    bgImagePreview.value = '';
  };

  const save = async (router) => {
    try {
      isLoading.value = true;
      let ImageUrl = restaurantData.ImageUrl;
      let BgUrl = restaurantData.BgUrl;

      if (selectedFile.value) {
        const newUrl = await uploadImage(selectedFile.value, 'restaurants');
        if (newUrl) ImageUrl = newUrl;
      }

      if (selectedBgFile.value) {
        const newBgUrl = await uploadImage(selectedBgFile.value, 'restaurants');
        if (newBgUrl) BgUrl = newBgUrl;
      }

      // คำนวณสถานะอัตโนมัติด้วย util เดียวกับที่ใช้แสดงผล
      const Status = getShopAutoStatus(
        restaurantData.OpenTime,
        restaurantData.CloseTime,
        restaurantData.OpenDays
      );

      await addDoc(collection(db, 'Restaurant'), {
        ...restaurantData,
        ImageUrl,
        BgUrl,
        Status,
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp()
      });

      resetForm();
      if (router) router.push({ name: 'Restaurant List' });
      return true;
    } catch (error) {
      console.error('Error saving restaurant:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    restaurantData,
    isLoading,
    selectedFile,
    imagePreview,
    selectedBgFile,
    bgImagePreview,
    save,
    resetForm
  };
});
