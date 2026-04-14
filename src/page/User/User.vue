<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useCartStore } from '@/stores/cartStore';
import { useQRCodeStore } from '@/stores/qrcode';
import { usePosterStore } from '@/stores/posterStore';
import { useCategoryStore } from '@/stores/categoryStore';

import RestaurantList from '@/page/component/RestaurantList.vue';
import ProductList from '@/page/component/blockmenu.vue';
import BottomNavigation from '@/page/component/BottomNavigation.vue';
import MenuOrderModal from '@/page/component/modalmenu.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cartStore = useCartStore();
import { useRestaurant } from '@/stores/Restaurant';
const restaurantStore = useRestaurant();
const menuStore = useMenuStore();
const qrStore = useQRCodeStore();
const posterStore = usePosterStore();
const categoryStore = useCategoryStore();

const localCategories = ref([]);

watch(() => categoryStore.list, (newList) => {
  localCategories.value = [...(newList || [])];
}, { deep: true, immediate: true });

const isValidLocation = ref(false);
const isLoading = ref(true);

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const currentSlide = ref(0);
let carouselTimeout = null;

const selectedProduct = ref(null);
const showModal = ref(false);

const isShopClosed = (restaurantName) => {
  const shop = restaurantStore.list.find(r => r.Name === restaurantName);
  return shop?.Status === 'close';
};

const openProductModal = (product) => {
  // Always set the product and show the modal to ensure it opens
  // Availability checks can be handled inside the modal if needed
  selectedProduct.value = product;
  showModal.value = true;
};



onMounted(async () => {
  const isValid = await qrStore.validateRoom(building, floor, room);
  isValidLocation.value = isValid;
  isLoading.value = false;

  if (isValid) {
    restaurantStore.loadListRestaurant();
    menuStore.loadMenu();
    cartStore.loadcart(building, floor, room);
    posterStore.loadPosters();
    categoryStore.loadCategories();

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
  startCarousel();
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


const filteredRestaurants = computed(() => {
  return restaurantStore.list || [];
});

const filteredProducts = computed(() => {
  return menuStore.list || [];
});

const promotionProducts = computed(() => {
  return (menuStore.list || []).filter(item => item.PromoPrice && Number(item.PromoPrice) > 0);
});
const displayLocation = computed(() => {
  return `ห้อง ${room} ชั้น ${floor} ตึก ${building}`;
});

</script>

<template>
  <div v-if="isLoading"
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="loading loading-spinner loading-lg text-blue-600"></div>
  </div>

  <div v-else-if="!isValidLocation"
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
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

  <div v-else class="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans">

    <!-- Location Header -->
    <div class="px-5 pt-6 pb-2">
      <div class="flex items-center gap-2.5">
        <div class="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-[9px] uppercase font-black tracking-widest text-blue-500/60 leading-none mb-0.5">Your
            Location</span>
          <span class="text-[15px] font-black text-slate-800 leading-tight">{{ displayLocation }}</span>
        </div>
      </div>
    </div>


    <div class="px-4 py-3">



      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <div @click="$router.push(`/user/search/${building}/${floor}/${room}`)"
          class="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-400 cursor-text">
          ค้นหาร้าน หรือ ชื่อเมนู
        </div>
      </div>
    </div>


    <div class="px-4 mt-4">
      <div v-if="posterStore.activePosters.length > 0" class="relative w-full rounded-xl shadow-sm overflow-hidden"
        @mouseenter="stopCarousel" @mouseleave="startCarousel">


        <div class="flex transition-transform duration-500 ease-out h-36"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="poster in posterStore.activePosters" :key="poster.id"
            class="w-full flex-shrink-0 h-full relative group">
            <img :src="poster.ImageUrl" class="object-cover w-full h-full" alt="Poster" />
          </div>
        </div>


        <div v-if="posterStore.activePosters.length > 1"
          class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
          <button @click="prevSlide"
            class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❮</button>
          <button @click="nextSlide"
            class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❯</button>
        </div>


        <div v-if="posterStore.activePosters.length > 1"
          class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          <button v-for="(_, index) in posterStore.activePosters" :key="'dot-' + index" @click="goToSlide(index)"
            :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentSlide === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80']">
          </button>
        </div>
      </div>
    </div>


    <!-- Popular Categories Section -->
    <div class="mt-4 pb-2">
      <div class="flex items-center justify-between mb-3 px-5">
        <h3 class="text-[14px] font-bold text-gray-800">หมวดหมู่ยอดนิยม</h3>
        <button @click="$router.push(`/user/all-categories/${building}/${floor}/${room}`)" 
          class="text-[12px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all">ทั้งหมด</button>
      </div>
      <div class="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-4">
        <div v-for="cat in localCategories" :key="cat.id"
          @click="$router.push(`/user/category/${cat.name}/${building}/${floor}/${room}`)"
          class="flex flex-col items-center cursor-pointer group flex-shrink-0 w-[100px] sm:w-[110px]">
          <div
            class="w-full aspect-[2.8/4] rounded-[10px] bg-gray-100 overflow-hidden relative shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
            <img :src="cat.ImageUrl" :alt="cat.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          </div>
          <span
            class="mt-2.5 text-[13px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 px-1 text-center">
            {{ cat.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Promotion Section -->
    <div v-if="promotionProducts.length > 0">
      <div class="px-5 mb-3 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-gray-800">โปรโมชั่น</h3>
        <button @click="$router.push(`/user/all-promotions/${building}/${floor}/${room}`)" 
          class="text-[12px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all">ทั้งหมด</button>
      </div>
      <div class="flex overflow-x-auto gap-3 pb-6 no-scrollbar px-4">
        <div v-for="product in promotionProducts" :key="product.id"
          @click="openProductModal(product)"
          class="flex-shrink-0 w-[150px] bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 overflow-hidden group transition-all duration-300 active:scale-95 cursor-pointer">
          <div class="h-[110px] w-full relative">
            <img :src="product.ImageUrl || 'https://via.placeholder.com/150'" class="w-full h-full object-cover" />

          </div>
          <div class="p-2.5">
            <div class="flex justify-between items-start">
              <div class="flex flex-col min-w-0 pr-2">
                <h4 class="text-[12px] font-bold text-slate-800 truncate leading-tight">{{ product.Name }}</h4>
                <p class="text-[9px] text-slate-400 truncate mt-0.5 leading-tight">{{ product.Restaurant }}</p>
              </div>
              <div class="flex flex-col items-end shrink-0">
                <span class="text-[14px] font-black text-red-500 leading-tight">฿{{ product.PromoPrice.toLocaleString()
                }}</span>
                <span class="text-[10px] text-slate-300 line-through leading-tight">฿{{ product.Price.toLocaleString()
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div id="restaurant-section">
      <div class="px-5 mb-3">
        <h3 class="text-[14px] font-bold text-gray-800">ร้านอาหาร</h3>
      </div>

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


    <div id="product-section">
      <div class="px-5 mb-3 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-gray-800">เมนูอาหาร</h3>
      </div>

      <div class="px-4">
        <div v-if="filteredProducts.length > 0" class="animate-fade-in">
          <ProductList :selectionRole="filteredProducts" layout="horizontal" />
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
          <span class="text-4xl opacity-50 mb-2">🍽️</span>
          <p class="text-[13px] font-medium">ไม่พบเมนูอาหาร</p>
        </div>
      </div>
    </div>




    <BottomNavigation :building="building" :floor="floor" :room="room" />

    <MenuOrderModal v-if="selectedProduct" :show="showModal" :product="selectedProduct" @close="showModal = false" />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;

  scrollbar-width: none;

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