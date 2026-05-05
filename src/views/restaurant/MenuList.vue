<script setup>
import { formatTimestamp } from '@/utils/format';
import { onMounted, onUnmounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { doc, updateDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '@/firebase';
import { useMenuStore } from '@/stores/shared/menu';
import { useAccountStore } from '@/stores/auth';
import LayoutRestaurant from '@/views/restaurant/RestaurantLayout.vue';

const MenuStore = useMenuStore();
const accountStore = useAccountStore();

onMounted(() => {
    loadData();
});

watch(() => accountStore.user, (newUser) => {
    if (newUser?.Restaurant) {
        loadData();
    }
});

onUnmounted(() => {
    MenuStore.clearListener();
});

const loadData = async () => {
    const restaurantName = accountStore.user?.Restaurant;
    if (!restaurantName) {
        console.warn("No restaurant found in account");
        return;
    }
    await MenuStore.loadMenu(restaurantName);
};

const switchStatus = async (menu) => {
    try {
        const newStatus = menu.Status === 'open' ? 'close' : 'open';
        const menuRef = doc(db, 'Menu', menu.id);

        await updateDoc(menuRef, {
            Status: newStatus,
            UpdatedAt: serverTimestamp(),
            status: deleteField(),
            updatedAt: deleteField()
        });
    } catch (error) {
        console.error("Error updating status:", error);
    }
};

const deleteMenu = async (id) => {
    try {
        const menuRef = doc(db, 'Menu', id);
        await deleteDoc(menuRef);
    } catch (error) {
        console.error("Error deleting menu:", error);
    }
};

</script>

<template>
  <LayoutRestaurant>
    <div class="p-6">      
      <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <div class="text-3xl font-bold text-slate-700">Menu List</div>
        </div>
        <RouterLink :to="{ name: 'Restaurant Add Menu' }"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Menu
        </RouterLink>
      </div>      
      <!-- Loading State -->
      <div v-if="MenuStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-emerald-500 mb-4"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลเมนู...</p>
      </div>
      <div v-else class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">MENU</th>
                <th class="text-center">PRICE</th>
                <th class="text-center">CATEGORY</th>
                <th class="text-center">STATUS</th>
                <th class="text-center">CREATED AT</th>
                <th class="text-center">UPDATED AT</th>
                <th class="text-center">ACTION</th>
              </tr>
            </thead>
            <tbody class="text-slate-600">
              <tr v-for="menu in MenuStore.list" :key="menu.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                        <img :src="menu.ImageUrl || 'https://placehold.co/150'" class="object-cover" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ menu.Name }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-center font-medium">{{ menu.Price }} ฿</td>
                <td class="text-center">
                  <div class="font-medium">{{ menu.Category }}</div>
                </td>
                <td class="text-center">
                  <button @click="switchStatus(menu)"
                    class="badge gap-1 text-[10px] text-white font-bold border-none mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap"
                    :class="menu.Status === 'open' ? 'badge-success' : 'badge-error'">
                    <span class="w-1.5 h-1.5 rounded-full bg-white" :class="{ 'animate-pulse': menu.Status === 'open' }"></span>
                    {{ menu.Status === 'open' ? 'Open Now' : 'Closed' }}
                  </button>
                </td>
                <td class="text-center text-xs whitespace-nowrap">
                  {{ formatTimestamp(menu.CreatedAt || menu.createdAt) }}
                </td>
                <td class="text-center text-xs whitespace-nowrap">
                  {{ formatTimestamp(menu.UpdatedAt || menu.updatedAt) }}
                </td>
                <td class="text-center">
                  <div class="flex justify-center items-center gap-1">
                    <RouterLink class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50" :to="{ name: 'Restaurant Edit Menu', params: { id: menu.id } }">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </RouterLink>

                    <button @click="deleteMenu(menu.id)" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!MenuStore.list || MenuStore.list.length === 0">
                <td colspan="8" class="text-center py-10 text-slate-400 font-medium italic">ไม่พบข้อมูลเมนูอาหาร</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutRestaurant>
</template>
