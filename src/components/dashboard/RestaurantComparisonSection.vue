<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const selectedRestaurants = computed({
  get: () => props.dashboardStore.comparisonRestaurants || [],
  set: (val) => {
    props.dashboardStore.comparisonRestaurants = val;
    props.dashboardStore.runComparison();
  }
});

const comparisonData = computed(() => {
  return props.dashboardStore.comparisonResults || {};
});

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
    }
  },

  dataLabels: {
    enabled: false
  },

  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },

  xaxis: {
    categories:
      Object.values(comparisonData.value)[0]?.chartData?.map(d => d.date) || [],
    labels: {
      style: {
        colors: '#64748b',
        fontSize: '10px'
      }
    }
  },

  yaxis: {
    labels: {
      formatter: (val) => '฿' + val.toLocaleString(),
      style: {
        colors: '#64748b'
      }
    }
  },

  fill: {
    opacity: 1
  },

  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => '฿' + val.toLocaleString()
    }
  },

  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',

    formatter(seriesName) {
      return seriesName;
    },
    labels: {
    colors: '#475569'
  },
  },
  
}));

const chartSeries = computed(() => {
  return Object.entries(comparisonData.value).map(([restaurantName, data]) => ({
    name: restaurantName,
    data: data.chartData.map(d => d.revenue)
  }));
});

watch(
  () => props.dashboardStore.timeFilter,
  () => {
    props.dashboardStore.runComparison();
  }
);
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-xl font-black text-slate-800 flex items-center gap-2">
          <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
          เปรียบเทียบร้านอาหาร
        </h2>

        <p class="text-slate-400 text-sm mt-1">
          เปรียบเทียบข้อมูลหลายร้านพร้อมกัน
        </p>
      </div>

      <!-- Multi Select -->
      <div class="w-full md:w-[400px]">
        <select
          multiple
          v-model="selectedRestaurants"
          class="select select-bordered w-full h-40 bg-slate-50 border-slate-200"
        >
          <option
            v-for="r in dashboardStore.availableRestaurants"
            :key="r"
            :value="r"
          >
            {{ r }}
          </option>
        </select>

        <p class="text-xs text-slate-400 mt-2">
          กด ⌘ Command ค้างเพื่อเลือกหลายร้าน
        </p>
      </div>
    </div>

    <!-- CONTENT -->
    <div
      v-if="selectedRestaurants.length > 0"
      class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      
      <!-- Chart -->
      <div>
        <h3 class="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">
          เปรียบเทียบรายได้รายวัน
        </h3>

        <div class="h-96 w-full">
          <apexchart
            type="bar"
            height="100%"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </div>

    </div>

    <!-- Empty -->
    <div
      v-else
      class="py-20 flex flex-col items-center justify-center text-center"
    >
      <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg"
             class="h-10 w-10"
             fill="none"
             viewBox="0 0 24 24"
             stroke="currentColor">
          <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>

      <h3 class="text-lg font-bold text-slate-700 mb-2">
        กรุณาเลือกร้านอาหาร
      </h3>

      <p class="text-slate-400 max-w-xs mx-auto">
        สามารถเลือกได้หลายร้านพร้อมกัน
      </p>
    </div>

  </div>
</template>