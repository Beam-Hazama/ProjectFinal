<script setup>
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const selectedMonth = ref(currentMonth);
const selectedYear = ref(currentYear);

const allMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const availableYears = computed(() => {
  const yearSet = new Set([currentYear]);
  if (props.dashboardStore.allOrders && props.dashboardStore.allOrders.length > 0) {
    props.dashboardStore.allOrders.forEach(order => {
      const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
      if (d && !isNaN(d)) yearSet.add(d.getFullYear());
    });
  }
  return Array.from(yearSet).sort((a, b) => b - a);
});

const availableMonths = computed(() => {
  const options = [{ value: 'all', label: 'ทุกเดือน' }];
  const monthSet = new Set();
  
  if (selectedYear.value === currentYear) {
    monthSet.add(currentMonth);
  }
  
  if (props.dashboardStore.allOrders && props.dashboardStore.allOrders.length > 0) {
    props.dashboardStore.allOrders.forEach(order => {
      const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
      if (d && !isNaN(d) && d.getFullYear() === selectedYear.value) {
        monthSet.add(d.getMonth());
      }
    });
  }
  
  const sortedMonths = Array.from(monthSet).sort((a, b) => a - b).map(m => ({ value: m, label: allMonths[m] }));
  return options.concat(sortedMonths);
});

watch(availableYears, (newYears) => {
  if (newYears.length > 0 && !newYears.includes(selectedYear.value)) {
    selectedYear.value = newYears[0];
  }
});

watch(availableMonths, (newMonths) => {
  if (newMonths.length > 0 && !newMonths.find(m => m.value === selectedMonth.value)) {
    selectedMonth.value = newMonths[0].value;
  }
});

const updateDashboardStore = () => {
  let startStr, endStr;
  
  if (selectedMonth.value === 'all') {
    const start = new Date(selectedYear.value, 0, 1);
    const end = new Date(selectedYear.value, 11, 31, 23, 59, 59, 999);
    startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  } else {
    const start = new Date(selectedYear.value, selectedMonth.value, 1);
    const end = new Date(selectedYear.value, selectedMonth.value + 1, 0, 23, 59, 59, 999);
    startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  }
  
  // Clear other filters as requested
  if (props.dashboardStore.restaurantFilters && props.dashboardStore.restaurantFilters.length > 0) {
      props.dashboardStore.restaurantFilters = [];
  }
  if (props.dashboardStore.menuFilters && props.dashboardStore.menuFilters.length > 0) {
      props.dashboardStore.menuFilters = [];
  }
  if (props.dashboardStore.menuCategoryFilters && props.dashboardStore.menuCategoryFilters.length > 0) {
      props.dashboardStore.menuCategoryFilters = [];
  }

  props.dashboardStore.setTimeFilter('custom');
  props.dashboardStore.setCustomDates(startStr, endStr);
};

watch([selectedMonth, selectedYear], () => {
  updateDashboardStore();
});

watch(() => props.dashboardStore.allOrders, (newOrders) => {
    if(newOrders && newOrders.length > 0) {
        updateDashboardStore();
    }
});

onMounted(() => {
    updateDashboardStore();
});

</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <div class="text-3xl font-bold text-slate-700">Dashboard</div>

    <div class="flex items-center gap-3 mt-4 md:mt-0">
      <select class="select select-bordered min-w-[140px]" v-model="selectedMonth">
        <option v-for="m in availableMonths" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>

      <select class="select select-bordered" v-model="selectedYear">
        <option v-for="y in availableYears" :key="y" :value="y">
          {{ y }}
        </option>
      </select>
    </div>
  </div>
</template>
