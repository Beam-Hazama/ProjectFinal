<script setup>
import { ref, onMounted, computed } from 'vue';
import { useNow } from '@/composables/useNow';
import MenuOrderModal from './ModalMenu.vue';
import { useRestaurant } from '@/stores/shared/restaurant';

import { formatPrice } from '@/utils/format';

const props = defineProps({
  selectionRole: Array
});

const restaurantStore = useRestaurant();
const { now } = useNow();

const selectedMenu = ref(null);
const showModal = ref(false);

onMounted(() => {
  restaurantStore.loadRestaurants();
});

// เมนูตัวนี้สั่งซื้อได้ไหม (ทั้ง Status เมนู + ร้านปิดหรือไม่)
const isMenuAvailable = (menu) => {
  if (menu.Status !== 'open') return false;
  return !restaurantStore.isShopClosedByName(menu.RestaurantName, now.value);
};

// ร้านของเมนูนี้ปิดอยู่หรือไม่ (ใช้แสดง overlay "ร้านปิด" ใน template)
const isShopClosed = (menu) => {
  return restaurantStore.isShopClosedByName(menu.RestaurantName, now.value);
};

const openModal = (menu) => {
  if (isMenuAvailable(menu)) {
    selectedMenu.value = menu;
    showModal.value = true;
  }
};

// เรียงเมนู: ที่เปิดอยู่ก่อน, ที่ปิดอยู่ตามหลัง (โดยซ่อนเมนูที่ร้านปิดแล้ว)
const sortedMenus = computed(() => {
  if (!props.selectionRole) return [];
  return [...props.selectionRole]
    .filter(menu => !isShopClosed(menu))
    .sort((a, b) => isMenuAvailable(b) - isMenuAvailable(a));
});
</script>

<template>
  <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    <button v-for="menu in sortedMenus" :key="menu.MenuId"
      :class="[(!isMenuAvailable(menu)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5', 'flex flex-col text-left bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300']"
      :disabled="!isMenuAvailable(menu)" @click="openModal(menu)">
        <div class="w-full aspect-square relative bg-gray-100 overflow-hidden">
          <img v-if="menu.ImageUrl" :src="menu.ImageUrl"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            :class="{ 'grayscale': !isMenuAvailable(menu) }" />
          <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div v-if="isShopClosed(menu)" class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span class="text-white font-bold text-[10px] bg-gray-800/80 px-2 py-1 rounded-md shadow-sm">ร้านปิด</span>
          </div>
          <div v-else-if="menu.Status !== 'open'" class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span class="text-white font-bold text-[10px] bg-red-500/90 px-2 py-1 rounded-md shadow-sm">หมด</span>
          </div>
        </div>
        <div class="px-2.5 py-2 w-full flex flex-col justify-between flex-grow">
          <div class="space-y-0.5">
            <h3 class="font-bold text-[13px] text-gray-800 leading-tight line-clamp-2">{{ menu.MenuName }}</h3>
            <p class="text-[10px] text-gray-500 truncate w-full">{{ menu.RestaurantName }}</p>
          </div>
          <div class="flex justify-between items-end mt-auto pt-3">
            <div class="flex flex-wrap items-center gap-1.5">
              <p v-if="menu.PromoPrice && Number(menu.PromoPrice) > 0" class="font-black text-[14px] text-red-500"> ฿{{ formatPrice(menu.PromoPrice) }} </p>
              <p class="font-bold text-[13px] text-gray-800" :class="{ 'line-through text-gray-400 text-[11px] font-normal': menu.PromoPrice && Number(menu.PromoPrice) > 0 }">
                ฿{{ formatPrice(menu.Price) }}
              </p>
            </div>
          </div>
        </div>
    </button>
  </section>
  <MenuOrderModal v-if="selectedMenu" :show="showModal" :menu="selectedMenu" @close="showModal = false; selectedMenu = null" />
</template>
