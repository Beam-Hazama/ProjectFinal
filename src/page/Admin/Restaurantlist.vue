<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useRestaurant } from '@/stores/Restaurant';

const restaurantStore = useRestaurant();

const now = ref(new Date());
let timer;

onMounted(async () => {
  await restaurantStore.loadListRestaurant();

  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
};

const formatOpenDays = (days) => {
  if (!days || !days.length) return '-';
  if (days.length === 7) return 'ทุกวัน';
  const shortDays = {
    'Sunday': 'อา.',
    'Monday': 'จ.',
    'Tuesday': 'อ.',
    'Wednesday': 'พ.',
    'Thursday': 'พฤ.',
    'Friday': 'ศ.',
    'Saturday': 'ส.'
  };
  return days.map(d => shortDays[d] || d).join(', ');
};

const getAutoStatus = (restaurant) => {
  if (restaurant.ManualStatus === 'manual') return restaurant.Status;
  if (!restaurant.OpenTime || !restaurant.CloseTime) return 'close';

  try {
    const currentTime = now.value.getHours() * 60 + now.value.getMinutes();
    const [openH, openM] = restaurant.OpenTime.split(':').map(Number);
    const [closeH, closeM] = restaurant.CloseTime.split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (closeMin > openMin) {
      return (currentTime >= openMin && currentTime < closeMin) ? 'open' : 'close';
    } else {
      return (currentTime >= openMin || currentTime < closeMin) ? 'open' : 'close';
    }
  } catch (e) {
    return 'close';
  }
};

const deleteRestaurant = async (id, name) => {
  if (confirm(`คุณต้องการลบร้านอาหาร "${name}" ใช่หรือไม่?`)) {
    try {
      await deleteDoc(doc(db, 'Restaurant', id));
      await restaurantStore.loadListRestaurant();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("ลบไม่สำเร็จ: " + error.message);
    }
  }
};
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <div class="text-3xl font-bold text-slate-700">Restaurant List</div>
        <RouterLink to="/Admin/Restaurant/Addrestaurant"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Restaurant
        </RouterLink>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">RESTAURANT</th>
                <th class="text-center">STATUS</th>
                <th class="text-center">OPEN-CLOSE</th>
                <th class="text-center">OPEN DAYS</th>
                <th class="text-center">CREATED AT</th>
                <th class="text-center">UPDATED AT</th>
                <th class="text-center">ACTION</th>
              </tr>
            </thead>

            <tbody class="text-slate-600">
              <tr v-for="restaurant in restaurantStore.list" :key="restaurant.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                        <img v-if="restaurant.ImageUrl" :src="restaurant.ImageUrl" :alt="restaurant.Name" class="object-cover" />
                        <div v-else class="flex items-center justify-center h-full text-[10px] text-slate-400">No Image</div>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ restaurant.Name }}</div>
                    </div>
                  </div>
                </td>

                <td class="text-center">
                  <div v-if="getAutoStatus(restaurant) === 'open'"
                    class="badge badge-success gap-1 text-[10px] text-white font-bold border-none mx-auto whitespace-nowrap flex-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0"></span>
                    Open Now
                  </div>
                  <div v-else class="badge badge-error gap-1 text-[10px] text-white font-bold border-none mx-auto whitespace-nowrap flex-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    Closed
                  </div>
                </td>

                <td class="text-center">
                  <div v-if="restaurant.OpenTime && restaurant.CloseTime"
                    class="flex items-center justify-center gap-1 text-xs font-semibold text-slate-600">
                    {{ restaurant.OpenTime }} - {{ restaurant.CloseTime }}
                  </div>
                  <div v-else class="text-xs text-slate-400 italic">ไม่ได้ระบุเวลา</div>
                </td>

                <td class="text-center text-xs font-medium text-slate-600">
                  {{ formatOpenDays(restaurant.OpenDays) }}
                </td>

                <td class="text-center text-xs font-medium">{{ formatTimestamp(restaurant.CreatedAt) }}</td>
                <td class="text-center text-xs font-medium">{{ formatTimestamp(restaurant.UpdatedAt) }}</td>

                <td class="text-center">
                  <div class="flex justify-center items-center gap-2">
                    <RouterLink :to="{ name: 'Admin Restaurant Detail', params: { name: restaurant.Name } }"
                      class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Details
                    </RouterLink>
                    <button @click="deleteRestaurant(restaurant.id, restaurant.Name)"
                      class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>
