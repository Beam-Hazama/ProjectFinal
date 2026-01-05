<script setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from '@/stores/menu';
import product from '@/page/component/blockmenu.vue'; // ตรวจสอบ path ให้ถูกต้อง
import bill from '@/Icon/Bill.vue';
import Cart from '@/Icon/Cart.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tableId = route.params.tableId || 'ทั่วไป'; // ดึงค่าจาก URL

const menu = useMenuStore();

// State สำหรับจัดการ Tab
const activeShopTab = ref('ร้านค้า');
const activeMenuTab = ref('แนะนำ');

const shopCategories = ['ร้านค้า', 'ตามสั่ง', 'ก๊วยเตี๋ยว', 'น้ำ'];
const menuCategories = ['แนะนำ', 'ข้าว', 'ก๊วยเตี๋ยว', 'น้ำ'];

// ข้อมูลหมวดหมู่ยอดนิยมพร้อมรูปภาพไอคอน
const popularCategories = [
  { name: 'ส้มตำ ไก่ย่าง', image: 'https://cdn-icons-png.flaticon.com/512/3230/3230099.png' },
  { name: 'เครป ขนมโตเกียว', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081887.png' },
  { name: 'ชานมไข่มุก ชาผลไม้', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081949.png' },
  { name: 'ผลไม้', image: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png' },
  { name: 'ขนมจีน แกงใต้', image: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' },
  { name: 'ก๋วยเตี๋ยว บะหมี่', image: 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png' },
  { name: 'เค้ก ขนมหวาน', image: 'https://cdn-icons-png.flaticon.com/512/2682/2682458.png' },
  { name: 'ลูกชิ้น หมูปิ้ง', image: 'https://cdn-icons-png.flaticon.com/512/2921/2921828.png' },
  { name: 'ข้าวมันไก่', image: 'https://cdn-icons-png.flaticon.com/512/2921/2921824.png' },
  { name: 'พิซซ่า', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png' },
  { name: 'หมูทอด ไก่ทอด', image: 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png' },
  { name: 'อาหารตามสั่ง', image: 'https://cdn-icons-png.flaticon.com/512/2003/2003965.png' },
  { name: 'สเต็ก', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081907.png' },
  { name: 'โรตี', image: 'https://cdn-icons-png.flaticon.com/512/869/869688.png' },
  { name: 'ผัดไทย หอยทอด', image: 'https://cdn-icons-png.flaticon.com/512/1391/1391383.png' },
  { name: 'กาแฟ', image: 'https://cdn-icons-png.flaticon.com/512/924/924514.png' },
  { name: 'ซูชิ อาหารญี่ปุ่น', image: 'https://cdn-icons-png.flaticon.com/512/2234/2234604.png' },
  { name: 'ข้าวต้ม', image: 'https://cdn-icons-png.flaticon.com/512/1531/1531388.png' },
  { name: 'ราดหน้า ผัดซีอิ๊ว', image: 'https://cdn-icons-png.flaticon.com/512/3480/3480749.png' },
  { name: 'ชาบู สุกี้', image: 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png' }
];

onMounted(() => {
  menu.loadMenu();
});
</script>

<template>
  <div class="min-h-screen bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans">
    
    <header class=" top-0 z-40 w-full bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="badge badge-lg bg-indigo-100 text-indigo-700 border-none font-medium shadow-sm">
            ห้องที่ {{ tableId }}
          </span>
        </div>

       

        <RouterLink to="/User/Bill" class="btn btn-circle btn-ghost btn-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
          <bill class="w-6 h-6" />
        </RouterLink>
      </div>
    </header>

    <div class="px-4 mt-4">
      <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
        <img
          class="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          src="https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg"
          alt="Banner"
        />
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
        <div 
          v-for="cat in popularCategories" 
          :key="cat.name" 
          class="flex flex-col items-center w-[72px] cursor-pointer group snap-start"
        >
          <div class="w-[70px] h-[70px] rounded-full bg-white shadow-sm border border-slate-100 p-3 flex items-center justify-center group-hover:shadow-md group-hover:border-indigo-200 transition-all duration-300">
            <img :src="cat.image" :alt="cat.name" class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span class="mt-2 text-[11px] text-center font-medium text-gray-700 leading-tight group-hover:text-indigo-600 line-clamp-2 min-h-[2.5em] flex items-start justify-center">
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
        <button 
          v-for="menuItem in menuCategories" 
          :key="menuItem"
          @click="activeMenuTab = menuItem"
          :class="[
            'flex-1 min-w-[80px] pb-2 text-sm font-medium transition-colors relative',
            activeMenuTab === menuItem 
              ? 'text-indigo-600' 
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          {{ menuItem }}
          <span v-if="activeMenuTab === menuItem" class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-full"></span>
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
        <button 
          v-for="item in shopCategories" 
          :key="item"
          @click="activeShopTab = item"
          :class="[
            'px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 shadow-sm border',
            activeShopTab === item 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-indigo-200' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
          ]"
        >
          {{ item }}
        </button>
      </div>
      
      <div class="px-4 mt-2 mb-6">
        <div v-if="activeShopTab === 'ร้านค้า'" class="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center text-gray-400 text-sm">
          เลือกร้านค้าที่คุณถูกใจ
        </div>
        <div v-else class="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center text-gray-400 text-sm">
          เนื้อหาของ {{ activeShopTab }}
        </div>
      </div>
    </div>

    <RouterLink 
      to="/User/Cart" 
      class="fixed bottom-6 right-6 z-50 group"
    >
      <div class="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-indigo-300 flex items-center justify-center text-white text-2xl transform transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        <Cart class="w-7 h-7" />
        </div>
    </RouterLink>

  </div>
</template>
