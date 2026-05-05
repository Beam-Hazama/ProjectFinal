import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { db } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '@/utils/upload';
import { getAutoStatus } from '@/utils/shopStatus';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ค่าเริ่มต้นของฟอร์มเพิ่มร้านอาหาร — แยกออกมาเพื่อใช้ตอน init และตอน reset
const DEFAULT_RESTAURANT = {
  Name: '',
  Phone: '',
  Distance: '',
  Address: '',
  ImageUrl: '',
  OpenTime: '',
  CloseTime: '',
  OpenDays: [...ALL_DAYS],
};

export const useRestaurantFormStore = defineStore('restaurantForm', () => {
  const isLoading = ref(false);
  const selectedFile = ref(null);
  const imagePreview = ref('');

  const restaurantData = reactive({ ...DEFAULT_RESTAURANT, OpenDays: [...ALL_DAYS] });

  // คืนค่าฟอร์มกลับเป็นค่าเริ่มต้น
  const resetForm = () => {
    Object.assign(restaurantData, DEFAULT_RESTAURANT);
    restaurantData.OpenDays = [...ALL_DAYS]; // ต้องสร้าง array ใหม่ไม่ให้แชร์ reference
    selectedFile.value = null;
    imagePreview.value = '';
  };

  const save = async (router) => {
    try {
      isLoading.value = true;
      let ImageUrl = restaurantData.ImageUrl;

      if (selectedFile.value) {
        const newUrl = await uploadImage(selectedFile.value, 'restaurants');
        if (newUrl) ImageUrl = newUrl;
      }

      // คำนวณสถานะอัตโนมัติด้วย util เดียวกับที่ใช้แสดงผล
      const Status = getAutoStatus(
        restaurantData.OpenTime,
        restaurantData.CloseTime,
        restaurantData.OpenDays
      );

      await addDoc(collection(db, 'Restaurant'), {
        ...restaurantData,
        ImageUrl,
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
    save,
    resetForm
  };
});
