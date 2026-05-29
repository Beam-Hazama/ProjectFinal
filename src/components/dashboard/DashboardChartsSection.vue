<script setup>
import { onMounted, ref, computed } from 'vue';
import { salesChartOptions, peakHoursChartOptions, salesByRestaurantChartOptions } from '@/utils/chartConfig';

const props = defineProps({
  dashboardStore: Object,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const isReady = ref(false);

const salesOptions = computed(() => salesChartOptions(props.dashboardStore.revenueByDay.map(d => d.date)));

const peakHoursOptions = computed(() => peakHoursChartOptions(props.dashboardStore.ordersByHour.map(h => h.hour)));

const restaurantSalesOptions = computed(() => {
  const data = props.dashboardStore.financialData || [];
  return salesByRestaurantChartOptions(data.map(d => d.name));
});

const restaurantSalesSeries = computed(() => {
  const data = props.dashboardStore.financialData || [];
  return [{
    name: 'ยอดขาย',
    data: data.map(d => Math.round(d.revenue))
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
      <div class="h-72 w-full">
        <apexchart v-if="restaurantSalesSeries[0]?.data?.length > 0" 
          :key="'rest-sales-' + dashboardStore.timeFilter + restaurantSalesSeries[0].data.length"
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
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        วิเคราะห์ช่วงเวลาที่ออเดอร์เข้าสูงสุด (Peak Hours)
      </h2>
      <div class="h-72 w-full">
        <apexchart v-if="dashboardStore.peakHoursChartSeries[0]?.data?.length > 0" 
          :key="'peak-' + dashboardStore.timeFilter + dashboardStore.peakHoursChartSeries[0].data.length"
          type="area" height="100%"
          :options="peakHoursOptions" :series="dashboardStore.peakHoursChartSeries"></apexchart>
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium">ไม่มีข้อมูลช่วงเวลาออเดอร์</p>
        </div>
      </div>
    </div>
  </div>
</template>
