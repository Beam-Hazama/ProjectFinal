import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '@/utils/upload';

// ค่าเริ่มต้นของฟอร์มเพิ่มผู้ใช้ — แยกออกมาเพื่อใช้ตอน init และตอน reset
const DEFAULT_USER = {
  Firstname: '',
  Lastname: '',
  Username: '',
  Password: '',
  Email: '',
  Phone: '',
  Address: '',
  Status: 'active',
  Role: 'restaurant',
  ImageUrl: '',
  Restaurant: '',
  Age: ''
};

export const useUserFormStore = defineStore('userForm', () => {
  const isLoading = ref(false);
  const restaurants = ref([]);
  const selectedFile = ref(null);
  const imagePreview = ref(null);

  const userData = reactive({ ...DEFAULT_USER });

  // คืนค่าฟอร์มกลับเป็นค่าเริ่มต้น (ไม่ replace object เพราะ reactive)
  const resetForm = () => {
    Object.assign(userData, DEFAULT_USER);
    selectedFile.value = null;
    imagePreview.value = null;
  };

  const loadRestaurants = async () => {
    try {
      const snap = await getDocs(collection(db, 'Restaurant'));
      restaurants.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // เช็คว่า username นี้ถูกใช้แล้วใน DB หรือไม่
  const isUsernameTaken = async (username) => {
    const q = query(collection(db, 'User'), where('Username', '==', username));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const save = async (router) => {
    const { Firstname, Lastname, Username, Restaurant, Phone, Address, Password, Age } = userData;
    if (!Firstname || !Lastname || !Username || !Restaurant || !Phone || !Address || !Password || !Age) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return false;
    }

    try {
      isLoading.value = true;

      // ตรวจสอบ username ซ้ำก่อน — ไม่ต้องอัปโหลดรูปถ้า username ใช้ไม่ได้
      if (await isUsernameTaken(Username.trim())) {
        alert("Username นี้ถูกใช้งานไปแล้ว");
        return false;
      }

      // อัปโหลดรูปถ้ามี
      let finalImageUrl = userData.ImageUrl;
      if (selectedFile.value) {
        const newUrl = await uploadImage(selectedFile.value, 'users');
        if (newUrl) finalImageUrl = newUrl;
      }

      await addDoc(collection(db, 'User'), {
        ...userData,
        Username: Username.trim(),
        Status: userData.Status || 'active',
        Role: 'restaurant',
        ImageUrl: finalImageUrl || '',
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp()
      });

      resetForm();
      if (router) router.push('/Admin/Restaurantuser');
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    userData,
    restaurants,
    isLoading,
    selectedFile,
    imagePreview,
    loadRestaurants,
    save,
    resetForm
  };
});
