<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRestaurantFormStore } from '@/stores/admin/restaurantForm';
import { useImagePreview } from '@/composables/useImagePreview';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { isMinimumTimeGap } from '@/utils/shopStatus';

const router = useRouter();
const formStore = useRestaurantFormStore();
const daysOfWeek = DAYS_OF_WEEK;


const { previewUrl: logoPreviewUrl, selectedFile: logoFile, handleFileSelect: handleLogoSelect } = useImagePreview();
const { previewUrl: bgPreviewUrl, selectedFile: bgFile, handleFileSelect: handleBgSelect } = useImagePreview();

// ตรวจสอบเวลาเปิด-ปิดห่างกันอย่างน้อย 1 ชั่วโมง
const isTimeGapInvalid = computed(() => {
  const d = formStore.restaurantData;
  if (!d.OpenTime || !d.CloseTime) return false;
  return !isMinimumTimeGap(d.OpenTime, d.CloseTime, 60);
});

const isFormValid = computed(() => {
  const d = formStore.restaurantData;
  return (
    d.RestaurantName.trim() !== '' &&
    d.Phone.length === 10 &&
    d.Distance !== '' && d.Distance !== null &&
    d.Address.trim() !== '' &&
    d.OpenTime !== '' &&
    d.CloseTime !== '' &&
    d.OpenDays.length > 0 &&
    logoFile.value !== null &&
    bgFile.value !== null &&
    !isTimeGapInvalid.value
  );
});

const checkSaveRestaurant = () => formStore.save(router);

const handleLogoUpload = (event) => {
  handleLogoSelect(event);
  formStore.selectedFile = logoFile.value;
  formStore.imagePreview = logoPreviewUrl.value;
};

const handleBgUpload = (event) => {
  handleBgSelect(event);
  formStore.selectedBgFile = bgFile.value;
  formStore.bgImagePreview = bgPreviewUrl.value;
};
const goBack = () => router.go(-1);
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <div class="text-3xl font-bold text-slate-700">
          Add New Restaurant
        </div>
        <div class="flex gap-3">
          <button @click="goBack" :disabled="formStore.isLoading"
            class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl transition-all font-bold w-28 disabled:bg-slate-200 disabled:text-slate-400">Cancel</button>
          <button @click="checkSaveRestaurant" :disabled="!isFormValid || formStore.isLoading"
            class="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-500/30 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-300 w-28 rounded-xl font-bold">
            <span v-if="formStore.isLoading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Save</span>
          </button>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
          <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center space-y-10">
            <div class="w-full flex flex-col items-center">
              <h3 class="font-bold text-slate-700 mb-4 w-full flex items-center gap-2 justify-center lg:justify-start">
                รูปภาพโลโก้ร้านอาหาร </h3>
              <div class="flex flex-col items-center gap-4 w-full max-w-xs">
                <div
                  class="w-full h-44 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                  <img v-if="formStore.imagePreview" :src="formStore.imagePreview" class="w-full h-full object-cover" />
                  <div v-else class="text-slate-400 flex flex-col items-center">
                    <span class="text-sm font-medium">ไม่มีรูปภาพโลโก้</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                  <label
                    class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-11 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    คลิกเลือกรูปภาพโลโก้
                    <input type="file" class="hidden" @change="handleLogoUpload" accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            <div class="w-full flex flex-col items-center">
              <h3 class="font-bold text-slate-700 mb-4 w-full flex items-center gap-2 justify-center lg:justify-start">
                รูปภาพพื้นหลัง </h3>
              <div class="flex flex-col items-center gap-4 w-full max-w-xs">
                <div
                  class="w-full h-44 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                  <img v-if="formStore.bgImagePreview" :src="formStore.bgImagePreview"
                    class="w-full h-full object-cover" />
                  <div v-else class="text-slate-400 flex flex-col items-center">
                    <span class="text-sm font-medium">ไม่มีรูปภาพพื้นหลัง</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                  <label
                    class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-11 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    คลิกเลือกรูปภาพพื้นหลัง
                    <input type="file" class="hidden" @change="handleBgUpload" accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="p-8 lg:col-span-2 space-y-8">
            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลร้านอาหาร</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ชื่อร้านอาหาร</span>
                  </label>
                  <input type="text"
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                    v-model="formStore.restaurantData.RestaurantName" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span>
                    </label>
                    <input type="text"
                      class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                      v-model="formStore.restaurantData.Phone" maxlength="10"
                      @input="formStore.restaurantData.Phone = formStore.restaurantData.Phone.replace(/[^0-9]/g, '')" />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">ระยะทาง (กิโลเมตร)</span>
                    </label>
                    <input type="text" inputmode="decimal"
                      class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                      v-model="formStore.restaurantData.Distance"
                      @keypress="(e) => { const v = e.target.value; const [int, dec] = v.split('.'); if (!/[\d.]/.test(e.key)) { e.preventDefault(); return; } if (e.key === '.' && v.includes('.')) { e.preventDefault(); return; } if (e.key !== '.' && !v.includes('.') && (int || '').length >= 1) { e.preventDefault(); return; } if (e.key !== '.' && v.includes('.') && (dec || '').length >= 1) e.preventDefault() }"
                      @input="(e) => { let v = e.target.value.replace(/[^0-9.]/g, ''); const d = v.indexOf('.'); if (d !== -1) v = v.slice(0, d+1) + v.slice(d+1).replace(/\./g,''); const p = v.split('.'); v = p.length === 2 ? p[0].slice(0,1) + '.' + p[1].slice(0,1) : p[0].slice(0,1); if (formStore.restaurantData.Distance !== v) formStore.restaurantData.Distance = v }" />
                  </div>
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ที่อยู่ร้านอาหาร</span>
                  </label>
                  <textarea
                    class="textarea textarea-bordered w-full focus:input-primary bg-slate-50 border-slate-200 h-24"
                    v-model="formStore.restaurantData.Address"></textarea>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">สถานะร้านปัจจุบัน</span>
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button v-for="status in [
                      { v: 'open', l: 'เปิดตลอดเวลา', active: '!bg-emerald-500 !text-white shadow-lg shadow-emerald-200' },
                      { v: 'close', l: 'ปิดตลอดเวลา', active: '!bg-red-500 !text-white shadow-lg shadow-red-200' },
                      { v: 'auto', l: 'อัตโนมัติ', active: '!bg-blue-500 !text-white shadow-lg shadow-blue-200' }
                    ]" :key="status.v" type="button" @click="formStore.restaurantData.Status = status.v"
                      class="btn btn-sm h-12 border-none transition-all duration-300 rounded-xl font-bold" :class="[
                        formStore.restaurantData.Status === status.v
                          ? status.active
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      ]">
                      {{ status.l }}
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เวลาเปิด</span>
                    </label>
                    <div class="relative">
                      <input type="time"
                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 pl-10"
                        v-model="formStore.restaurantData.OpenTime" />
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">เวลาปิด</span>
                    </label>
                    <div class="relative">
                      <input type="time"
                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 pl-10"
                        v-model="formStore.restaurantData.CloseTime" />
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div v-if="isTimeGapInvalid" class="text-red-500 text-xs font-bold mt-1 flex items-center gap-1 md:col-span-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    เวลาเปิด-ปิดต้องห่างกันอย่างน้อย 1 ชั่วโมง
                  </div>
                  <div class="form-control md:col-span-2">
                    <label class="label">
                      <span class="label-text font-medium text-slate-600">วันเปิดให้บริการ</span>
                    </label>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <label v-for="day in daysOfWeek" :key="day.value"
                        class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all"
                        :class="[
                          formStore.restaurantData.OpenDays && formStore.restaurantData.OpenDays.includes(day.value)
                            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-400',
                          'hover:border-blue-300'
                        ]">
                        <input type="checkbox" :value="day.value" v-model="formStore.restaurantData.OpenDays"
                          class="hidden" />
                        <span>{{ day.label }}</span>
                      </label>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-2">หากไม่ได้เลือกวันใดวันหนึ่ง ร้านจะแสดงสถานะเป็น
                      "ปิดชั่วคราว" ในวันนั้นอัตโนมัติ</div>
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
