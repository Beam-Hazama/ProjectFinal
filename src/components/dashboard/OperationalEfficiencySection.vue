<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { successGaugeOptions } from '@/utils/chartConfig';

const props = defineProps({
  dashboardStore: Object
});

const gaugeOptions = computed(() => successGaugeOptions(props.dashboardStore.successRate));
const gaugeSeries = computed(() => [props.dashboardStore.successRate]);


</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
    <!-- Success Rate Gauge -->
    <div class="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden h-full">

      
      <div class="text-center mb-2">
        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">อัตราการทำสำเร็จ</h3>
        <p class="text-[10px] text-slate-400">อัตราการทำออเดอร์สำเร็จ</p>
      </div>

      <div class="w-full">
        <VueApexCharts
          type="radialBar"
          height="280"
          :options="gaugeOptions"
          :series="gaugeSeries"
        />
      </div>


    </div>

    <div class="lg:col-span-2 h-full">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group h-full">
        <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
        
        <div class="relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">เวลาเตรียมอาหารเฉลี่ย</p>
            <div class="flex items-baseline gap-2">
                <h3 class="text-5xl font-black text-slate-800">{{ dashboardStore.averagePrepTime }}</h3>
                <span class="text-xl font-bold text-slate-400 uppercase">นาที</span>
            </div>
            
            <div class="mt-8 pt-6 border-t border-slate-50">
                <div class="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>ความเร็วในการบริการ</span>
                    <span :class="dashboardStore.averagePrepTime <= 15 ? 'text-emerald-500' : 'text-amber-500'" class="font-bold">
                        {{ dashboardStore.averagePrepTime <= 15 ? 'ดีเยี่ยม ⚡' : 'ปกติ' }}
                    </span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div class="bg-blue-600 h-full rounded-full transition-all duration-1000" :style="{ width: Math.min((dashboardStore.averagePrepTime / 30) * 100, 100) + '%' }"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
