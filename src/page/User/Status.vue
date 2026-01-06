<script setup>
import { onMounted, computed } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderListStore = useOderlistStore();
const tableId = route.params.tableId || 'ทั่วไป';

// กรองเฉพาะออเดอร์ของโต๊ะนี้
const roomOrders = computed(() => {
  return orderListStore.list.filter(order => order.TableID === tableId);
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('th-TH').format(value);
};

onMounted(() => {
  orderListStore.loadOrder(); // โหลดข้อมูลจาก Firebase
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 font-sans">
    <header class="bg-white sticky top-0 z-40 shadow-sm px-4 py-4 flex items-center gap-4">
      <router-link :to="`/User/${tableId}`" class="text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </router-link>
      <div>
        <h1 class="text-xl font-bold text-gray-800">สถานะคำสั่งซื้อ</h1>
        <p class="text-xs text-indigo-600 font-medium">ห้องที่ {{ tableId }}</p>
      </div>
    </header>

    <div class="p-4 space-y-4">
      <div v-if="roomOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <p class="font-medium">ยังไม่มีรายการสั่งซื้อ</p>
        <router-link :to="`/User/${tableId}`" class="mt-4 text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">ไปที่เมนูอาหาร</router-link>
      </div>

      <div v-for="(order, index) in roomOrders" :key="index" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
          <div>
            <span class="text-xs font-bold text-indigo-500 uppercase tracking-wider">Order #{{ order.OrderNumber }}</span>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 uppercase">
            {{ order.statusOrder === 'pending' ? 'รอดำเนินการ' : 'สำเร็จแล้ว' }}
          </span>
        </div>

        <div class="p-4 space-y-4">
          <div v-for="(item, i) in order.Menu" :key="i" class="flex justify-between items-center">
            <div class="flex flex-col">
              <div class="flex gap-2 items-center">
                <span class="font-bold text-indigo-600 text-sm">x{{ item.Quantity }}</span>
                <span class="text-sm font-medium text-gray-700">{{ item.Name }}</span>
              </div>
              <div class="mt-1 flex items-center gap-1.5">
                <span :class="{
                  'w-2 h-2 rounded-full': true,
                  'bg-amber-400': item.itemStatus === 'pending',
                  'bg-blue-400': item.itemStatus === 'cooking',
                  'bg-green-500': item.itemStatus === 'served'
                }"></span>
                <span class="text-[10px] font-bold uppercase" :class="{
                  'text-amber-500': item.itemStatus === 'pending',
                  'text-blue-500': item.itemStatus === 'cooking',
                  'text-green-600': item.itemStatus === 'served'
                }">
                  {{ item.itemStatus === 'pending' ? 'รอคิว' : 
                     item.itemStatus === 'cooking' ? 'กำลังทำ' : 'เสิร์ฟแล้ว' }}
                </span>
              </div>
            </div>
            <span class="text-sm font-bold text-gray-800">฿{{ formatPrice(item.Price * item.Quantity) }}</span>
          </div>
        </div>

        <div class="p-4 bg-slate-50 flex justify-between items-center">
          <span class="text-sm font-medium text-gray-500">ยอดรวมทั้งหมด</span>
          <span class="text-lg font-black text-indigo-600">฿{{ formatPrice(order.TotalPrice) }}</span>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 left-0 w-full px-6">
      <router-link :to="`/User/${tableId}`" class="flex items-center justify-center w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
        สั่งอาหารเพิ่ม
      </router-link>
    </div>
  </div>
</template>