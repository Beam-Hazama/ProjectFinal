<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

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

onMounted(async () => {
  if (route.params.name) {
    const q = query(collection(db, 'Restaurant'), where('Name', '==', route.params.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const res = querySnapshot.docs[0].data();
      Object.assign(RestaurantData, res);
      // ตรวจสอบและแปลงข้อมูลเก่า (ตัวเลข) เป็นชื่อวัน หรือใส่ค่าเริ่มต้น
      if (!RestaurantData.OpenDays || (RestaurantData.OpenDays.length > 0 && typeof RestaurantData.OpenDays[0] === 'number')) {
        RestaurantData.OpenDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      }
    } else {
      console.log("ไม่พบข้อมูลร้านอาหารชิ้นนี้ในระบบ");
    }
  }
});

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <LayoutAdmin>
    <div class="min-h-screen p-6 md:p-8 font-sans">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
            Restaurant Details
          </h1>
        </div>
        <div class="flex gap-3">
          <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200 w-28 rounded-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back</button>
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
                <img v-if="RestaurantData.ImageUrl" :src="RestaurantData.ImageUrl" class="w-full h-full object-cover" />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <span class="text-sm font-medium">ไม่มีรูปภาพร้าน</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 lg:col-span-2 space-y-8">
            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลเบื้องต้น</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ชื่อร้านอาหาร</span>
                  </label>
                  <input type="text" class="input input-bordered w-full bg-slate-50 border-slate-200"
                    v-model="RestaurantData.Name" readonly />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span>
                    </label>
                    <input type="text" class="input input-bordered w-full bg-slate-50 border-slate-200"
                      v-model="RestaurantData.Phone" readonly />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">ระยะทาง (กิโลเมตร)</span>
                    </label>
                    <input type="number" class="input input-bordered w-full bg-slate-50 border-slate-200"
                      v-model.number="RestaurantData.Distance" readonly />
                  </div>
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ที่อยู่</span>
                  </label>
                  <textarea class="textarea textarea-bordered w-full bg-slate-50 border-slate-200 h-24"
                    v-model="RestaurantData.Address" readonly></textarea>
                </div>
              </div>
            </div>

            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">เวลาทำการ</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">เวลาเปิด</span>
                  </label>
                  <input type="time" class="input input-bordered w-full bg-slate-50 border-slate-200"
                    v-model="RestaurantData.OpenTime" readonly />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">เวลาปิด</span>
                  </label>
                  <input type="time" class="input input-bordered w-full bg-slate-50 border-slate-200"
                    v-model="RestaurantData.CloseTime" readonly />
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">วันเปิดให้บริการ</span>
                  </label>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <label v-for="day in daysOfWeek" :key="day.value"
                      class="flex items-center gap-2 px-3 py-2 rounded-xl border opacity-70 cursor-not-allowed transition-all"
                      :class="[
                        RestaurantData.OpenDays && RestaurantData.OpenDays.includes(day.value)
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      ]">
                      <input type="checkbox" :value="day.value" v-model="RestaurantData.OpenDays" disabled
                        class="hidden" />
                      <span>{{ day.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>
