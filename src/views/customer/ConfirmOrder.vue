<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/customer/cart';
import { useMenuStore } from '@/stores/shared/menu';

const props = defineProps({
  room: String
});
const router = useRouter();
const cartStore = useCartStore();
const menuStore = useMenuStore();

const emit = defineEmits(['close-modal']);

const isPlacingOrder = ref(false);

const payment = async () => {
  if (isPlacingOrder.value) return;
  try {
    isPlacingOrder.value = true;
    const success = await cartStore.placeOrder();
    
    if (success) {
      emit('close-modal');
      
      router.push({ 
        name: 'Status', 
        params: { 
          room: props.room 
        } 
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
    // Error is already handled by alert in store, but we catch it here to reset loading
  } finally {
    isPlacingOrder.value = false;
  }
};

const editOrder = () => {
  emit('close-modal');
};

const getMenuName = (id) => {
  const menu = menuStore.list.find(m => m.id === id);
  return menu ? menu.Name : 'เมนู (ไม่ทราบชื่อ)';
};
</script>

<template>
  <div class="modal-box p-0 w-11/12 max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden font-sans border border-slate-100 relative">    
    <div class="px-8 pt-7 pb-4 bg-white/80 backdrop-blur-sm z-10 relative">
      <h2 class="text-xs font-bold text-blue-400 tracking-widest uppercase mb-1">ยืนยันออเดอร์</h2>
      <h1 class="text-3xl font-extrabold text-blue-600">Confirm Order</h1>
      <p class="text-red-700 text-sm mt-1">**ไม่สามารถยกเลิกออเดอร์ได้**</p>
    </div>

    
    <div class="px-6 max-h-[40vh] overflow-y-auto custom-scrollbar relative z-10">
      <div v-if="cartStore.item.length > 0" class="space-y-0.5">
        <div v-for="(cart, index) in cartStore.item" :key="index" class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
          <div class="flex items-center gap-4">
            <div>
              <div class="font-bold text-slate-700 text-base leading-tight">{{ cart.Name || getMenuName(cart.id || cart.menuId) }}</div>
              <p class="text-xs text-slate-400 font-medium mt-1">จำนวน: x{{ cart.Quantity }} (฿{{ cart.Price }})</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-blue-600 text-lg">{{ (cart.Price * cart.Quantity).toLocaleString() }}</span>
            <span class="text-xs text-slate-400 block">บาท</span>
          </div>
        </div>
      </div>
    </div>    
    <div class="pb-6 px-6 bg-slate-50 mt-4 rounded-t-[2.5rem] relative z-20">
      <hr class="border-dashed border-gray-300 my-4" />
      <div class="flex justify-between items-end mb-6 px-2">
        <span class="text-xl font-medium">ยอดรวมทั้งสิ้น</span>
        <div class="text-right">
          <span class="text-4xl font-black text-blue-600">{{ cartStore.totalPrice.toLocaleString() }}</span>
          <span class="text-sm text-slate-500 font-bold ml-1">บาท</span>
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="editOrder()" class="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-white border border-red-100 transition-all">ยกเลิก</button>
        <button @click="payment()" :disabled="isPlacingOrder" class="flex-[2] py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          <span v-if="isPlacingOrder" class="loading loading-spinner loading-sm"></span>
          <span v-else>ยืนยันออเดอร์</span>
        </button>
      </div>
    </div>
  </div>
</template>