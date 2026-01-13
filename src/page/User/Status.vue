<script setup>
import { onMounted, computed } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderListStore = useOderlistStore();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';
const tableId = `${building}-${floor}-${room}`;

const roomOrders = computed(() => {
  return orderListStore.list.filter(order => {
    return String(order.tableId).trim() === String(tableId).trim();
  });
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('th-TH').format(value);
};

onMounted(() => {
  if (tableId) {
   
    orderListStore.loadOrderUser(tableId);
  }
});
</script>

<template>
  <div class="w-full min-h-screen p-4 space-y-5 bg-gradient-to-br from-blue-50 to-purple-50 font-sans pb-28">
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md uppercase">Order Status</h1>
          <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1">สถานะคำสั่งซื้อของห้อง ({{ building }} fl.{{ floor }})
            - {{ room }}</p>
        </div>
      </div>
      <router-link :to="`/User/${building}/${floor}/${room}`"
        class="group flex items-center gap-2 mt-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-white/50">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </router-link>
    </div>

    <div class="space-y-6">
      <div v-if="roomOrders.length === 0"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30 mb-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="font-medium">ยังไม่มีรายการสั่งซื้อ</p>
        <router-link :to="`/User/${building}/${floor}/${room}`"
          class="mt-4 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 text-sm">ไปที่เมนูอาหาร</router-link>
      </div>

      <div v-for="(order, index) in roomOrders" :key="index"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Order Number</span>
            <span class="text-sm font-black text-blue-700">#{{ order.OrderNumber }}</span>
          </div>
          <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm" :class="{
            'bg-amber-100 text-amber-600': order.statusOrder === 'pending',
            'bg-green-100 text-green-600': order.statusOrder !== 'pending'
          }">
            {{ order.statusOrder === 'pending' ? 'รอดำเนินการ' : 'สำเร็จแล้ว' }}
          </span>
        </div>

        <div class="p-4 space-y-4">
          <div v-for="(item, i) in order.Menu" :key="i"
            class="group flex justify-between items-center p-2 rounded-xl hover:bg-white/50 transition-colors">
            <div class="flex flex-col">
              <div class="flex gap-3 items-center">
                <span class="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">x{{ item.Quantity
                }}</span>
                <span class="text-sm font-bold text-gray-700">{{ item.Name }}</span>
              </div>
              <div class="mt-1.5 flex items-center gap-1.5">
                <span :class="{
                  'w-1.5 h-1.5 rounded-full ring-2 ring-offset-1': true,
                  'bg-amber-400 ring-amber-200': item.itemStatus === 'pending',
                  'bg-blue-400 ring-blue-200': item.itemStatus === 'cooking',
                  'bg-green-500 ring-green-200': item.itemStatus === 'served'
                }"></span>
                <span class="text-[9px] font-black uppercase tracking-wider" :class="{
                  'text-amber-500': item.itemStatus === 'pending',
                  'text-blue-500': item.itemStatus === 'cooking',
                  'text-green-600': item.itemStatus === 'served'
                }">
                  {{ item.itemStatus === 'pending' ? 'รอคิว' :
                    item.itemStatus === 'cooking' ? 'กำลังทำ' : 'เสิร์ฟแล้ว' }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm font-black text-gray-800">฿{{ formatPrice(item.Price * item.Quantity) }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white/60 border-t border-white flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase">ยอดรวมรายการนี้</span>
          <span class="text-lg font-black text-blue-600">฿{{ formatPrice(order.TotalPrice) }}</span>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 left-0 w-full px-6 z-40">
      <router-link :to="`/User/${building}/${floor}/${room}`"
        class="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1 rounded-2xl shadow-xl shadow-blue-500/40 transform active:scale-95 transition-all duration-300 block">
        <div class="flex items-center justify-center gap-2 py-4 rounded-xl border border-white/20">
          <span class="font-black uppercase tracking-wider">สั่งอาหารเพิ่ม</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </router-link>
    </div>
  </div>
</template>