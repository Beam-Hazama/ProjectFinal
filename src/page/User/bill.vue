<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';
import { useRoute } from 'vue-router';

const route = useRoute();
const Order = useOderlistStore();


const tableId = route.params.tableId || 'ทั่วไป';

const discount = ref(50.00);

onMounted(async () => {

  await Order.loadOrderUser(tableId);
});


const userOrders = computed(() => {
  return Order.list.filter(order => String(order.tableId).trim() === String(tableId).trim());
});

const combinedItems = computed(() => {
  return userOrders.value.flatMap(order => order.Menu || [])
    .filter(item => item.itemStatus === 'served');
});

const totalSubtotal = computed(() => {
  return combinedItems.value.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
});

const totalGrandTotal = computed(() => {
  return Math.max(0, totalSubtotal.value - discount.value);
});


const calculateVat = (grandTotal) => {
  return grandTotal - (grandTotal / 1.07);
};

const calculateExclVat = (grandTotal) => {
  return grandTotal / 1.07;
};
</script>

<template>
  <div class="w-full min-h-screen p-4 space-y-5 bg-gradient-to-br from-blue-50 to-purple-50 font-sans pb-28">

    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md uppercase">Bill: {{ tableId }}</h1>
          <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1">ใบเสร็จรับเงิน</p>
        </div>
      </div>

      <router-link :to="`/User/${tableId}`"
        class="group flex items-center gap-2 mt-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-white/50">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5 group-hover:translate-x-1 transition-transform">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </router-link>
    </div>

    <div v-if="userOrders.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <span>ไม่มีข้อมูลใบเสร็จสำหรับห้องนี้</span>
    </div>

    <!-- Combined Bill Card -->
    <div v-else class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl overflow-hidden">
      <div class="p-4 border-b border-blue-100 bg-blue-50/50">
        <div class="flex justify-between items-center">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Table Bill</span>
            <span class="text-3xl font-black text-blue-700">{{ tableId }}</span>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase shadow-sm">
              รวม {{ userOrders.length }} ออเดอร์
            </span>
            <div class="text-[10px] text-gray-500 mt-2 font-bold">
              {{ new Date().toLocaleString('th-TH') }}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-3">
        <div v-for="(item, index) in combinedItems" :key="index"
          class="group flex justify-between items-center p-3 rounded-xl hover:bg-white/50 transition-colors border-b border-gray-50 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-lg text-blue-600 font-bold text-xs">
              x{{ item.Quantity }}</div>
            <div class="font-bold text-gray-800 text-sm">{{ item.Name }}</div>
          </div>
          <div class="text-right font-black text-blue-600">฿{{ (item.Price * item.Quantity).toLocaleString() }}</div>
        </div>
      </div>

      <div class="p-4 bg-white/60 space-y-3 border-t border-white">
        <div class="flex justify-between text-gray-600">
          <span class="font-bold">รวมเป็นเงิน</span>
          <span class="font-bold">{{ totalSubtotal.toLocaleString() }} บาท</span>
        </div>
        <div
          class="flex justify-between items-center bg-red-50 p-2 rounded-lg text-red-500 text-sm font-bold border border-red-100">
          <span class="flex items-center gap-1"><span class="text-xs">🏷️</span>ส่วนลด</span>
          <span>- ฿{{ discount }}</span>
        </div>

        <div class="pt-2 text-[10px] text-gray-400 space-y-1">
          <div class="flex justify-between">
            <span>VAT 7%</span>
            <span>฿{{ calculateVat(totalGrandTotal).toFixed(2) }}</span>
          </div>
        </div>

        <hr class="border-dashed border-gray-300 my-2" />

        <div class="flex justify-between items-end">
          <span class="text-gray-500 mb-1 font-bold">ยอดรวมสุทธิ</span>
          <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            {{ totalGrandTotal.toLocaleString() }}<span class="text-sm text-slate-500 font-bold ml-1">บาท</span>
          </span>
        </div>

        <div class="border-t border-gray-100 my-4"></div>

        <div class="flex flex-col items-center py-2">
          <p class="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Scan to Pay</p>
          <div class="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <!-- Use the first order number for payment ref -->
            <img
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENT-${userOrders[0]?.OrderNumber}`"
              alt="QR Code" class="w-24 h-24" />
          </div>
          <p class="text-[10px] text-gray-400 mt-2">Ref: {{ userOrders[0]?.OrderNumber }}...</p>
        </div>
      </div>
    </div>
  </div>
</template>