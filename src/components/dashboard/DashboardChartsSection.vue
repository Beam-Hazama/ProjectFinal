<script setup>
import { onMounted, ref, computed ,watch} from 'vue';
import { salesChartOptions, peakHoursChartOptions, salesByRestaurantChartOptions } from '@/utils/chartConfig';

const props = defineProps({
  dashboardStore: Object,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const isReady = ref(false);

const selectedRestaurants = ref([]);

const restaurantList = computed(() => {
  return props.dashboardStore.financialData || [];
});

watch(
  () => props.dashboardStore.financialData,
  (data) => {
    if (data?.length && selectedRestaurants.value.length === 0) {
      selectedRestaurants.value = data.map(
        r => r.id || r.name
      );
    }
  },
  { immediate: true }
);

const filteredRestaurantData = computed(() => {
  const data = props.dashboardStore.financialData || [];

  return data
    .filter(r =>
      selectedRestaurants.value.includes(
        r.id || r.name
      )
    )
    .sort((a, b) => b.revenue - a.revenue); // มาก → น้อย
});

const selectAllRestaurants = () => {
  selectedRestaurants.value =
    restaurantList.value.map(
      r => r.id || r.name
    );
};

const clearAllRestaurants = () => {
  selectedRestaurants.value = [];
};

const salesOptions = computed(() => salesChartOptions(props.dashboardStore.revenueByDay.map(d => d.date)));

const peakHoursOptions = computed(() => peakHoursChartOptions(props.dashboardStore.ordersByHour.map(h => h.hour)));

const restaurantSalesOptions = computed(() => {
  return salesByRestaurantChartOptions(
    filteredRestaurantData.value.map(
      d => d.name
    )
  );
});

const restaurantSalesSeries = computed(() => {
  return [{
    name: 'ยอดขาย',
    data: filteredRestaurantData.value.map(
      d => Math.round(d.revenue)
    )
  }];
});

onMounted(() => {
  setTimeout(() => {
    isReady.value = true;
  }, 100);
});
</script>

<template>
  <div v-if="isReady" class="space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1 1V4z" />
        </svg>
        ยอดขาย
      </h2>
      <div class="h-72 w-full">
        <apexchart v-if="dashboardStore.salesChartSeries[0]?.data?.length > 0" 
          :key="'sales-' + dashboardStore.timeFilter + dashboardStore.salesChartSeries[0].data.length"
          type="bar" height="100%"
          :options="salesOptions" :series="dashboardStore.salesChartSeries">
        </apexchart>
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium">ยังไม่มีข้อมูลยอดขายในช่วงนี้</p>
        </div>
      </div>
    </div>
    <div v-if="isAdmin" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        ยอดขายแต่ละร้าน
      </h2>
      <div class="mb-4 flex justify-end items-center">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-medium shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            ตัวกรองร้านอาหาร <span class="badge badge-sm badge-indigo">{{ selectedRestaurants.length }}</span>
          </label>
          <div tabindex="0" class="dropdown-content z-[1] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-base-100 rounded-2xl w-80 mt-2 border border-slate-100">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <span class="text-sm font-bold text-slate-700">เลือกร้านที่ต้องการแสดง</span>
              <div class="flex gap-2">
                <button type="button" @click="selectAllRestaurants" class="px-2 py-1 text-[11px] rounded-md bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors">
                  เลือกทั้งหมด
                </button>
                <button type="button" @click="clearAllRestaurants" class="px-2 py-1 text-[11px] rounded-md bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                  ล้างทั้งหมด
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
              <label v-for="restaurant in restaurantList" :key="restaurant.id || restaurant.name" class="flex items-center gap-3 text-sm cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                <input type="checkbox" :value="restaurant.id || restaurant.name" v-model="selectedRestaurants" class="checkbox checkbox-sm checkbox-primary rounded" />
                <span class="font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{{ restaurant.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="h-72 w-full">
        <apexchart v-if="restaurantSalesSeries[0]?.data?.length > 0" 
          :key="'rest-sales-' + selectedRestaurants.join('-')"
          type="bar" height="100%"
          :options="restaurantSalesOptions" :series="restaurantSalesSeries">
        </apexchart>
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-sm font-medium">ยังไม่มีข้อมูลยอดขายร้านอาหาร</p>
        </div>
      </div>
    </div>
  </div>
</template>
