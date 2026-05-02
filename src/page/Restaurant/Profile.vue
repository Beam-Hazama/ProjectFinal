<script setup>
import { formatTimestamp } from '@/utils/formatTimestamp';
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useAccountStore } from '@/stores/auth/accountStore';
import { useProfileStore } from '@/stores/restaurant/profile';
import LayoutRestaurant from '@/page/Restaurant/restaurant.vue';

const accountStore = useAccountStore();
const profileStore = useProfileStore();

const now = ref(new Date());
let timer;

watch(
    () => accountStore.user,
    (newUser) => {
        if (newUser?.Restaurant) {
            profileStore.fetchRestaurantByName();
        }
    },
    { immediate: true }
);

onMounted(() => {
    profileStore.fetchRestaurantByName();
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
          <button v-if="profileStore.isEditing" @click="profileStore.cancelEdit" :disabled="profileStore.isSubmitting"
            class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-lg px-6 transition-all duration-300 font-bold disabled:bg-slate-200">
            Cancel
          </button>
          
          <button v-if="!profileStore.isEditing" @click="profileStore.isEditing = true"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg px-6 transition-all duration-300 font-bold gap-2 min-w-[100px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit
          </button>

          <button v-else @click="profileStore.saveProfile" :disabled="profileStore.isSubmitting"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg px-6 transition-all duration-300 font-bold min-w-[100px] disabled:bg-slate-200">
            <span v-if="profileStore.isSubmitting" class="loading loading-spinner loading-sm"></span>
            <span v-else>Save</span>
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
                <img v-if="profileStore.imagePreview" :src="profileStore.imagePreview" class="w-full h-full object-cover" />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <span class="text-sm font-medium">ไม่มีรูปภาพร้าน</span>
                </div>
              </div>

              <div class="flex flex-col gap-4 w-full">
                  <label 
                      class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-12 rounded-xl transition-all"
                      :class="{ 'opacity-50 cursor-not-allowed grayscale pointer-events-none': !profileStore.isEditing }">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      คลิกเพื่อเปลี่ยนรูปภาพ
                      <input type="file" class="hidden" @change="profileStore.handleFileUpload" accept="image/*" :disabled="!profileStore.isEditing" />
                  </label>
              </div>

            </div>
          </div>

          
          <div class="p-8 lg:col-span-2 space-y-8">

            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลเบื้องต้น</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium text-slate-600">ชื่อร้านอาหาร</span></label>
                  <input type="text" v-model="profileStore.RestaurantData.Name" disabled
                    class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label"><span
                        class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span></label>
                    <input type="text" v-model="profileStore.RestaurantData.Phone" :disabled="!profileStore.isEditing"
                      class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-medium text-slate-600">ระยะทาง
                        (กิโลเมตร)</span></label>
                    <input type="number" v-model.number="profileStore.RestaurantData.Distance" :disabled="!profileStore.isEditing" min="0" step="any"
                      class="input input-bordered w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500" />
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่ร้านอาหาร</span></label>
                  <textarea v-model="profileStore.RestaurantData.Address" :disabled="!profileStore.isEditing"
                    class="textarea textarea-bordered w-full bg-slate-50 h-24 disabled:bg-slate-100 disabled:text-slate-500"></textarea>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">สถานะร้าน (ตั้งค่าทันที)</span>
                  </label>
                  <div class="flex flex-wrap gap-3 mt-1">
                    <button type="button" @click="profileStore.RestaurantData.Status = 'open'" :disabled="!profileStore.isEditing"
                      class="btn flex-1 min-w-[120px] transition-all duration-300"
                      :class="profileStore.RestaurantData.Status === 'open' ? '!bg-emerald-500 hover:!bg-emerald-600 !text-white border-none shadow-md shadow-emerald-200 disabled:opacity-70' : 'bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400'">
                      เปิดทันที
                    </button>
                    <button type="button" @click="profileStore.RestaurantData.Status = 'close'" :disabled="!profileStore.isEditing"
                      class="btn flex-1 min-w-[120px] transition-all duration-300"
                      :class="profileStore.RestaurantData.Status === 'close' ? '!bg-red-500 hover:!bg-red-600 !text-white border-none shadow-md shadow-red-200 disabled:opacity-70' : 'bg-white border-red-500 text-red-600 hover:bg-red-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400'">
                      ปิดทันที
                    </button>
                    <button type="button" @click="profileStore.RestaurantData.Status = 'auto'" :disabled="!profileStore.isEditing"
                      class="btn flex-1 min-w-[120px] transition-all duration-300"
                      :class="profileStore.RestaurantData.Status === 'auto' || !profileStore.RestaurantData.Status ? '!bg-blue-500 hover:!bg-blue-600 !text-white border-none shadow-md shadow-blue-200 disabled:opacity-70' : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400'">
                      อัตโนมัติ (ตามเวลา)
                    </button>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-2">
                    เลือก "อัตโนมัติ" เพื่อให้ร้านเปิด-ปิดตามเวลาและวันที่กำหนดด้านล่าง
                  </div>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium text-slate-600">เวลาเปิด</span></label>
                  <input type="time" v-model="profileStore.RestaurantData.OpenTime" :disabled="!profileStore.isEditing"
                    class="input input-bordered w-full disabled:bg-slate-100 disabled:text-slate-500" />
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium text-slate-600">เวลาปิด</span></label>
                  <input type="time" v-model="profileStore.RestaurantData.CloseTime" :disabled="!profileStore.isEditing"
                    class="input input-bordered w-full disabled:bg-slate-100 disabled:text-slate-500" />
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">วันเปิดให้บริการ</span>
                  </label>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <label v-for="day in profileStore.daysOfWeek" :key="day.value" 
                      class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all"
                      :class="[
                        profileStore.RestaurantData.OpenDays.includes(day.value) 
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' 
                          : 'bg-white border-slate-200 text-slate-400',
                        !profileStore.isEditing ? 'opacity-70 cursor-not-allowed' : 'hover:border-blue-300'
                      ]">
                      <input type="checkbox" :value="day.value" v-model="profileStore.RestaurantData.OpenDays" :disabled="!profileStore.isEditing" class="hidden" />
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
