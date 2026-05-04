<script setup>
import { onMounted, computed, ref } from 'vue';
import { formatPrice } from '@/utils/format';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import ConfirmOrder from './components/cart/ConfirmOrder.vue';

const cartStore = useCartStore();
const route = useRoute();
const confirmModal = ref(null);

const room = route.params.room ;

const displayLocation = computed(() => {
  return `ห้อง ${room}`;
});

onMounted(() => {
  cartStore.loadCart(room);
});

const showConfirmModal = () => {
  if (cartStore.item.length > 0) {
    confirmModal.value?.showModal();
  }
};

const closeConfirmModal = () => {
  confirmModal.value?.close();
};

</script>

<template>
  <div
    class="w-full min-h-screen p-4 pb-32 space-y-5 bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
    
    
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
          <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md">CART </h1>
          <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ displayLocation }}
          </p>
        </div>
      </div>
      <button @click="$router.back()"
        class="group flex items-center gap-2 mt-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-white/50 cursor-pointer">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>

    
    <div
      class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-5">
      <div class="flex justify-between items-center mb-6">
        <span class="text-xl font-bold text-slate-800">รายการสั่งซื้อ</span>
      </div>

      <div v-if="!cartStore.item || cartStore.item.length === 0"
        class="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>ยังไม่มีรายการอาหารในตะกร้า</span>
      </div>

      <TransitionGroup name="list" tag="div" class="divide-y divide-slate-100">
        <div v-for="(cart, index) in cartStore.item" :key="cart.cartItemId"
          class="group relative py-6 first:pt-0 last:pb-0 transition-all duration-300">
          <div class="flex gap-4">
            
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
              <img :src="cart.ImageUrl || 'https://placehold.co/150'" class="w-full h-full object-cover" />
            </div>

            
            <div class="flex-grow min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div class="flex justify-between items-start">
                  <div class="flex-grow min-w-0">
                    <h3 class="font-bold text-slate-800 text-base leading-tight pr-2">
                      {{ cart.Name }}
                    </h3>
                    <div v-if="cart.note" class="text-[11px] text-slate-400 font-normal mt-0.5 italic whitespace-pre-wrap break-words">
                      {{ cart.note }}
                    </div>
                  </div>
                  <div class="flex flex-col items-end flex-shrink-0">
                    <div class="text-slate-900 font-bold whitespace-nowrap">
                      ฿{{ formatPrice(cart.Price * cart.Quantity) }}
                    </div>
                    <div v-if="cart.basePrice && cart.basePrice > cart.Price"
                      class="text-xs text-slate-400 line-through mt-0.5">
                      ฿{{ formatPrice(cart.basePrice * cart.Quantity) }}
                    </div>
                  </div>
                </div>

              </div>

              
              <div class="flex items-center gap-3 mt-3">
                <div class="flex items-center bg-slate-50 rounded-xl p-1 shadow-inner border border-slate-100">
                  <button @click="cartStore.updateQuantity(index, -1)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
                    </svg>
                  </button>
                  <div class="w-10 text-center font-bold text-slate-700 text-sm">
                    {{ cart.Quantity }}
                  </div>
                  <button @click="cartStore.updateQuantity(index, 1)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    
    <div class="bg-white/90 backdrop-blur-lg shadow-xl border border-white/60 rounded-2xl p-5 space-y-3">
      <div class="flex justify-between text-gray-600">
        <span>ค่าอาหาร</span>
        <span>{{ formatPrice(cartStore.totalPrice) }} บาท</span>
      </div>
      <hr class="border-dashed border-gray-300 my-2" />
      <div class="flex justify-between items-end">
        <span class="text-gray-500 mb-1 font-bold">ยอดรวมสุทธิ</span>
        <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
          {{ formatPrice(cartStore.totalPrice) }}<span class="text-sm text-slate-500 font-bold ml-1">บาท</span>
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
            <span class="text-xl font-black">{{ formatPrice(cartStore.totalPrice) }}<span
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

    <dialog ref="confirmModal" class="modal">
      <confirm-order 
        :room="room"
        @close-modal="closeConfirmModal"
      ></confirm-order>
    </dialog>
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
