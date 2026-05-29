<script setup>
import { computed, ref } from 'vue';

const showAllMenusModal = ref(false);
const showAllRestaurantsModal = ref(false);

const props = defineProps({
  dashboardStore: Object,
  isAdmin: Boolean
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
    case 'cooking': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'รอดำเนินการ';
    case 'cooking': return 'กำลังทำอาหาร';
    case 'completed': return 'เสร็จสิ้น';
    case 'cancelled': return 'ยกเลิก';
    default: return status;
  }
};

</script>

<template>
  <div class="space-y-6">


    <div class="grid grid-cols-1 gap-6" :class="dashboardStore.topRestaurants ? 'lg:grid-cols-2' : ''">
      <!-- Top Selling Menus -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
            </svg>
            เมนูยอดขายสูงสุด
          </h2>
          <button v-if="dashboardStore.topMenuItems?.length > 5" @click="showAllMenusModal = true" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            ทั้งหมด
          </button>
        </div>
        
        <div v-if="dashboardStore.topMenuItems?.length > 0" class="space-y-4 flex-grow">
          <div v-for="(item, index) in dashboardStore.topMenuItems.slice(0, 5)" :key="index" class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
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
              <p v-if="isAdmin && item.restaurantName" class="text-[10px] text-slate-400 font-medium truncate mb-0.5">{{ item.restaurantName }}</p>
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
          <p class="text-xs font-medium">ยังไม่มีอันดับเมนูยอดขายสูงสุด</p>
        </div>
      </div>

      <!-- Top Performing Restaurants (Admin only) or Placeholder for Restaurant -->
      <div v-if="dashboardStore.topRestaurants" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            ร้านอาหารทำยอดสูงสุด
          </h2>
          <button v-if="dashboardStore.topRestaurants?.length > 5" @click="showAllRestaurantsModal = true" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            ทั้งหมด
          </button>
        </div>

        <div v-if="dashboardStore.topRestaurants?.length > 0" class="space-y-4 flex-grow">
          <div v-for="(rest, index) in dashboardStore.topRestaurants.slice(0, 5)" :key="index" class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
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


    </div>

    <!-- All Menus Modal -->
    <dialog class="modal" :class="{'modal-open': showAllMenusModal}">
      <div class="modal-box max-w-3xl p-0 overflow-hidden bg-white">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 class="font-bold text-lg text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
            </svg>
            อันดับเมนูยอดขายสูงสุด (ทั้งหมด)
          </h3>
          <button @click="showAllMenusModal = false" class="btn btn-sm btn-circle btn-ghost text-slate-500">✕</button>
        </div>
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div class="space-y-4">
            <div v-for="(item, index) in dashboardStore.topMenuItems" :key="'modal-'+index" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-slate-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center shrink-0">
                {{ index + 1 }}
              </div>
              <div class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" alt="menu">
                <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <p class="font-bold text-slate-700 text-lg truncate">{{ item.name }}</p>
                <p v-if="isAdmin && item.restaurantName" class="text-xs text-slate-400 font-medium truncate mt-0.5">{{ item.restaurantName }}</p>
                <p class="text-sm text-slate-500 mt-0.5">{{ item.qty }} ออเดอร์</p>
              </div>
              <div class="text-right">
                <p class="font-black text-indigo-600 text-lg">฿{{ item.revenue.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showAllMenusModal = false">close</button>
      </form>
    </dialog>

    <!-- All Restaurants Modal -->
    <dialog class="modal" :class="{'modal-open': showAllRestaurantsModal}">
      <div class="modal-box max-w-2xl p-0 overflow-hidden bg-white">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 class="font-bold text-lg text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            อันดับร้านอาหารทำยอดสูงสุด (ทั้งหมด)
          </h3>
          <button @click="showAllRestaurantsModal = false" class="btn btn-sm btn-circle btn-ghost text-slate-500">✕</button>
        </div>
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div class="space-y-4">
            <div v-for="(rest, index) in dashboardStore.topRestaurants" :key="'modal-rest-'+index" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-slate-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-black flex items-center justify-center shrink-0">
                {{ index + 1 }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="font-bold text-slate-700 text-lg truncate">{{ rest.name }}</p>
              </div>
              <div class="text-right">
                <p class="font-black text-purple-600 text-lg">฿{{ rest.revenue.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showAllRestaurantsModal = false">close</button>
      </form>
    </dialog>

  </div>
</template>

<style scoped>
.table :where(thead, tfoot) :where(th, td) {
  background-color: transparent;
}
</style>
