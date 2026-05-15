<script setup>
import { computed } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'cooking':
    case 'preparing': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'รอดำเนินการ';
    case 'cooking':
    case 'preparing': return 'กำลังเตรียม';
    case 'completed': return 'เสร็จสิ้น';
    case 'cancelled': return 'ยกเลิก';
    default: return status;
  }
};

const totalAllOrders = computed(() => {
  const s = props.dashboardStore.orderStatuses || {};
  return (s.pending || 0) + (s.cooking || s.preparing || 0) + (s.dispatched || 0) + (s.completed || 0) + (s.cancelled || 0);
});

const aov = computed(() => {
  const completed = props.dashboardStore.orderStatuses?.completed || 0;
  if (completed === 0) return 0;
  return props.dashboardStore.totalRevenue / completed;
});

const successRate = computed(() => {
  if (totalAllOrders.value === 0) return 0;
  return ((props.dashboardStore.orderStatuses?.completed || 0) / totalAllOrders.value) * 100;
});

const cancellationRate = computed(() => {
  if (totalAllOrders.value === 0) return 0;
  return ((props.dashboardStore.orderStatuses?.cancelled || 0) / totalAllOrders.value) * 100;
});
</script>

<template>
  <div class="space-y-6">
    <!-- KPI Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <div class="bg-indigo-600 rounded-2xl p-4 shadow-sm text-white flex items-center justify-between overflow-hidden relative group">
        <div class="relative z-10">
          <p class="text-[10px] font-bold uppercase opacity-80 tracking-wider mb-1">ยอดต่อบิลเฉลี่ย (AOV)</p>
          <p class="text-2xl font-black">฿{{ Math.round(aov).toLocaleString() }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group">
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">อัตราสั่งซื้อสำเร็จ</p>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-black text-slate-800">{{ successRate.toFixed(1) }}%</p>
            <span class="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">High Performance</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:rotate-12 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group">
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">อัตราการยกเลิก</p>
          <p class="text-2xl font-black text-slate-800">{{ cancellationRate.toFixed(1) }}%</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:rotate-12 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Top Selling Menus -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
          เมนูขายดี
        </h2>
        
        <div v-if="dashboardStore.topMenuItems?.length > 0" class="space-y-4 flex-grow">
          <div v-for="(item, index) in dashboardStore.topMenuItems" :key="index" class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
              <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" alt="menu">
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="flex-grow min-w-0">
              <p class="font-bold text-slate-700 truncate">{{ item.name }}</p>
              <p class="text-xs text-slate-500">{{ item.qty }} ออเดอร์</p>
            </div>
            <div class="text-right">
              <p class="font-black text-indigo-600">฿{{ item.revenue.toLocaleString() }}</p>
            </div>
          </div>
        </div>
        <div v-else class="flex-grow flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <div class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-xs font-medium">ยังไม่มีอันดับเมนูขายดี</p>
        </div>
      </div>

      <!-- Top Performing Restaurants (Admin only) or Placeholder for Restaurant -->
      <div v-if="dashboardStore.topRestaurants" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          ร้านอาหารทำยอดสูงสุด
        </h2>

        <div v-if="dashboardStore.topRestaurants?.length > 0" class="space-y-4 flex-grow">
          <div v-for="(rest, index) in dashboardStore.topRestaurants" :key="index" class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
              {{ index + 1 }}
            </div>
            <div class="flex-grow min-w-0">
              <p class="font-bold text-slate-700 truncate">{{ rest.name }}</p>
            </div>
            <div class="text-right">
              <p class="font-black text-purple-600">฿{{ rest.revenue.toLocaleString() }}</p>
            </div>
          </div>
        </div>
        <div v-else class="flex-grow flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <div class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-xs font-medium">ไม่มีข้อมูลร้านอาหาร</p>
        </div>
      </div>

      <!-- Recent Orders (Desktop version takes more space if no topRestaurants) -->
      <div :class="dashboardStore.topRestaurants ? 'lg:col-span-1' : 'lg:col-span-2'" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ออเดอร์ล่าสุด
        </h2>

        <div v-if="dashboardStore.recentOrders?.length > 0" class="flex-grow overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr class="text-slate-400 border-slate-50 text-[10px] uppercase tracking-wider">
                <th>ออเดอร์</th>
                <th>วัน-เวลา</th>
                <th>ยอดรวม</th>
                <th class="text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="text-slate-600">
              <tr v-for="order in dashboardStore.recentOrders.slice(0, 6)" :key="order.id" class="border-slate-50 hover:bg-slate-50/50">
                <td class="font-bold text-xs">#{{ order.id.slice(-5).toUpperCase() }}</td>
                <td class="text-[10px] whitespace-nowrap">{{ formatDate(order.CreatedAt) }}</td>
                <td class="font-black text-xs">฿{{ (order.TotalPrice || order.localTotal || 0).toLocaleString() }}</td>
                <td class="text-center">
                  <span :class="getStatusClass(order.OrderStatus)" class="px-2 py-0.5 rounded-full text-[9px] font-bold">
                    {{ getStatusLabel(order.OrderStatus) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex-grow flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <div class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-xs font-medium">ไม่มีออเดอร์ในช่วงเวลานี้</p>
        </div>
      </div>
    </div>

    <!-- Inactive Menu Alert Section -->
    <div v-if="dashboardStore.inactiveMenus?.length > 0" class="bg-amber-50 rounded-2xl p-6 border border-amber-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-amber-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          คำแนะนำ: เมนูที่ไม่มีออเดอร์เลยในรอบ 14 วัน ({{ dashboardStore.inactiveMenus.length }})
        </h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="menu in dashboardStore.inactiveMenus.slice(0, 10)" :key="menu.id" 
             class="bg-white px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 border border-amber-200 shadow-sm flex items-center gap-2">
          <span v-if="menu.restaurant" class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{{ menu.restaurant }}</span>
          {{ menu.name }}
        </div>
        <div v-if="dashboardStore.inactiveMenus.length > 10" class="text-xs text-amber-600 font-bold flex items-center px-2">
          +{{ dashboardStore.inactiveMenus.length - 10 }} เมนูอื่นๆ
        </div>
      </div>
      <p class="text-[10px] text-amber-600/70 mt-4 italic">* ข้อมูลนี้ช่วยให้คุณตัดสินใจปรับปรุงรายการอาหาร หรือทำโปรโมชั่นเพื่อกระตุ้นยอดขายได้</p>
    </div>
  </div>
</template>

<style scoped>
.table :where(thead, tfoot) :where(th, td) {
  background-color: transparent;
}
</style>
