<script setup>
import { onMounted, reactive, ref, watch, onUnmounted } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAccountStore } from '@/stores/accountStore';
import LayoutRestaurant from '@/page/Restaurant/restaurant.vue';

const accountStore = useAccountStore();
const restaurantName = accountStore.user?.Restaurant;

const loading = ref(true);
const docId = ref(null);
const imagePreview = ref('');
const imageInputMethod = ref('file');
const selectedFile = ref(null);
const isEditing = ref(false);
const now = ref(new Date());
let timer;

const RestaurantData = reactive({
    Name: '',
    Phone: '',
    Distance: '',
    Address: '',
    ImageUrl: '',
    OpenTime: '',
    CloseTime: '',
    OpenDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    CreatedAt: null,
    UpdatedAt: null
});

const daysOfWeek = [
    { label: 'อา.', value: 'Sunday' },
    { label: 'จ.', value: 'Monday' },
    { label: 'อ.', value: 'Tuesday' },
    { label: 'พ.', value: 'Wednesday' },
    { label: 'พฤ.', value: 'Thursday' },
    { label: 'ศ.', value: 'Friday' },
    { label: 'ส.', value: 'Saturday' }
];

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH');
};

const fetchRestaurantByName = async () => {
    if (!accountStore.isLoggedIn) {
        await accountStore.checkAuthState();
    }

    const nameFromUser = accountStore.user?.Restaurant;
    if (!nameFromUser) {
        console.warn("No restaurant found in user account");
        loading.value = false;
        return;
    }

    loading.value = true;
    try {
        const q = query(
            collection(db, "Restaurant"),
            where("Name", "==", nameFromUser)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const restaurantDoc = querySnapshot.docs[0];
            docId.value = restaurantDoc.id;
            const data = restaurantDoc.data();
            Object.assign(RestaurantData, data);

            imagePreview.value = RestaurantData.ImageUrl;

            if (RestaurantData.ImageUrl && RestaurantData.ImageUrl.startsWith("http")) {
                imageInputMethod.value = "url";
            }
        } else {
            console.warn("Restaurant not found in database");
        }
    } catch (error) {
        console.error("Error fetching restaurant:", error);
    } finally {
        loading.value = false;
    }
};

const saveProfile = async () => {
    if (!docId.value) return;
    try {
        await updateDoc(doc(db, 'Restaurant', docId.value), {
            Name: RestaurantData.Name,
            Phone: RestaurantData.Phone,
            Distance: RestaurantData.Distance,
            Address: RestaurantData.Address,
            ImageUrl: RestaurantData.ImageUrl,
            OpenTime: RestaurantData.OpenTime,
            CloseTime: RestaurantData.CloseTime,
            OpenDays: RestaurantData.OpenDays,
            UpdatedAt: serverTimestamp()
        });
        alert('บันทึกข้อมูลโปรไฟล์สำเร็จ');
        isEditing.value = false;
        fetchRestaurantByName();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};

const cancelEdit = () => {
    fetchRestaurantByName();
    isEditing.value = false;
};

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0];
    if (selectedFile.value) {
        const previewUrl = URL.createObjectURL(selectedFile.value);
        imagePreview.value = previewUrl;
        RestaurantData.ImageUrl = previewUrl;
    }
};

watch(
    () => accountStore.user,
    (newUser) => {
        if (newUser?.Restaurant) {
            fetchRestaurantByName();
        }
    },
    { immediate: true }
);

onMounted(() => {
    fetchRestaurantByName();
    timer = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<template>
  <LayoutRestaurant>
    <div class="p-6 font-sans">
      
      <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-700">Profile</h1>
        </div>

        <div class="flex gap-3">
          <button v-if="isEditing" @click="cancelEdit"
            class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-lg px-6 transition-all duration-300 font-bold">
            Cancel
          </button>
          
          <button @click="isEditing ? saveProfile() : isEditing = true"
            :class="[
                'btn border-none shadow-md rounded-lg px-6 transition-all duration-300 font-bold gap-2 min-w-[100px]',
                isEditing ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
            ]">
            <template v-if="!isEditing">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit
            </template>
            <template v-else>
              Save
            </template>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

          
          <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
            <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">รูปภาพร้าน</h3>
            <div class="flex flex-col items-center gap-5 w-full max-w-xs mb-8">

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

            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลเบื้องต้น</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium text-slate-600">ชื่อร้านอาหาร *</span></label>
                  <input type="text" v-model="RestaurantData.Name" :disabled="!isEditing"
                    class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label"><span
                        class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span></label>
                    <input type="text" v-model="RestaurantData.Phone" :disabled="!isEditing"
                      class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium text-slate-600">ระยะทาง
                        (กิโลเมตร)</span></label>
                    <input type="number" v-model.number="RestaurantData.Distance" :disabled="!isEditing" min="0" step="any"
                      class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500" />
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่ร้านอาหาร</span></label>
                  <textarea v-model="RestaurantData.Address" :disabled="!isEditing"
                    class="textarea textarea-bordered w-full bg-slate-50 h-24 disabled:bg-slate-100 disabled:text-slate-500"></textarea>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium text-slate-600">เวลาเปิด</span></label>
                  <input type="time" v-model="RestaurantData.OpenTime" :disabled="!isEditing"
                    class="input input-bordered w-full disabled:bg-slate-100 disabled:text-slate-500" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium text-slate-600">เวลาปิด</span></label>
                  <input type="time" v-model="RestaurantData.CloseTime" :disabled="!isEditing"
                    class="input input-bordered w-full disabled:bg-slate-100 disabled:text-slate-500" />
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">วันเปิดให้บริการ</span>
                  </label>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <label v-for="day in daysOfWeek" :key="day.value" 
                      class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all"
                      :class="[
                        RestaurantData.OpenDays.includes(day.value) 
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' 
                          : 'bg-white border-slate-200 text-slate-400',
                        !isEditing ? 'opacity-70 cursor-not-allowed' : 'hover:border-blue-300'
                      ]">
                      <input type="checkbox" :value="day.value" v-model="RestaurantData.OpenDays" :disabled="!isEditing" class="hidden" />
                      <span>{{ day.label }}</span>
                    </label>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-2">หากไม่ได้เลือกวันใดวันหนึ่ง ร้านจะแสดงสถานะเป็น "ปิดชั่วคราว" ในวันนั้นอัตโนมัติ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutRestaurant>
</template>
