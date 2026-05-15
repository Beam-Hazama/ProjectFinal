<script setup>
import { computed, ref, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { forecastChartOptions } from '@/utils/chartConfig';

const props = defineProps({
  dashboardStore: Object
});

const isReady = ref(false);
onMounted(() => setTimeout(() => { isReady.value = true; }, 100));

const actualData = computed(() => props.dashboardStore.revenueByDay || []);

// Weighted moving average forecast for next 7 days
const forecastData = computed(() => {
  const data = actualData.value;
  if (data.length < 3) return [];

  const windowSize = Math.min(7, data.length);
  const win = data.slice(-windowSize);
  const n = win.length;

  // Weighted average: recent days have higher weight
  const weights = win.map((_, i) => i + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedAvg = win.reduce((sum, d, i) => sum + d.revenue * weights[i], 0) / totalWeight;

  // Mild trend from first to last in window (dampened to 30%)
  const trend = n > 1 ? ((win[n - 1].revenue - win[0].revenue) / (n - 1)) * 0.3 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return {
      date: `${dd}/${mm}`,
      revenue: Math.max(0, Math.round(weightedAvg + trend * (i + 1)))
    };
  });
});

const hasData = computed(() => actualData.value.length >= 3);

// Chart categories: all actual dates + 7 forecast dates
const categories = computed(() => [
  ...actualData.value.map(d => d.date),
  ...forecastData.value.map(d => d.date)
]);

// splitIndex = where forecast starts (= length of actual data)
const splitIndex = computed(() => actualData.value.length);

const chartOptions = computed(() =>
  forecastChartOptions(categories.value, splitIndex.value)
);

const chartSeries = computed(() => {
  const n = actualData.value.length;
  const actualRevs = actualData.value.map(d => d.revenue);
  const forecastRevs = forecastData.value.map(d => d.revenue);
  const lastActual = actualRevs[n - 1] ?? 0;

  return [
    {
      name: 'ยอดขายจริง',
      type: 'area',
      data: [...actualRevs, ...Array(7).fill(null)]
    },
    {
      name: 'พยากรณ์ (MA)',
      type: 'line',
      // connect at last actual point so lines join
      data: [...Array(n - 1).fill(null), lastActual, ...forecastRevs]
    }
  ];
});

// Summary stats
const totalForecast = computed(() =>
  forecastData.value.reduce((s, d) => s + d.revenue, 0)
);
const bestForecastDay = computed(() =>
  forecastData.value.reduce((best, d) => d.revenue > best.revenue ? d : best, { date: '-', revenue: 0 })
);
const avgActual = computed(() => {
  const data = actualData.value;
  if (!data.length) return 0;
  return Math.round(data.reduce((s, d) => s + d.revenue, 0) / data.length);
});
const forecastVsAvg = computed(() => {
  if (!avgActual.value) return null;
  const forecastAvg = Math.round(totalForecast.value / 7);
  const diff = ((forecastAvg - avgActual.value) / avgActual.value) * 100;
  return { value: Math.abs(diff).toFixed(1), isUp: diff >= 0 };
});
</script>

<template>
  <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden h-full">
    <div class="absolute top-0 right-0 w-64 h-64 bg-amber-50/30 rounded-bl-full -mr-20 -mt-20 pointer-events-none"></div>

    <div class="mb-6 relative z-10">
      <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
        <div class="w-2 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-100"></div>
        พยากรณ์แนวโน้มรายได้
      </h2>
      <p class="text-slate-400 text-sm mt-1">พยากรณ์รายได้ 7 วันข้างหน้าด้วย Weighted Moving Average — ใช้วางแผนโปรโมชั่นและเตรียมวัตถุดิบ</p>
    </div>

    <!-- ไม่มีข้อมูลเพียงพอ -->
    <div v-if="!hasData" class="flex flex-col items-center justify-center py-16 text-slate-400 relative z-10">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-sm font-bold text-slate-500 mb-1">ข้อมูลไม่เพียงพอ</p>
      <p class="text-xs text-center max-w-xs leading-relaxed">ต้องมีข้อมูลยอดขายอย่างน้อย 3 วันขึ้นไป เพื่อคำนวณแนวโน้ม</p>
    </div>

    <div v-else class="relative z-10">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p class="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">พยากรณ์ 7 วัน</p>
          <p class="text-xl font-black text-amber-700">฿{{ totalForecast.toLocaleString() }}</p>
          <div v-if="forecastVsAvg" class="flex items-center gap-1 mt-1">
            <svg v-if="forecastVsAvg.isUp" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
            </svg>
            <span class="text-[10px] font-bold" :class="forecastVsAvg.isUp ? 'text-emerald-500' : 'text-rose-500'">
              {{ forecastVsAvg.value }}% vs เฉลี่ยเดิม
            </span>
          </div>
        </div>

        <div class="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">เฉลี่ย/วัน (พยากรณ์)</p>
          <p class="text-xl font-black text-indigo-700">฿{{ Math.round(totalForecast / 7).toLocaleString() }}</p>
        </div>

        <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">วันที่คาดว่าดีที่สุด</p>
          <p class="text-xl font-black text-emerald-700">{{ bestForecastDay.date }}</p>
          <p class="text-[10px] text-emerald-600 mt-0.5">฿{{ bestForecastDay.revenue.toLocaleString() }}</p>
        </div>

        <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ฐานข้อมูล (เฉลี่ย/วัน)</p>
          <p class="text-xl font-black text-slate-700">฿{{ avgActual.toLocaleString() }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">จาก {{ actualData.length }} วัน</p>
        </div>
      </div>

      <!-- Chart -->
      <div class="h-72">
        <VueApexCharts v-if="isReady"
          :key="'forecast-' + categories.length"
          type="line"
          height="100%"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>

      <!-- Disclaimer -->
      <p class="text-[10px] text-slate-400 mt-4 italic text-center">
        * การพยากรณ์ใช้ Weighted Moving Average จากข้อมูลย้อนหลัง — เป็นเพียงแนวโน้ม ไม่ใช่ตัวเลขแน่นอน
      </p>
    </div>
  </div>
</template>
