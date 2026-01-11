<script setup>
import { useCartStore } from '@/stores/cartStore';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmOrder from './ConfirmOrder.vue';
import Trach from '@/Icon/trach.vue';

const cartStore = useCartStore();
const route = useRoute();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const displayLocation = computed(() => {
  return `ห้อง ${room} ชั้น ${floor} ตึก ${building}`;
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('th-TH').format(value);
};


const showConfirmModal = () => {
  if (cartStore.item.length > 0) {
    const modal = document.getElementById('my_modal_1');
    if (modal) {
      modal.showModal();
    }
  }
};

onMounted(() => {
  cartStore.loadcart(building, floor, room);
});

const removeItem = (index) => {
  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
    cartStore.removeItemInCart(index);
  }
};
</script>

<template>
  <div
    class="w-full min-h-screen p-4 space-y-5 bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md"> MY CART </h1>
          <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            รายการอาหารของ: {{ displayLocation }}
          </p>
        </div>
      </div>
      <router-link :to="`/User/${building}/${floor}/${room}`"
        class="group flex items-center gap-2 mt-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-white/50">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5 group-hover:translate-x-1 transition-transform">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      </router-link>
    </div>

    <div
      class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div class="flex justify-between items-center mb-4 border-b border-blue-100 pb-4">
        <span class="text-lg font-bold text-gray-700 mx-3">รายการอาหารที่สั่ง</span>
      </div>

      <div v-if="!cartStore.item || cartStore.item.length === 0"
        class="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>ยังไม่มีสินค้าในตะกร้า</span>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-3">
        <div v-for="(cart, index) in cartStore.item" :key="index"
          class="group relative bg-white/60 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3 overflow-hidden">
              <div
                class="flex-shrink-0 w-10 h-8 flex items-center justify-center bg-blue-50 rounded-lg text-blue-600 font-bold text-xs">
                x{{ cart.Quantity }} </div>
              <div class="min-w-0">
                <div class="font-bold text-gray-800 text-lg truncate"> {{ cart.Name }} <span
                    class="text-xs text-gray-400">(฿{{ cart.Price }})</span></div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-blue-600 text-right">
                <div class="text-lg font-bold">{{ (cart.Price * cart.Quantity).toLocaleString() }}</div>
                <div class="text-[10px] text-slate-400 uppercase font-bold">Baht</div>
              </div>
              <button @click="removeItem(index)"
                class="p-2 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition">
                <Trach />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="bg-white/90 backdrop-blur-lg shadow-xl border border-white/60 rounded-2xl p-5 space-y-3">
      <div class="flex justify-between text-gray-600">
        <span>ค่าอาหาร</span>
        <span>{{ cartStore.summaryPrice.toLocaleString() }} บาท</span>
      </div>
      <div class="flex justify-between text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
        <span class="flex items-center gap-1 font-bold"><span class="text-xs">🏷️</span>ส่วนลดพิเศษ</span>
        <span>- ฿0 บาท</span>
      </div>
      <hr class="border-dashed border-gray-300 my-2" />
      <div class="flex justify-between items-end">
        <span class="text-gray-500 mb-1 font-bold">ยอดรวมสุทธิ</span>
        <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
          {{ cartStore.summaryPrice.toLocaleString() }}<span class="text-sm text-slate-500 font-bold ml-1">บาท</span>
        </span>
      </div>
    </div>

    <div class="fixed bottom-6 left-0 w-full px-4 z-50">
      <div @click="showConfirmModal"
        class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1 rounded-2xl shadow-xl shadow-blue-500/40 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer group"
        :class="{ 'grayscale opacity-50 cursor-not-allowed': cartStore.item.length === 0 }">
        <div class="flex justify-between items-center px-6 py-4 bg-transparent rounded-xl border border-white/20">
          <div class="flex flex-col">
            <span class="text-xs text-blue-100 font-bold uppercase tracking-wider">ชำระเงิน</span>
            <span class="text-xl font-black">{{ cartStore.summaryPrice.toLocaleString() }}<span
                class="text-sm font-bold ml-1">บาท</span></span>
          </div>
          <div
            class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white group-hover:text-blue-600 transition-all">
            <span class="font-bold">ยืนยันออเดอร์</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <dialog id="my_modal_1" class="modal">
      <confirm-order :tableId="`${building}-${floor}-${room}`"></confirm-order>
    </dialog>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>