<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useCartStore } from '@/stores/cartStore';
import { useQRCodeStore } from '@/stores/qrcode';
import { usePosterStore } from '@/stores/posterStore';
import { useCategoryStore } from '@/stores/categoryStore';

import RestaurantList from '@/page/component/RestaurantList.vue';
import BottomNavigation from '@/page/component/BottomNavigation.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cartStore = useCartStore();
import { useRestaurant } from '@/stores/Restaurant';
const restaurantStore = useRestaurant();
const qrStore = useQRCodeStore();
const posterStore = usePosterStore();
const categoryStore = useCategoryStore();

const isValidLocation = ref(false);
const isLoading = ref(true);

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const activeShopTab = ref('ร้านค้า');

// Carousel State
const currentSlide = ref(0);
let carouselTimeout = null;

const shopCategories = ['ร้านค้า', 'ตามสั่ง', 'ก๊วยเตี๋ยว', 'น้ำ'];

// Match the reference image
// We are now fetching categories dynamically through the categoryStore.
// The hardcoded `popularCategories` below is being replaced by `categoryStore.list`.

// We no longer need menuCategories here since it's showing restaurants

onMounted(async () => {
  const isValid = await qrStore.validateRoom(building, floor, room);
  isValidLocation.value = isValid;
  isLoading.value = false;

  if (isValid) {
    restaurantStore.loadListRestaurant();
    cartStore.loadcart(building, floor, room);
    posterStore.loadPosters();
    categoryStore.loadCategories();
    // Use a slight delay to ensure posters are loaded before starting carousel
    setTimeout(startCarousel, 500);
  }
});

onUnmounted(() => {
  stopCarousel();
});

const startCarousel = () => {
  stopCarousel();
  if (posterStore.activePosters?.length > 1) {
    const currentPoster = posterStore.activePosters[currentSlide.value];
    const durationMs = (currentPoster?.displayDuration || 5) * 1000;

    carouselTimeout = setTimeout(() => {
      nextSlide();
    }, durationMs);
  }
};

const stopCarousel = () => {
  if (carouselTimeout) {
    clearTimeout(carouselTimeout);
    carouselTimeout = null;
  }
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % posterStore.activePosters.length;
  startCarousel();
};

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0
    ? posterStore.activePosters.length - 1
    : currentSlide.value - 1;
  startCarousel();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  startCarousel(); // Reset timer on manual interaction
};

watch(() => posterStore.activePosters, (newVal) => {
  if (newVal && newVal.length > 0 && !carouselTimeout) {
    startCarousel();
  }
}, { deep: true });

watch(() => [route.params.building, route.params.floor, route.params.room], async ([newB, newF, newR]) => {
  if (newB && newF && newR) {
    isLoading.value = true;
    const isValid = await qrStore.validateRoom(newB, newF, newR);
    isValidLocation.value = isValid;
    isLoading.value = false;

    if (isValid) {
      cartStore.loadcart(newB, newF, newR);
    }
  }
});

// Wait directly for the restaurant list from store, no need to filter menus
const filteredRestaurants = computed(() => {
  return restaurantStore.list || [];
});

</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="loading loading-spinner loading-lg text-blue-600"></div>
  </div>

  <div v-else-if="!isValidLocation"
    class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
    <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-12 h-12 text-red-500">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    </div>
    <h2 class="text-2xl font-bold text-gray-800 mb-2">ไม่พบห้องนี้ในระบบ</h2>
    <p class="text-gray-500">กรุณาสแกน QR Code ใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ</p>
  </div>

  <div v-else class="min-h-screen bg-gray-50 pb-24 font-sans">

    <!-- Top Bar Location & Search (Matching Image 1) -->
    <div class="bg-white px-4 py-3 sticky top-0 z-40 border-b border-gray-100 shadow-sm">



      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <div @click="$router.push(`/user/search/${building}/${floor}/${room}`)"
          class="w-full bg-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-400 cursor-text">
          ค้นหาร้าน หรือ ชื่อเมนู
        </div>
      </div>
    </div>

    <!-- Dynamic Poster Carousel -->
    <div class="px-4 mt-4">
      <div v-if="posterStore.activePosters.length > 0" class="relative w-full rounded-xl shadow-sm overflow-hidden"
        @mouseenter="stopCarousel" @mouseleave="startCarousel">

        <!-- Slides container -->
        <div class="flex transition-transform duration-500 ease-out h-36"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="poster in posterStore.activePosters" :key="poster.id"
            class="w-full flex-shrink-0 h-full relative group">
            <img :src="poster.ImageUrl" class="object-cover w-full h-full" alt="Poster" />
          </div>
        </div>

        <!-- Controls (only show if > 1 poster) -->
        <div v-if="posterStore.activePosters.length > 1"
          class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
          <button @click="prevSlide"
            class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❮</button>
          <button @click="nextSlide"
            class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❯</button>
        </div>

        <!-- Pagination dots -->
        <div v-if="posterStore.activePosters.length > 1"
          class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          <button v-for="(_, index) in posterStore.activePosters" :key="'dot-' + index" @click="goToSlide(index)"
            :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentSlide === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80']">
          </button>
        </div>
      </div>

      <!-- Fallback Default Banner -->
      <div v-else class="relative w-full h-36 rounded-xl overflow-hidden shadow-sm group">
        <img class="object-cover w-full h-full transform transition-transform duration-500"
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&fit=crop" alt="Banner" />
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center p-4">
          <div class="text-left w-2/3">
            <span
              class="inline-block px-2 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded mb-1">รวมร้าน</span>
            <h2 class="text-white text-2xl font-black leading-tight tracking-tight shadow-sm">ส่งฟรี!</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Categories -->
    <div class="mt-4 bg-white py-4 px-4 shadow-sm border-y border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[14px] font-bold text-gray-800">หมวดหมู่ยอดนิยม</h3>
      </div>
      <div class="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-1">
        <div v-for="cat in categoryStore.list" :key="cat.id"
          @click="$router.push(`/user/category/${cat.name}/${building}/${floor}/${room}`)"
          class="flex flex-col items-center cursor-pointer group flex-shrink-0 w-20">
          <div class="w-full aspect-[3/4] rounded-xl bg-gray-100 overflow-hidden relative shadow-sm">
            <img :src="cat.ImageUrl" :alt="cat.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          </div>
          <span
            class="mt-1.5 text-[11px] font-medium text-gray-800 leading-tight group-hover:text-blue-600 px-1 text-center">
            {{ cat.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Restaurant List -->
    <div id="restaurant-section" class="mt-4 bg-white shadow-sm border-t border-gray-100 pt-5 pb-10 min-h-[500px]">
      <div class="px-4 mb-3">
        <h3 class="text-[14px] font-bold text-gray-800">ร้านค้า</h3>
      </div>

      <!-- Restaurant Grid -->
      <div class="px-4">
        <div v-if="filteredRestaurants.length > 0" class="animate-fade-in">
          <RestaurantList :building="building" :floor="floor" :room="room"></RestaurantList>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
          <span class="text-4xl opacity-50 mb-2">🏪</span>
          <p class="text-[13px] font-medium">ไม่พบร้านค้าในขณะนี้</p>
        </div>
      </div>
    </div>



    <BottomNavigation :building="building" :floor="floor" :room="room" />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>