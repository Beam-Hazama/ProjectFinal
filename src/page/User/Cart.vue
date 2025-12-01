<script setup>
import { useCartStore } from '@/stores/cartStore';
import { onMounted } from 'vue';

const cartStore = useCartStore();

const formatPrice = (value) => {
  return new Intl.NumberFormat('th-TH').format(value);
};

onMounted(() => {
  cartStore.loadcart()
})
</script>

<template>
  <div class="w-full min-h-screen p-4 space-y-5 bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 font-sans">

    <div class="flex items-center gap-2 mb-2">
      <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div>
        <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md">MY CART</h1>
        <p class="text-xs text-blue-400 font-medium mx-0.5 mb-1 ">รายการอาหารของคุณ</p>
      </div>
    </div>
    
    <div class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div class="flex justify-between items-center mb-4 border-b border-blue-100 pb-4">
        <span class="text-lg font-bold text-gray-700 mx-3">รายการอาหารที่สั่ง</span>
        <button
          class="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-1 active:scale-95">
          <span>+</span> สั่งเพิ่ม
        </button>
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
              <div class="flex-shrink-0 w-10 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 font-bold text-xs">
                x{{ cart.Amount || 1 }}
              </div>

              <div class="min-w-0">
                <div class="font-bold text-gray-800 text-lg truncate">{{ cart.Name }}</div>
                <button class="text-xs text-gray-400 flex items-center gap-1 mt-0.5 hover:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  แก้ไขรายละเอียด
                </button>
              </div>
            </div>

            <div class="text-lg font-bold text-blue-600 flex-shrink-0 ml-2">฿{{ formatPrice(cart.Price) }}</div>
          </div>

        </div>
      </TransitionGroup>
    </div>

    <div class="bg-white/90 backdrop-blur-lg shadow-xl border border-white/60 rounded-2xl p-5 space-y-3">
      <div class="flex justify-between text-gray-600"><span>ค่าอาหาร</span><span>฿200,000.00</span></div>
      <div class="flex justify-between text-gray-600"><span>ค่าส่ง</span><span>฿200.00</span></div>
      <div class="flex justify-between text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
        <span class="flex items-center gap-1"><span class="text-xs">🏷️</span> ส่วนลด</span>
        <span>- ฿20,000.00</span>
      </div>
      <hr class="border-dashed border-gray-300 my-2" />
      <div class="flex justify-between items-end">
        <span class="text-gray-500 mb-1">รวมทั้งหมด</span>
        <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
          ฿{{ formatPrice(cartStore.summaryPrice) }}
        </span>
      </div>
    </div>

    <div class="fixed bottom-6 left-0 w-full px-4 z-50">
      <div
        class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1 rounded-2xl shadow-xl shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <div
          class="flex justify-between items-center px-6 py-4 bg-transparent rounded-xl border border-white/20 group-active:scale-[0.98] transition-transform">
          <div class="flex flex-col">
            <span class="text-xs text-blue-100 font-light uppercase tracking-wider">ยอดชำระ</span>
            <span class="text-xl font-bold">฿{{ formatPrice(cartStore.summaryPrice) }}</span>
          </div>
          <div
            class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white group-hover:text-blue-600 transition-colors">
            <span class="font-bold">สั่งเลย</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}


.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>