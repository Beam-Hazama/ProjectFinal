<script setup>
import { onMounted, ref, watch } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useCartStore } from '@/stores/cartStore';
import { useQRCodeStore } from '@/stores/qrcode';

import product from '@/page/component/blockmenu.vue';
import BottomNavigation from '@/page/component/BottomNavigation.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cartStore = useCartStore();
const menu = useMenuStore();
const qrStore = useQRCodeStore();

const isValidLocation = ref(false);
const isLoading = ref(true);

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const activeShopTab = ref('ร้านค้า');
const activeMenuTab = ref('แนะนำ');

const shopCategories = ['ร้านค้า', 'ตามสั่ง', 'ก๊วยเตี๋ยว', 'น้ำ'];
const menuCategories = ['แนะนำ', 'ข้าว', 'ก๊วยเตี๋ยว', 'น้ำ'];

const popularCategories = [
  { name: 'ส้มตำ ไก่ย่าง', image: 'https://img.icons8.com/color/96/mortar-and-pestle.png' },
  { name: 'เครป ขนมโตเกียว', image: 'https://img.icons8.com/color/96/pancake.png' },
  { name: 'ชานมไข่มุก ชาผลไม้', image: 'https://img.icons8.com/color/96/cafe.png' },
  { name: 'ผลไม้', image: 'https://img.icons8.com/color/96/whole-watermelon.png' },
  { name: 'ขนมจีน แกงใต้', image: 'https://img.icons8.com/color/96/curry.png' },
  { name: 'ก๋วยเตี๋ยว บะหมี่', image: 'https://img.icons8.com/color/96/noodles.png' },
  { name: 'เค้ก ขนมหวาน', image: 'https://img.icons8.com/color/96/cake.png' },
  { name: 'ลูกชิ้น หมูปิ้ง', image: 'https://img.icons8.com/color/96/kebab.png' },
  { name: 'ข้าวมันไก่', image: 'https://img.icons8.com/color/96/rice-bowl.png' },
  { name: 'พิซซ่า', image: 'https://img.icons8.com/color/96/pizza.png' },
  { name: 'หมูทอด ไก่ทอด', image: 'https://img.icons8.com/color/96/thanksgiving.png' },
  { name: 'อาหารตามสั่ง', image: 'https://img.icons8.com/color/96/wok.png' },
  { name: 'สเต็ก', image: 'https://img.icons8.com/color/96/steak-medium.png' },
  { name: 'โรตี', image: 'https://img.icons8.com/color/96/naan.png' },
  { name: 'ผัดไทย หอยทอด', image: 'https://img.icons8.com/color/96/noodles.png' },
  { name: 'กาแฟ', image: 'https://img.icons8.com/color/96/coffee.png' },
  { name: 'ซูชิ อาหารญี่ปุ่น', image: 'https://img.icons8.com/color/96/sushi.png' },
  { name: 'ข้าวต้ม', image: 'https://img.icons8.com/color/96/porridge.png' },
  { name: 'ราดหน้า ผัดซีอิ๊ว', image: 'https://img.icons8.com/color/96/soup-plate.png' },
  { name: 'ชาบู สุกี้', image: 'https://img.icons8.com/color/96/cooking-pot.png' }
];

onMounted(async () => {
  const isValid = await qrStore.validateRoom(building, floor, room);
  // const isValid = true;
  isValidLocation.value = isValid;
  isLoading.value = false;

  if (isValid) {
    menu.loadMenu();
    cartStore.loadcart(building, floor, room);
  }
});

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
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="loading loading-spinner loading-lg text-primary"></div>
  </div>

  <div v-else-if="!isValidLocation"
    class="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
    <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-12 h-12 text-red-500">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    </div>
    <h2 class="text-2xl font-bold text-slate-800 mb-2">ไม่พบห้องนี้ในระบบ</h2>
    <p class="text-slate-500">กรุณาสแกน QR Code ใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ</p>
  </div>

  <div v-else
    class="min-h-screen bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans">
    <div class="px-4 mt-4">
      <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
        <img class="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          src="https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg"
          alt="Banner" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <h2 class="text-white text-xl font-bold drop-shadow-md">อร่อยส่งตรงถึงห้องคุณ</h2>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="flex items-center justify-between px-4 mb-3">
        <h3 class="text-lg font-bold text-gray-800">หมวดหมู่ยอดนิยม</h3>
        <div class="flex text-indigo-600 text-3xl font-bold mx-3 mb-1.5 ">></div>
      </div>
      <div class="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-6 overflow-x-auto px-4 pb-4 no-scrollbar">
        <div v-for="cat in popularCategories" :key="cat.name"
          class="flex flex-col items-center w-[72px] cursor-pointer group snap-start">
          <div
            class="w-[70px] h-[70px] rounded-full bg-white shadow-sm border border-slate-100 p-3 flex items-center justify-center group-hover:shadow-md group-hover:border-indigo-200 transition-all duration-300">
            <img :src="cat.image" :alt="cat.name"
              class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span
            class="mt-2 text-[11px] text-center font-medium text-gray-700 leading-tight group-hover:text-indigo-600 line-clamp-2 min-h-[2.5em] flex items-start justify-center">
            {{ cat.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-2 bg-white rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] pt-6 pb-10 min-h-[300px]">
      <div class="px-4 mb-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
          เมนูแนะนำ
        </h3>
      </div>
      <div class="flex overflow-x-auto px-4 pb-4 gap-2 no-scrollbar border-b border-slate-100 mb-4">
        <button v-for="menuItem in menuCategories" :key="menuItem" @click="activeMenuTab = menuItem"
          :class="['flex-1 min-w-[80px] pb-2 text-sm font-medium transition-colors relative', activeMenuTab === menuItem ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600']">
          {{ menuItem }}
          <span v-if="activeMenuTab === menuItem"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-full"></span>
        </button>
      </div>
      <div class="px-4">
        <div v-show="activeMenuTab === 'แนะนำ'" class="animate-fade-in">
          <product :selectionRole="menu.list"></product>
        </div>
        <div v-show="activeMenuTab !== 'แนะนำ'" class="flex flex-col items-center justify-center py-10 text-gray-400">
          <p>รายการอาหาร: {{ activeMenuTab }}</p>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <div class="px-4 pb-2 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-800">หมวดหมู่ร้านค้า</h3>
        <span class="text-xs text-indigo-500 font-medium cursor-pointer">ดูทั้งหมด</span>
      </div>
      <div class="flex overflow-x-auto px-4 pb-2 gap-3 no-scrollbar">
        <button v-for="item in shopCategories" :key="item" @click="activeShopTab = item"
          :class="['px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 shadow-sm border', activeShopTab === item ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300']">
          {{ item }}
        </button>
      </div>
      <div class="px-4 mt-2 mb-6">
        <div v-if="activeShopTab === 'ร้านค้า'"
          class="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center text-gray-400 text-sm">
          เลือกร้านค้าที่คุณถูกใจ</div>
        <div v-else class="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center text-gray-400 text-sm">
          เนื้อหาของ {{ activeShopTab }}</div>
      </div>
    </div>

    <BottomNavigation :building="building" :floor="floor" :room="room" />
  </div>
</template>