<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@/stores/menuStore';
import { useCartStore } from '@/stores/cartStore';
import { useQrcodeStore } from '@/stores/admin/qrcode';
import { usePosterStore } from '@/stores/posterStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useRestaurant } from '@/stores/Restaurant';

import RestaurantList from '@/page/component/RestaurantList.vue';
import MenuList from '@/page/component/blockmenu.vue';
import BottomNavigation from '@/page/User/BottomNavigation.vue';
import MenuOrderModal from '@/page/component/modalmenu.vue';
import Poster from '@/page/User/components/user/Poster.vue';

const route = useRoute();
const restaurantStore = useRestaurant();
const menuStore = useMenuStore();
const cartStore = useCartStore();
const qrStore = useQrcodeStore();
const posterStore = usePosterStore();
const categoryStore = useCategoryStore();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const isValidLocation = ref(false);
const isLoading = ref(true);
const isError = ref(false);
const errorMessage = ref('');
const localCategories = ref([]);
const selectedMenu = ref(null);
const showModal = ref(false);
const selectedRestaurantCategories = ref([]);
const showFilterSheet = ref(false);
const isFilterPromoOnly = ref(false);



const displayLocation = computed(() => {
  return `ห้อง ${room} ชั้น ${floor} ตึก ${building}`;
});

const filteredRestaurants = computed(() => {
  return restaurantStore.list || [];
});

const filteredMenus = computed(() => {
  return menuStore.list || [];
});

const promotionMenus = computed(() => {
  return (menuStore.list || []).filter(item => {
    if (!item.PromoPrice || Number(item.PromoPrice) <= 0) return false;
    if (item.Status && item.Status !== 'open') return false;
    return !isShopClosed(item.Restaurant);
  });
});

const activeCategories = computed(() => {
  return localCategories.value.filter(cat => {
    return (menuStore.list || []).some(item => {
      if (isShopClosed(item.Restaurant)) return false;
      const matchesCategory = (item.Category && item.Category === cat.name) ||
        (item.role && (Array.isArray(item.role) ? item.role.includes(cat.name) : item.role === cat.name)) ||
        (item.Name && item.Name.includes(cat.name));
      return matchesCategory;
    });
  });
});

onMounted(async () => {
  await loadAllData();
});

const loadAllData = async () => {
  try {
    isLoading.value = true;
    isError.value = false;
    errorMessage.value = '';

    const isValid = await qrStore.validateRoom(building, floor, room);
    isValidLocation.value = isValid;

    if (isValid) {
      await Promise.all([
        restaurantStore.loadListRestaurant(),
        menuStore.loadMenu(),
        cartStore.loadCart(building, floor, room),
        posterStore.loadPosters(),
        categoryStore.loadCategories()
      ]);
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    isError.value = true;
    errorMessage.value = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  } finally {
    isLoading.value = false;
  }
};

onUnmounted(() => {

  restaurantStore.clearListener();
  menuStore.clearListener();
  posterStore.clearListener();
  categoryStore.clearListener();
});

watch(() => categoryStore.list, (newList) => {
  localCategories.value = [...(newList || [])];
}, { deep: true, immediate: true });



watch(() => [route.params.building, route.params.floor, route.params.room], async ([newB, newF, newR]) => {
  if (newB && newF && newR) {
    isLoading.value = true;
    const isValid = await qrStore.validateRoom(newB, newF, newR);
    isValidLocation.value = isValid;
    isLoading.value = false;

    if (isValid) {
      cartStore.loadCart(newB, newF, newR);
    }
  }
});



const openMenuModal = (menu) => {
  selectedMenu.value = menu;
  showModal.value = true;
};

function isShopClosed(restaurantName) {
  const shop = restaurantStore.list.find(r => r.Name === restaurantName);
  if (!shop) return true;
  if (shop.Status === 'close') return true;
  if (shop.Status === 'open') return false;

  if (!shop.OpenTime || !shop.CloseTime) return true;

  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDayName = now.toLocaleString('en-US', { weekday: 'long' });

    if (shop.OpenDays && !shop.OpenDays.includes(currentDayName)) {
      return true;
    }

    const [openH, openM] = shop.OpenTime.split(':').map(Number);
    const [closeH, closeM] = shop.CloseTime.split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (closeMin > openMin) {
      return !(currentTime >= openMin && currentTime < closeMin);
    } else {
      return !(currentTime >= openMin || currentTime < closeMin);
    }
  } catch (e) {
    return true;
  }
};

const resetFilters = () => {
  isFilterPromoOnly.value = false;
  selectedRestaurantCategories.value = [];
};

const toggleCategory = (name) => {
  if (name === '') {
    selectedRestaurantCategories.value = [];
    return;
  }
  const index = selectedRestaurantCategories.value.indexOf(name);
  if (index > -1) {
    selectedRestaurantCategories.value.splice(index, 1);
  } else {
    selectedRestaurantCategories.value.push(name);
  }
};

const applyFilters = () => {
  showFilterSheet.value = false;
};
</script>

<template>

  <div v-if="isLoading"
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
    <p class="text-slate-500 font-medium animate-pulse">กำลังเตรียมความอร่อย...</p>
  </div>

  <div v-else-if="isError"
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
    <div class="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 class="text-xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
    <p class="text-slate-500 mb-6">{{ errorMessage }}</p>
    <button @click="loadAllData"
      class="btn bg-blue-600 hover:bg-blue-700 text-white border-none px-8 rounded-xl shadow-lg shadow-blue-200">
      ลองใหม่อีกครั้ง
    </button>
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


    <Poster />


    <div class="mt-4 pb-2">
      <div class="flex items-center justify-between mb-3 px-5">
        <h3 class="text-[14px] font-bold text-gray-800">หมวดหมู่ยอดนิยม</h3>
        <button @click="$router.push(`/user/all-categories/${building}/${floor}/${room}`)"
          class="text-[12px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all">ทั้งหมด</button>
      </div>
      <div class="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-4">
        <div v-for="cat in activeCategories" :key="cat.id"
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


    <div v-if="promotionMenus.length > 0">
      <div class="px-5 mb-3 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-gray-800">โปรโมชั่น</h3>
        <button @click="$router.push(`/user/all-promotions/${building}/${floor}/${room}`)"
          class="text-[12px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all">ทั้งหมด</button>
      </div>
      <div class="flex overflow-x-auto gap-3 pb-6 no-scrollbar px-4">
        <div v-for="menu in promotionMenus" :key="menu.id" @click="openMenuModal(menu)"
          class="flex-shrink-0 w-[150px] bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 overflow-hidden group transition-all duration-300 active:scale-95 cursor-pointer">
          <div class="h-[110px] w-full relative">
            <img :src="menu.ImageUrl || 'https://placehold.co/150'" class="object-cover w-full h-full"
              alt="Menu Image" />
          </div>
          <div class="p-2.5">
            <div class="flex justify-between items-start">
              <div class="flex flex-col min-w-0 pr-2">
                <h4 class="text-[12px] font-bold text-slate-800 truncate leading-tight">{{ menu.Name }}</h4>
                <p class="text-[9px] text-slate-400 truncate mt-0.5 leading-tight">{{ menu.Restaurant }}</p>
              </div>
              <div class="flex flex-col items-end shrink-0">
                <span class="text-[14px] font-black text-red-500 leading-tight">฿{{ menu.PromoPrice.toLocaleString()
                }}</span>
                <span class="text-[10px] text-slate-300 line-through leading-tight">฿{{ menu.Price.toLocaleString()
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div id="restaurant-section">
      <div class="px-5 mb-4 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-gray-800">ร้านอาหาร</h3>

        <div
          class="flex items-center gap-1.5 text-[12px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          @click="showFilterSheet = true">
          <span>ตัวกรอง</span>
        </div>
      </div>


      <Teleport to="body">
        <div v-if="showFilterSheet" class="fixed inset-0 z-[100] flex items-end justify-center">

          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
            @click="showFilterSheet = false">
          </div>


          <div
            class="relative w-full max-w-lg bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 transform translate-y-0 flex flex-col max-h-[90vh]"
            :class="showFilterSheet ? 'translate-y-0' : 'translate-y-full'">


            <div class="px-6 py-4 flex justify-between items-center border-b border-gray-50">
              <h2 class="text-xl font-bold text-gray-800">ตัวกรอง</h2>
              <button @click="showFilterSheet = false" class="p-2 text-gray-400 hover:text-gray-600 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>


            <div class="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-32">


              <div class="space-y-6 mb-8">
                <div class="flex justify-between items-center group cursor-pointer"
                  @click="isFilterPromoOnly = !isFilterPromoOnly">
                  <div class="flex flex-col">
                    <span class="text-base font-bold text-gray-800">โปรโมชั่น</span>
                    <span class="text-sm text-gray-500 font-medium mt-0.5">ค้นหาร้านที่มีส่วนลดพิเศษ</span>
                  </div>
                  <input type="checkbox" v-model="isFilterPromoOnly"
                    class="checkbox checkbox-primary rounded-md w-6 h-6 border-2" />
                </div>
              </div>


              <div class="mb-8">
                <h3 class="text-base font-bold text-gray-800 mb-4">ประเภทอาหาร</h3>
                <div class="flex flex-wrap gap-2">

                  <button @click="toggleCategory('')" :class="[
                    'px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-200',
                    selectedRestaurantCategories.length === 0
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'
                  ]">
                    ทั้งหมด
                  </button>


                  <button v-for="cat in activeCategories" :key="'sheet-' + cat.id" @click="toggleCategory(cat.name)"
                    :class="[
                      'px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all duration-200',
                      selectedRestaurantCategories.includes(cat.name)
                        ? 'bg-blue-50 border-blue-500 text-blue-600 font-black'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'
                    ]">
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </div>


            <div
              class="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-50 flex gap-4">
              <button @click="resetFilters"
                class="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-[15px] active:scale-95 transition-all hover:bg-gray-200">
                ล้างค่า
              </button>
              <button @click="applyFilters"
                class="flex-[1.5] py-4 rounded-xl bg-blue-600 text-white font-bold text-[15px] active:scale-95 transition-all hover:bg-blue-700 shadow-lg shadow-blue-200">
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="px-4">
        <div v-if="filteredRestaurants.length > 0" class="animate-fade-in">
          <RestaurantList :building="building" :floor="floor" :room="room"
            :categoryFilter="selectedRestaurantCategories" :promoOnly="isFilterPromoOnly">
          </RestaurantList>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
          <span class="text-4xl opacity-50 mb-2">🏪</span>
          <p class="text-[13px] font-medium">ไม่พบร้านอาหารในขณะนี้</p>
        </div>
      </div>
    </div>


    <BottomNavigation :building="building" :floor="floor" :room="room" />
    <MenuOrderModal v-if="selectedMenu" :show="showModal" :menu="selectedMenu" @close="showModal = false" />
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
