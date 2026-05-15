<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  dashboardStore: Object,
  restaurantName: String // Optional: if provided, filter for this restaurant
});

const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 30000); // Update every 30s
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const activeOrders = computed(() => {
  const orders = props.dashboardStore.allOrders || [];
  return orders.filter(o => {
    const isActive = ['pending', 'cooking', 'preparing', 'dispatched'].includes(o.OrderStatus);
    if (!isActive) return false;
    
    if (props.restaurantName) {
      return o.RestaurantsInOrder?.includes(props.restaurantName);
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
    const timeB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
    return timeA - timeB; // Oldest first
  });
});

const getWaitTime = (createdAt) => {
  if (!createdAt) return 0;
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const diff = now.value - created;
  return Math.floor(diff / 60000); // Minutes
};

const getWaitTimeColor = (minutes) => {
  if (minutes > 30) return 'text-rose-600 bg-rose-50';
  if (minutes > 15) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-amber-500';
    case 'cooking':
    case 'preparing': return 'bg-blue-500';
    case 'dispatched': return 'bg-indigo-500';
    default: return 'bg-slate-400';
  }
};
</script>

<template>
  <div v-if="activeOrders.length > 0" class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
          <div class="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
        </div>
        <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">ออเดอร์ที่กำลังดำเนินการ ({{ activeOrders.length }})</h2>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="order in activeOrders.slice(0, 8)" :key="order.id" 
           class="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
        <div class="flex justify-between items-start mb-3">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{{ order.id.slice(-5).toUpperCase() }}</p>
            <div class="flex items-center gap-1.5 mt-1">
              <div :class="getStatusColor(order.OrderStatus)" class="w-2 h-2 rounded-full"></div>
              <p class="text-xs font-bold text-slate-700 capitalize">{{ order.OrderStatus }}</p>
            </div>
          </div>
          <div :class="getWaitTimeColor(getWaitTime(order.CreatedAt))" class="px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ getWaitTime(order.CreatedAt) }}m
          </div>
        </div>

        <div class="space-y-1 mb-4">
          <p class="text-xs font-medium text-slate-600 truncate">{{ order.CustomerName || 'Customer' }}</p>
          <p class="text-[10px] text-slate-400">{{ order.Menu?.length || 0 }} รายการ • ฿{{ (order.TotalPrice || order.localTotal || 0).toLocaleString() }}</p>
        </div>

        <div class="flex items-center gap-2">
            <div v-for="(item, idx) in order.Menu?.slice(0, 3)" :key="idx" class="w-6 h-6 rounded-md bg-white border border-slate-200 overflow-hidden shrink-0">
                <img :src="item.ImageUrl" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="item">
            </div>
            <div v-if="order.Menu?.length > 3" class="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                +{{ order.Menu.length - 3 }}
            </div>
        </div>
      </div>
      
      <div v-if="activeOrders.length > 8" class="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-indigo-100 transition-colors">
        <p class="text-indigo-600 font-black text-xl">+{{ activeOrders.length - 8 }}</p>
        <p class="text-[10px] font-bold text-indigo-500 uppercase mt-1">ดูทั้งหมด</p>
      </div>
    </div>
  </div>
</template>
