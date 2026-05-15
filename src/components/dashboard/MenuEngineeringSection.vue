<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { menuMatrixOptions } from '@/utils/chartConfig';

const props = defineProps({
  dashboardStore: Object
});

const matrixData = computed(() => props.dashboardStore.menuEngineeringData);

const avgProfit = computed(() => matrixData.value[0]?.avgProfit || 0);
const avgQuantity = computed(() => matrixData.value[0]?.avgQuantity || 0);

const chartOptions = computed(() => menuMatrixOptions(avgProfit.value, avgQuantity.value));

const chartSeries = computed(() => {
  const stars = matrixData.value.filter(d => d.type === 'Star').map(d => [d.quantity, d.profit, 15, d.name]);
  const plowhorses = matrixData.value.filter(d => d.type === 'Plowhorse').map(d => [d.quantity, d.profit, 15, d.name]);
  const puzzles = matrixData.value.filter(d => d.type === 'Puzzle').map(d => [d.quantity, d.profit, 15, d.name]);
  const dogs = matrixData.value.filter(d => d.type === 'Dog').map(d => [d.quantity, d.profit, 15, d.name]);

  return [
    { name: 'Stars (กำไรดี+ขายดี)', data: stars },
    { name: 'Plowhorses (กำไรน้อย+ขายดี)', data: plowhorses },
    { name: 'Puzzles (กำไรดี+ขายยาก)', data: puzzles },
    { name: 'Dogs (กำไรน้อย+ขายยาก)', data: dogs }
  ];
});

const groups = computed(() => {
  const result = { Star: [], Plowhorse: [], Puzzle: [], Dog: [] };
  matrixData.value.forEach(item => {
    if (result[item.type]) result[item.type].push(item);
  });
  return result;
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden relative">
      <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-bl-full -mr-20 -mt-20 pointer-events-none"></div>
      
      <div class="mb-8 relative z-10">
        <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
          <div class="w-2 h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></div>
          วิเคราะห์ศักยภาพเมนู
        </h2>
        <p class="text-slate-400 text-sm mt-1">วิเคราะห์ศักยภาพเมนูผ่านความสัมพันธ์ระหว่าง "ความนิยม" และ "กำไร"</p>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- Matrix Chart -->
        <div class="h-[500px]">
          <VueApexCharts type="bubble" height="100%" :options="chartOptions" :series="chartSeries" />
        </div>


      </div>
    </div>
  </div>
</template>
