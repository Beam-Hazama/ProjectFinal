<script setup>
import { onMounted, ref, watch } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useCartStore } from '@/stores/cartStore';
import product from '@/page/component/blockmenu.vue';
import Cart from '@/Icon/Cart.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cartStore = useCartStore();
const menu = useMenuStore();

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

onMounted(() => {
  menu.loadMenu();
  cartStore.loadcart(building, floor, room);
});

watch(() => [route.params.building, route.params.floor, route.params.room], ([newB, newF, newR]) => {
  if (newB && newF && newR) {
    cartStore.loadcart(newB, newF, newR);
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans">
    <header class="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-500 font-medium">ห้อง</span>
            <span class="text-lg font-bold text-indigo-700 leading-none">{{ room }}</span>
            <span class="text-xs text-gray-400 ml-1">({{ building }} fl.{{ floor }})</span>
          </div>
        </div>
        <div class="flex items-center bg-slate-100/50 p-1 rounded-2xl gap-1 border border-white/50 shadow-sm">

          <RouterLink :to="`/User/Status/${building}/${floor}/${room}`"
            class="flex flex-col items-center justify-center w-14 h-12 rounded-xl hover:bg-white transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5 text-slate-500 group-hover:text-indigo-600">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span class="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase mt-0.5">Status</span>
          </RouterLink>

          <RouterLink :to="`/User/Bill/${building}/${floor}/${room}`"
            class="flex flex-col items-center justify-center w-14 h-12 rounded-xl hover:bg-white transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5 text-slate-500 group-hover:text-indigo-600">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span class="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase mt-0.5">Bill</span>
          </RouterLink>


        </div>
      </div>
    </header>

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

    <RouterLink :to="`/User/Cart/${building}/${floor}/${room}`" class="fixed bottom-6 right-6 z-50 group">
      <div
        class="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg flex items-center justify-center text-white transform transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        <Cart class="w-7 h-7" />
        <span v-if="cartStore.summaryQuantity > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
          {{ cartStore.summaryQuantity }}
        </span>
      </div>
    </RouterLink>
  </div>
</template>