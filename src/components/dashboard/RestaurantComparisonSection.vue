<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const restA = computed({
  get: () => props.dashboardStore.comparisonRestA,
  set: (val) => props.dashboardStore.setComparisonRestaurants(val, props.dashboardStore.comparisonRestB)
});

const restB = computed({
  get: () => props.dashboardStore.comparisonRestB,
  set: (val) => props.dashboardStore.setComparisonRestaurants(props.dashboardStore.comparisonRestA, val)
});

const comparisonData = computed(() => props.dashboardStore.comparisonResults);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: comparisonData.value.restA.chartData.map(d => d.date),
    labels: { style: { colors: '#64748b', fontSize: '10px' } }
  },
  yaxis: {
    labels: {
      formatter: (val) => '฿' + val.toLocaleString(),
      style: { colors: '#64748b' }
    }
  },
  fill: { opacity: 1 },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val) => '฿' + val.toLocaleString() }
  },
  colors: ['#4f46e5', '#f59e0b'],
  legend: { position: 'top', horizontalAlign: 'right' }
}));

const chartSeries = computed(() => [
  {
    name: props.dashboardStore.comparisonRestA || 'ร้านที่ 1',
    data: comparisonData.value.restA.chartData.map(d => d.revenue)
  },
  {
    name: props.dashboardStore.comparisonRestB || 'ร้านที่ 2',
    data: comparisonData.value.restB.chartData.map(d => d.revenue)
  }
]);

// Re-run comparison when time filter changes
watch(() => props.dashboardStore.timeFilter, () => {
    if (props.dashboardStore.comparisonRestA && props.dashboardStore.comparisonRestB) {
        props.dashboardStore.runComparison();
    }
});
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-xl font-black text-slate-800 flex items-center gap-2">
          <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
          เปรียบเทียบระหว่างร้านอาหาร
        </h2>
        <p class="text-slate-400 text-sm mt-1">วิเคราะห์ความแตกต่างของผลประกอบการ 2 ร้านอาหาร</p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <select v-model="restA" class="select select-sm select-bordered bg-slate-50 border-slate-200 text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>เลือกร้านอาหารที่ 1</option>
          <option v-for="r in dashboardStore.availableRestaurants" :key="r" :value="r" :disabled="r === restB">
            {{ r }}
          </option>
        </select>
        <span class="text-slate-300 font-bold">VS</span>
        <select v-model="restB" class="select select-sm select-bordered bg-slate-50 border-slate-200 text-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500/20">
          <option value="" disabled>เลือกร้านอาหารที่ 2</option>
          <option v-for="r in dashboardStore.availableRestaurants" :key="r" :value="r" :disabled="r === restA">
            {{ r }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="restA && restB" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Comparison Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Revenue Comparison -->
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">รายได้รวม</p>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-600 font-medium truncate max-w-[120px]">{{ restA }}</span>
                <span class="font-bold text-indigo-600">฿{{ comparisonData.restA.revenue.toLocaleString() }}</span>
              </div>
              <div class="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div class="bg-indigo-600 h-full transition-all duration-1000" 
                     :style="{ width: (comparisonData.restA.revenue / (comparisonData.restA.revenue + comparisonData.restB.revenue) * 100 || 50) + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-600 font-medium truncate max-w-[120px]">{{ restB }}</span>
                <span class="font-bold text-orange-600">฿{{ comparisonData.restB.revenue.toLocaleString() }}</span>
              </div>
              <div class="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div class="bg-orange-500 h-full transition-all duration-1000" 
                     :style="{ width: (comparisonData.restB.revenue / (comparisonData.restA.revenue + comparisonData.restB.revenue) * 100 || 50) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Comparison -->
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">จำนวนออเดอร์</p>
          <div class="flex items-center justify-between gap-4">
            <div class="text-center flex-1">
              <p class="text-2xl font-black text-indigo-600">{{ comparisonData.restA.orders }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">{{ restA.slice(0,10) }}</p>
            </div>
            <div class="w-px h-10 bg-slate-200"></div>
            <div class="text-center flex-1">
              <p class="text-2xl font-black text-orange-600">{{ comparisonData.restB.orders }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">{{ restB.slice(0,10) }}</p>
            </div>
          </div>
        </div>

        <!-- AOV Comparison -->
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">ยอดต่อบิลเฉลี่ย (AOV)</p>
          <div class="flex items-center justify-between gap-4">
            <div class="text-center flex-1">
              <p class="text-xl font-black text-slate-700">฿{{ Math.round(comparisonData.restA.aov).toLocaleString() }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">{{ restA.slice(0,10) }}</p>
            </div>
            <div class="w-px h-10 bg-slate-200"></div>
            <div class="text-center flex-1">
              <p class="text-xl font-black text-slate-700">฿{{ Math.round(comparisonData.restB.aov).toLocaleString() }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">{{ restB.slice(0,10) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Comparison -->
      <div class="mt-8">
        <h3 class="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">เปรียบเทียบรายได้รายวัน</h3>
        <div class="h-80 w-full">
          <apexchart type="bar" height="100%" :options="chartOptions" :series="chartSeries"></apexchart>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-20 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-700 mb-2">กรุณาเลือกร้านอาหารเพื่อเริ่มการเปรียบเทียบ</h3>
      <p class="text-slate-400 max-w-xs mx-auto">เลือก 2 ร้านอาหารที่คุณต้องการวิเคราะห์ข้อมูลเปรียบเทียบจากเมนู Dropdown ด้านบน</p>
    </div>
  </div>
</template>
