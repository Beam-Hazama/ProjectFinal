<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import MenuOrderModal from './modalmenu.vue';
import { useRestaurant } from '@/stores/Restaurant';

import { formatPrice } from '@/utils/format';
import { checkShopClosed } from '@/utils/restaurantHelper';

const props = defineProps({
  selectionRole: Array,
  layout: {
    type: String,
    default: 'vertical'
  },
  hideRestaurantName: {
    type: Boolean,
    default: false
  }
});

const RestaurantStore = useRestaurant();

const selectedMenu = ref(null);
const showModal = ref(false);
const now = ref(new Date());
let timer;

onMounted(() => {
  RestaurantStore.loadListRestaurant();
  timer = setInterval(() => {
    now.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const sortedMenus = computed(() => {
  if (!props.selectionRole) return [];

  return [...props.selectionRole].sort((a, b) => {
    const aShop = RestaurantStore.list.find(r => r.Name === a.Restaurant);
    const bShop = RestaurantStore.list.find(r => r.Name === b.Restaurant);
    
    const aAvailable = a.Status === 'open' && !checkShopClosed(aShop, now.value);
    const bAvailable = b.Status === 'open' && !checkShopClosed(bShop, now.value);

    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return 0;
  });
});

const isShopClosed = (restaurantName) => {
  const shop = RestaurantStore.list.find(r => r.Name === restaurantName);
  return checkShopClosed(shop, now.value);
};

const openModal = (menu) => {
  if (menu.Status === 'open' && !isShopClosed(menu.Restaurant)) {
    selectedMenu.value = menu;
    showModal.value = true;
  }
};
</script>

<template>
  <section
    :class="layout === 'horizontal' ? 'flex flex-col gap-3 px-2 pb-4' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'">
    <button v-for="(menu, index) in sortedMenus" :key="menu.id"
      :class="[(menu.Status !== 'open' || isShopClosed(menu.Restaurant)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5', layout === 'horizontal' ? 'w-full flex text-left bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden transition-all duration-300 h-[100px]' : 'flex flex-col text-left bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300']"
      :disabled="menu.Status !== 'open' || isShopClosed(menu.Restaurant)" @click="openModal(menu)">


      <template v-if="layout === 'horizontal'">
        <figure
          class="w-[100px] h-full flex-shrink-0 relative bg-gray-100 flex items-center justify-center border-r border-gray-50">
          <img v-if="menu.ImageUrl" :src="menu.ImageUrl" class="object-cover w-full h-full"
            :class="{ 'grayscale': menu.Status !== 'open' || isShopClosed(menu.Restaurant) }" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div v-if="isShopClosed(menu.Restaurant)"
            class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white font-bold text-[10px] bg-gray-800/80 px-2 py-1 rounded-md shadow-sm">ร้านปิด</span>
          </div>
          <div v-else-if="menu.Status !== 'open'" class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white font-bold text-[10px] bg-red-500/90 px-2 py-1 rounded-md shadow-sm">หมด</span>
          </div>
        </figure>
        <div class="py-2 px-3 w-full flex flex-col justify-center flex-grow bg-white min-w-0">
          <h3 class="font-bold text-[15px] text-gray-800 leading-tight truncate w-full mb-0.5">{{ menu.Name }}</h3>

          <p v-if="!hideRestaurantName" class="text-[10px] text-gray-500 truncate w-full">{{ menu.Restaurant }}</p>
          <div class="flex justify-between items-end mt-auto pt-3">
            <div class="flex items-center gap-2">
              <p v-if="menu.PromoPrice && Number(menu.PromoPrice) > 0" class="font-black text-[15px] text-red-500">
                ฿{{ formatPrice(menu.PromoPrice) }}
              </p>
              <p class="font-bold text-[14px] text-gray-800"
                :class="{ 'line-through text-gray-400 text-[12px] font-normal': menu.PromoPrice && Number(menu.PromoPrice) > 0 }">
                ฿{{ formatPrice(menu.Price) }}
              </p>
            </div>
          </div>
        </div>
      </template>


      <template v-else>

        <div class="w-full aspect-square relative bg-gray-100 overflow-hidden">
          <img v-if="menu.ImageUrl" :src="menu.ImageUrl"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            :class="{ 'grayscale': menu.Status !== 'open' || isShopClosed(menu.Restaurant) }" />
          <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div v-if="isShopClosed(menu.Restaurant)"
            class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span class="text-white font-bold text-[10px] bg-gray-800/80 px-2 py-1 rounded-md shadow-sm">ร้านปิด</span>
          </div>

          <div v-else-if="menu.Status !== 'open'"
            class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span class="text-white font-bold text-[10px] bg-red-500/90 px-2 py-1 rounded-md shadow-sm">หมด</span>
          </div>
        </div>


        <div class="px-2.5 py-2 w-full flex flex-col justify-between flex-grow">
          <div class="space-y-0.5">
            <h3 class="font-bold text-[13px] text-gray-800 leading-tight line-clamp-2">{{ menu.Name }}</h3>
            <p v-if="!hideRestaurantName" class="text-[10px] text-gray-500 truncate w-full">{{ menu.Restaurant }}</p>
          </div>
          <div class="flex justify-between items-end mt-auto pt-3">
            <div class="flex flex-wrap items-center gap-1.5">
              <p v-if="menu.PromoPrice && Number(menu.PromoPrice) > 0" class="font-black text-[14px] text-red-500">
                ฿{{ formatPrice(menu.PromoPrice) }}
              </p>
              <p class="font-bold text-[13px] text-gray-800"
                :class="{ 'line-through text-gray-400 text-[11px] font-normal': menu.PromoPrice && Number(menu.PromoPrice) > 0 }">
                ฿{{ formatPrice(menu.Price) }}
              </p>
            </div>
          </div>
        </div>
      </template>

    </button>
  </section>

  <MenuOrderModal v-if="selectedMenu" :show="showModal" :menu="selectedMenu" @close="showModal = false" />
</template>
