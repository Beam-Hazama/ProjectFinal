<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';

import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

const mode = ref('');
const selectedFile = ref(null);
const imagePreview = ref('');
const imageInputMethod = ref('file');


const RestaurantData = reactive({
  Name: '',
  ImageUrl: '',
  Status: '',
  OpenTime: '',
  CloseTime: '',
  CreatedAt: null,
  UpdatedAt: null
});

watch(() => RestaurantData.ImageUrl, (newVal) => {
  if (imageInputMethod.value === 'url') {
    imagePreview.value = newVal;
  }
});

const checkSaveRestaurant = async (data) => {
  try {

    const { id, CreatedAt, UpdatedAt, ...saveData } = data;
    const colName = 'Restaurant';


    if (!saveData.ManualStatus) {
      saveData.ManualStatus = 'auto';
    }


    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (saveData.OpenTime || '00:00').split(':').map(Number);
    const [closeH, closeM] = (saveData.CloseTime || '00:00').split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (saveData.ManualStatus === 'auto') {
      let autoStatus = 'close';

      if (closeMin > openMin) {
        if (currentTime >= openMin && currentTime < closeMin) autoStatus = 'open';
      } else {
        if (currentTime >= openMin || currentTime < closeMin) autoStatus = 'open';
      }

      saveData.Status = autoStatus;
    }

    if (mode.value === 'Add Restaurant') {
      await addDoc(collection(db, colName), {
        ...saveData,
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp()
      });
    } else {
      const docId = route.params.id;
      await updateDoc(doc(db, colName, docId), {
        ...saveData,
        UpdatedAt: serverTimestamp()
      });
    }

    router.push({ name: 'Restaurant List' });
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving restaurant: ' + error.message);
  }
}

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const previewUrl = URL.createObjectURL(selectedFile.value)
    imagePreview.value = previewUrl
    RestaurantData.ImageUrl = previewUrl
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
};

const goBack = () => {
  router.go(-1);
}

onMounted(async () => {
  if (route.params.id) {
    mode.value = 'Update Restaurant';

    const resSnap = await getDoc(doc(db, 'Restaurant', route.params.id));

    if (resSnap.exists()) {
      const res = resSnap.data();

      Object.assign(RestaurantData, res);
      imagePreview.value = res.ImageUrl;
      if (res.ImageUrl && res.ImageUrl.startsWith('http')) {
        imageInputMethod.value = 'url';
      }
    } else {
      console.log("ไม่พบข้อมูลร้านค้าชิ้นนี้ในระบบ");
    }
  } else {
    mode.value = 'Add Restaurant';
  }
});
</script>

<template>
  <LayoutAdmin>
    <div class="min-h-screen p-6 md:p-8 font-sans">

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
            {{ mode === 'Add Restaurant' ? 'เพิ่มร้านค้าใหม่' : 'แก้ไขข้อมูลร้านค้า' }}
          </h1>
          <p class="text-sm text-slate-500">จัดการรายละเอียดที่ตั้ง ข้อมูลติดต่อ และสถานะร้านค้า</p>
        </div>

        <div class="flex gap-3">
          <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">ยกเลิก</button>
          <button @click="checkSaveRestaurant(RestaurantData)" :disabled="!RestaurantData.Name"
            class="btn bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-6">
            บันทึกข้อมูลร้านค้า
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

          <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
            <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
              รูปภาพหน้าร้าน
            </h3>

            <div class="flex flex-col items-center gap-5 w-full max-w-xs">
              <div
                class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                <img v-if="imagePreview || RestaurantData.ImageUrl" :src="imagePreview || RestaurantData.ImageUrl"
                  class="w-full h-full object-cover" />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <span class="text-sm font-medium">ไม่มีรูปภาพร้าน</span>
                </div>
              </div>

              <div role="tablist" class="tabs tabs-boxed  bg-white border border-slate-200 p-1 ">
                <a role="tab" class="tab text-xs h-8 transition-all"
                  :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'file' }"
                  @click="imageInputMethod = 'file'">
                  อัปโหลดไฟล์
                </a>
                <a role="tab" class="tab text-xs h-8 transition-all"
                  :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'url' }"
                  @click="imageInputMethod = 'url'">
                  ใช้ URL
                </a>
              </div>

              <div v-if="imageInputMethod === 'file'" class="w-full text-center animate-fade-in">
                <label
                  class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  เลือกรูปภาพจากเครื่อง
                  <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                </label>
                <div class="text-[10px] text-slate-400 mt-2">รองรับไฟล์ .jpg, .png ขนาดไม่เกิน 5MB</div>
              </div>


              <div v-else class="w-full animate-fade-in">
                <div class="relative">
                  <input type="text" placeholder="วางลิงก์รูปภาพ (https://...)"
                    class="input input-bordered input-sm w-full pl-9 focus:input-primary bg-white h-10"
                    v-model="RestaurantData.ImageUrl" />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-3 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div class="text-[10px] text-slate-400 mt-2 text-center">รูปภาพจะแสดงตัวอย่างด้านบนทันที</div>
              </div>
            </div>
          </div>

          <div class="p-8 lg:col-span-2 space-y-8">
            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลเบื้องต้น</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ชื่อร้านค้า <span
                        class="text-red-500">*</span></span>
                  </label>
                  <input type="text" placeholder="ระบุชื่อร้านอาหารของคุณ"
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                    v-model="RestaurantData.Name" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เวลาเปิดให้บริการ</span>
                    </label>
                    <div class="relative">
                      <input type="time"
                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 pl-10"
                        v-model="RestaurantData.OpenTime" />
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เวลาปิดให้บริการ</span>
                    </label>
                    <div class="relative">
                      <input type="time"
                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 pl-10"
                        v-model="RestaurantData.CloseTime" />
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>




                <div class="form-control">
                  <label class="label"><span
                      class="label-text font-medium text-slate-600">ตั้งค่าการเปิด-ปิด</span></label>
                  <select class="select select-bordered w-full " v-model="RestaurantData.ManualStatus">
                    <option value="auto">⏱️ ทำงานตามเวลาอัตโนมัติ</option>
                    <option value="manual">⚙️ กำหนดเอง</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">สถานะร้านอาหารปัจจุบัน</span>
                  </label>
                  <select
                    class="select select-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                    v-model="RestaurantData.Status" :disabled="RestaurantData.ManualStatus === 'auto'">
                    <option value="open">🟢 เปิดให้บริการ (Open)</option>
                    <option value="close">🔴 ปิดชั่วคราว (Closed)</option>
                  </select>
                  
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>