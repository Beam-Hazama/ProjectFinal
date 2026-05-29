<script setup>
import { computed } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const getChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    isUp: change >= 0,
    color: change >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'
  };
};

const revenueChange = computed(() => getChange(props.dashboardStore.totalRevenue, props.dashboardStore.prevTotalRevenue));
const ordersChange = computed(() => getChange(props.dashboardStore.totalOrders, props.dashboardStore.prevTotalOrders));
</script>

<template>
  <div class="space-y-6">
    <!-- Status Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center">
        <span class="text-amber-500 text-xs font-bold mb-1 uppercase tracking-wider">รอดำเนินการ</span>
        <span class="text-2xl font-black text-amber-600">{{ dashboardStore.orderStatuses.pending }}</span>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
        <span class="text-blue-500 text-xs font-bold mb-1 uppercase tracking-wider">กำลังทำอาหาร</span>
        <span class="text-2xl font-black text-blue-600">{{ dashboardStore.orderStatuses.cooking || 0 }}</span>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
        <span class="text-emerald-500 text-xs font-bold mb-1 uppercase tracking-wider">เสร็จสิ้น</span>
        <span class="text-2xl font-black text-emerald-600">{{ dashboardStore.orderStatuses.completed }}</span>
      </div>
      <div class="bg-rose-50 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center">
        <span class="text-rose-500 text-xs font-bold mb-1 uppercase tracking-wider">ยกเลิก</span>
        <span class="text-2xl font-black text-rose-600">{{ dashboardStore.orderStatuses.cancelled || 0 }}</span>
      </div>
    </div>

    <!-- Main Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <!-- Revenue Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 leading-none to-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ยอดขายรวม</p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-slate-800">฿{{ (dashboardStore.totalRevenue || 0).toLocaleString() }}</span>
              <div v-if="revenueChange" :class="revenueChange.color" class="px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 text-[10px] font-black">
                <svg v-if="revenueChange.isUp" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
                {{ revenueChange.value }}%
              </div>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Commission Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              {{ dashboardStore.totalRestaurants !== undefined ? 'ค่าธรรมเนียมรวม' : 'ค่าธรรมเนียมที่ต้องชำระ' }}
            </p>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-rose-600">฿{{ (dashboardStore.totalCommission || 0).toLocaleString() }}</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-sky-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ออเดอร์ทั้งหมด</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-black text-slate-800">{{ (dashboardStore.totalOrders || 0).toLocaleString() }}</h3>
              <div v-if="ordersChange" :class="ordersChange.color" class="px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 text-[10px] font-black">
                <svg v-if="ordersChange.isUp" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
                {{ ordersChange.value }}%
              </div>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </div>
      </div>

      <!-- Menus Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">เมนูอาหาร</p>
            <h3 class="text-3xl font-black text-slate-800">{{ (dashboardStore.totalMenus || 0).toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5l-3 3m0 0l-3-3m3 3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Net Profit Card (Financial Health) - Only for Restaurants -->
      <div v-if="dashboardStore.totalRestaurants === undefined" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">กำไรสุทธิ</p>
            <div class="flex items-baseline gap-1">
              <h3 class="text-3xl font-black text-emerald-600">฿{{ (dashboardStore.netProfit || 0).toLocaleString() }}</h3>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Restaurants Card - Only for Admin -->
      <div v-if="dashboardStore.totalRestaurants !== undefined" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div>
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">จำนวนร้านอาหาร</p>
            <h3 class="text-3xl font-black text-slate-800">{{ (dashboardStore.totalRestaurants || 0).toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
