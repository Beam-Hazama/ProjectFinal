<script setup>
/* import { formatTimestamp } from '@/utils/format'; */
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useAccountStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/restaurant/profile';
import LayoutRestaurant from '@/views/restaurant/RestaurantLayout.vue';

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
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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
      <div class="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 overflow-hidden mb-10">
        <div class="relative min-h-[280px] md:min-h-[320px] bg-indigo-600 flex items-center px-8 md:px-16 overflow-hidden">
          <img v-if="profileStore.backgroundPreview" :src="profileStore.backgroundPreview" class="absolute inset-0 w-full h-full object-cover" />
          <div v-else class="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 animate-gradient-xy">
          </div>
          <div class="absolute inset-0 bg-black/10"></div>
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
            <div class="relative group">
              <div class="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <img v-if="profileStore.imagePreview" :src="profileStore.imagePreview" class="w-full h-full object-contain p-4" />
                <div v-else class="w-full h-full bg-slate-50 flex items-center justify-center text-indigo-600 font-black text-2xl">
                  LOGO
                </div>
              </div>
              <div v-if="profileStore.isEditing" class="absolute -bottom-2 -right-2">
                <label class="btn btn-circle btn-sm bg-white text-indigo-600 hover:bg-slate-100 border-none shadow-xl transition-all scale-110 ring-4 ring-indigo-600/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <input type="file" class="hidden" @change="profileStore.onImageSelected" accept="image/*" />
                </label>
              </div>
            </div>
            <div class="text-center md:text-left space-y-4 flex-1">
              <h2 class="text-3xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">
                {{ profileStore.RestaurantData.Name }}
              </h2>
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-5">
                <div class="px-5 py-2.5 rounded-2xl font-bold text-sm shadow-inner transition-all flex items-center gap-3"
                  :class="profileStore.RestaurantData.Status === 'open' ? 'bg-emerald-100 text-emerald-700' : profileStore.RestaurantData.Status === 'close' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
                  <span class="w-2.5 h-2.5 rounded-full"
                    :class="profileStore.RestaurantData.Status === 'open' ? 'bg-emerald-500' : profileStore.RestaurantData.Status === 'close' ? 'bg-red-500' : 'bg-blue-500'"></span>
                  {{ profileStore.RestaurantData.Status === 'open' ? 'เปิดบริการ' : profileStore.RestaurantData.Status
                    === 'close' ? 'ปิดบริการ' : 'อัตโนมัติ' }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="profileStore.isEditing" class="absolute top-6 right-6 z-20">
            <label class="btn btn-circle bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <input type="file" class="hidden" @change="profileStore.onCoverSelected" accept="image/*" />
            </label>
          </div>
        </div>
        <div class="pb-16 px-8 md:px-16 border-t border-slate-50 pt-12">
          <div class="md:hidden mb-8">
            <h2 class="text-2xl font-black text-slate-800">{{ profileStore.RestaurantData.Name }}</h2>
            <p class="text-slate-500 font-medium">{{ profileStore.RestaurantData.Phone }}</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="space-y-8">
              <div>
                <h3 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  ข้อมูลร้านอาหาร
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-control md:col-span-2">
                    <label class="label"><span class="label-text font-bold text-slate-500">ชื่อร้านอาหาร</span></label>
                    <input type="text" v-model="profileStore.RestaurantData.Name" disabled
                      class="input input-bordered w-full bg-slate-50 font-medium text-slate-600" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold text-slate-500">เบอร์โทรศัพท์</span></label>
                    <input type="text" v-model="profileStore.RestaurantData.Phone" :disabled="!profileStore.isEditing"
                      class="input input-bordered w-full transition-all focus:border-indigo-500" />
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold text-slate-500">ระยะทาง (กม.)</span></label>
                    <input type="number" v-model.number="profileStore.RestaurantData.Distance"
                      :disabled="!profileStore.isEditing"
                      class="input input-bordered w-full transition-all focus:border-indigo-500" />
                  </div>
                  <div class="form-control md:col-span-2">
                    <label class="label"><span class="label-text font-bold text-slate-500">ที่อยู่ร้าน</span></label>
                    <textarea v-model="profileStore.RestaurantData.Address" :disabled="!profileStore.isEditing"
                      class="textarea textarea-bordered w-full h-28 transition-all focus:border-indigo-500"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-8">
              <div>
                <h3 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                  เวลาเปิด-ปิดและสถานะ
                </h3>
                <div class="space-y-6">
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold text-slate-500">สถานะร้านปัจจุบัน</span></label>
                    <div class="grid grid-cols-3 gap-2">
                      <button v-for="status in [
                        { v: 'open', l: 'เปิดทันที', active: '!bg-emerald-500 !text-white shadow-lg shadow-emerald-200' },
                        { v: 'close', l: 'ปิดทันที', active: '!bg-red-500 !text-white shadow-lg shadow-red-200' },
                        { v: 'auto', l: 'อัตโนมัติ', active: '!bg-blue-500 !text-white shadow-lg shadow-blue-200' }
                      ]" :key="status.v" type="button" @click="profileStore.isEditing && (profileStore.RestaurantData.Status = status.v)"
                        class="btn btn-sm h-12 border-none transition-all duration-300 rounded-xl font-bold" 
                        :class="[
                          profileStore.RestaurantData.Status === status.v
                            ? status.active
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                          !profileStore.isEditing ? (profileStore.RestaurantData.Status === status.v ? 'cursor-default' : 'opacity-50 cursor-not-allowed') : ''
                        ]">
                        {{ status.l }}
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label"><span class="label-text font-bold text-slate-500">เวลาเปิด</span></label>
                      <input type="time" v-model="profileStore.RestaurantData.OpenTime"
                        :disabled="!profileStore.isEditing" class="input input-bordered w-full transition-all focus:border-indigo-500" />
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text font-bold text-slate-500">เวลาปิด</span></label>
                      <input type="time" v-model="profileStore.RestaurantData.CloseTime"
                        :disabled="!profileStore.isEditing" class="input input-bordered w-full transition-all focus:border-indigo-500" />
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label"><span class="label-text font-bold text-slate-500">วันเปิดให้บริการ</span></label>
                    <div class="flex flex-wrap gap-2">
                      <label v-for="day in profileStore.daysOfWeek" :key="day.value"
                        class="flex-1 min-w-[50px] text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm"
                        :class="[
                          profileStore.RestaurantData.OpenDays.includes(day.value)
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-slate-100 text-slate-300',
                          !profileStore.isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300'
                        ]">
                        <input type="checkbox" :value="day.value" v-model="profileStore.RestaurantData.OpenDays"
                          :disabled="!profileStore.isEditing" class="hidden" />
                        {{ day.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutRestaurant>
</template>

<style scoped>
@keyframes gradient-xy {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.animate-gradient-xy {
  background-size: 400% 400%;
  animation: gradient-xy 15s ease infinite;
}
</style>
