<script setup>
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useMenuStore } from '@/stores/menuStore';

const menuStore = useMenuStore();

onMounted(() => {
  menuStore.loadMenu();
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString('th-TH');
  }
  return new Date(timestamp).toLocaleString('th-TH');
};
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      
      <div class="flex justify-between items-start mb-7">
        <h1 class="text-3xl font-bold text-slate-700">Menu List</h1>
      </div>

      
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">MENU</th>
                <th class="text-center">RESTAURANT</th>
                <th class="text-center">PRICE</th>
                <th class="text-center">CATEGORY</th>
                <th class="text-center">STATUS</th>
                <th class="text-center">CREATED AT</th>
                <th class="text-center">UPDATED AT</th>
                <th class="text-center">ACTION</th>
              </tr>
            </thead>

            
            <tbody class="text-slate-600">
              <tr v-for="menu in menuStore.list" :key="menu.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">

                
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                        <img :src="menu.ImageUrl || 'https://via.placeholder.com/150'" class="object-cover"
                          :alt="menu.Name" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ menu.Name }}</div>
                    </div>
                  </div>
                </td>

                
                <td class="text-center">
                  <div class="font-medium">{{ menu.Restaurant }}</div>
                </td>

                
                <td class="text-center font-medium">{{ menu.Price }} ฿</td>

                
                <td class="text-center">
                  <div class="font-medium">{{ menu.Category }}</div>
                </td>

                
                <td class="text-center">
                  <div v-if="menu.Status === 'open'"
                    class="badge badge-success gap-1 text-[10px] text-white font-bold border-none mx-auto whitespace-nowrap flex-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0"></span>
                    Open Now
                  </div>
                  <div v-else class="badge badge-error gap-1 text-[10px] text-white font-bold border-none mx-auto whitespace-nowrap flex-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    Closed
                  </div>
                </td>

                
                <td class="text-center text-xs">
                  {{ formatTimestamp(menu.CreatedAt) }}
                </td>
                <td class="text-center text-xs">
                  {{ formatTimestamp(menu.UpdatedAt) }}
                </td>

                
                <td class="text-center">
                  <div class="flex justify-center items-center gap-2">
                    <RouterLink :to="{ name: 'Admin menu detail', params: { name: menu.Name } }"
                      class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Details
                    </RouterLink>
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
