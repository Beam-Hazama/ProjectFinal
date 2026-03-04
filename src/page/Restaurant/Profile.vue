<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch, onUnmounted } from 'vue';
import { useAccountStore } from '@/stores/account';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import LayoutRestaurant from '@/page/Restaurant/restaurant.vue';

const route = useRoute();
const router = useRouter();
const accountStore = useAccountStore();
const loading = ref(true);
const docId = ref(null);
const imagePreview = ref('');
const imageInputMethod = ref('file');
const selectedFile = ref(null);


const now = ref(new Date());
let timer;

const RestaurantData = reactive({
  Name: '',
  ImageUrl: '',
  OpenTime: '',
  CloseTime: '',
  Status: '',
  ManualStatus: 'auto',
  CreatedAt: null,
  UpdatedAt: null
});

const calculateStatus = () => {

  if (RestaurantData.ManualStatus === 'manual') return RestaurantData.Status;


  if (!RestaurantData.OpenTime || !RestaurantData.CloseTime) return 'close';

  const currentTime = now.value.getHours() * 60 + now.value.getMinutes();
  const [openH, openM] = RestaurantData.OpenTime.split(':').map(Number);
  const [closeH, closeM] = RestaurantData.CloseTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {

    return (currentTime >= openMinutes && currentTime < closeMinutes) ? 'open' : 'close';
  } else {

    return (currentTime >= openMinutes || currentTime < closeMinutes) ? 'open' : 'close';
  }
};


watch([now, () => RestaurantData.OpenTime, () => RestaurantData.CloseTime, () => RestaurantData.ManualStatus], () => {
  RestaurantData.Status = calculateStatus();
});

const fetchRestaurantByName = async () => {

  if (!accountStore.isLoggedIn) {
    await accountStore.checkAuthState();
  }

  let nameFromUrl = route.params.restaurantName;


  if (!nameFromUrl && accountStore.user && accountStore.user.Restaurant) {
    nameFromUrl = accountStore.user.Restaurant;
  }

  if (!nameFromUrl) {
    console.warn("No restaurant name found in URL or User Account");
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const q = query(collection(db, "Restaurant"), where("Name", "==", nameFromUrl));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const restaurantDoc = querySnapshot.docs[0];
      docId.value = restaurantDoc.id;
      const data = restaurantDoc.data();
      Object.assign(RestaurantData, data);


      if (!RestaurantData.ManualStatus) RestaurantData.ManualStatus = 'auto';

      imagePreview.value = RestaurantData.ImageUrl;
      RestaurantData.Status = calculateStatus();

      if (RestaurantData.ImageUrl && RestaurantData.ImageUrl.startsWith('http')) {
        imageInputMethod.value = 'url';
      }
    }
  } catch (error) {
    console.error("Error fetching restaurant:", error);
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const previewUrl = URL.createObjectURL(selectedFile.value);
    imagePreview.value = previewUrl;
    RestaurantData.ImageUrl = previewUrl;
  }
};

const saveProfile = async () => {
  if (!docId.value) return;
  try {

    await updateDoc(doc(db, 'Restaurant', docId.value), {
      Name: RestaurantData.Name,
      ImageUrl: RestaurantData.ImageUrl,
      OpenTime: RestaurantData.OpenTime,
      CloseTime: RestaurantData.CloseTime,
      Status: RestaurantData.Status,
      ManualStatus: RestaurantData.ManualStatus,
      UpdatedAt: serverTimestamp()
    });
    alert('บันทึกข้อมูลโปรไฟล์สำเร็จ');
    fetchRestaurantByName();
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
};

onMounted(() => {
  fetchRestaurantByName();
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

watch(() => route.params.restaurantName, fetchRestaurantByName);
</script>

<template>
  <LayoutRestaurant>
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-blue-600"></span>
    </div>

    <div v-else class="min-h-screen p-6 md:p-8 font-sans">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">แก้ไขข้อมูลร้านค้า</h1>
          <p class="text-sm text-slate-500">จัดการรายละเอียด โปรไฟล์ และสถานะของร้าน: {{ RestaurantData.Name }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="saveProfile"
            class="btn bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white hover:shadow-lg transition-all duration-300 px-6">
            บันทึกข้อมูลโปรไฟล์
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

          <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
            <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">รูปภาพร้าน</h3>
            <div class="flex flex-col items-center gap-5 w-full max-w-xs mb-8">
              <span class="text-sm font-semibold text-slate-600 self-start">โลโก้ / รูปภาพหน้าร้าน</span>
              <div
                class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <span class="text-sm font-medium">ไม่มีรูปภาพร้าน</span>
                </div>
              </div>

              <div role="tablist" class="tabs tabs-boxed bg-white border border-slate-200 p-1">
                <a role="tab" class="tab text-xs h-8"
                  :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'file' }"
                  @click="imageInputMethod = 'file'">อัปโหลดไฟล์</a>
                <a role="tab" class="tab text-xs h-8"
                  :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'url' }"
                  @click="imageInputMethod = 'url'">ใช้ URL</a>
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">วันที่สร้าง</span>
                <span class="text-sm font-semibold text-slate-700">{{ formatDate(RestaurantData.CreatedAt) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">แก้ไขล่าสุด</span>
                <span class="text-sm font-semibold text-slate-700">{{ formatDate(RestaurantData.UpdatedAt) }}</span>
              </div>
            </div>

            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลเบื้องต้น</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium text-slate-600">ชื่อร้านค้า *</span></label>
                  <input type="text" v-model="RestaurantData.Name" class="input input-bordered w-full bg-slate-50" />
                </div>



                <div class="form-control">
                  <label class="label"><span
                      class="label-text font-medium text-slate-600">เวลาเปิดให้บริการ</span></label>
                  <input type="time" v-model="RestaurantData.OpenTime" class="input input-bordered w-full" />
                </div>

                <div class="form-control">
                  <label class="label"><span
                      class="label-text font-medium text-slate-600">เวลาปิดให้บริการ</span></label>
                  <input type="time" v-model="RestaurantData.CloseTime" class="input input-bordered w-full" />
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
  </LayoutRestaurant>
</template>