<script setup>
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

defineProps({
  user: Array
})

//const userFromData = reactive({
  //name: '',
  //number:''
//});

const payment = () => {
  const placeorder = cartStore.placeorder();
  const dlg = document.getElementById('my_modal_1')
  cartStore.clearcart()
  if (dlg?.close) dlg.close()
  console.log('userdata', placeorder)
};

const editOrder = () => {
  const dlg = document.getElementById('my_modal_1')
  if (dlg?.close) dlg.close()
}
</script>

<template>
  <div class="modal-box p-0 w-11/12 max-w-md bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] overflow-hidden font-sans border border-slate-100 relative">
    
    <div class="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

    <div class="px-8 pt-8 pb-4 bg-white/80 backdrop-blur-sm z-10 relative">
      <h2 class="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">ยืนยันออเดอร์</h2>
      <h1 class="text-3xl font-extrabold text-slate-800">Confirmation</h1>
      <p class="text-slate-400 text-sm mt-1">กรุณาตรวจสอบรายการก่อนยืนยันออเดอร์</p>
    </div>

    <div class="px-6 max-h-[40vh] overflow-y-auto custom-scrollbar relative z-10">
      <div v-if="cartStore.item.length > 0" class="space-y-4">
        
        <div v-for="(cart, index) in cartStore.item" :key="index" class="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
          
          <div class="flex items-center gap-4"> 
            <div>
              <h3 class="font-bold text-slate-700 text-base leading-tight ">{{ cart.Name }}</h3>
              <p class="text-xs text-slate-400 font-medium mt-1">จำนวน: x{{ cart.Quantity }}</p>
            </div>
          </div>

          <div class="text-right">
             <span class="font-bold text-slate-800 text-lg">{{ (cart.Price * cart.Quantity).toLocaleString() }}</span>
             <span class="text-xs text-slate-400 block">บาท</span>
          </div>
        </div>

      </div>
      
      <div v-else class="text-center py-10 text-slate-400">
        ไม่มีสินค้าในตะกร้า
      </div>
    </div>

    <div class="pb-6 px-6 bg-slate-50 mt-4 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-20">
      <hr class="border-dashed border-gray-300 my-2" /> 
      <div class="flex justify-between items-end mb-6 px-2">
        <div>
          <span class="text-sm text-slate-500 font-medium">ยอดรวมทั้งสิ้น</span>
        </div>
        <div class="text-right">
          <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {{ cartStore.summaryPrice.toLocaleString() }}
          </span>
          <span class="text-sm text-slate-500 font-bold ml-1">THB</span>
        </div>
      </div>

      <div class="flex gap-3">
        <button 
          @click="editOrder()"
          class="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-white border border-red-100 hover:bg-slate-200 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
        >
          ยกเลิก
        </button>
        <button 
          @click="payment()"
          class="flex-[2] py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
        >
          ยืนยันออเดอร์
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

    </div>

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
  background: #e2e8f0;
  border-radius: 20px;
}
</style>