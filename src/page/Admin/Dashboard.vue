<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useDashboardStore } from '@/stores/admin/dashboard';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import DashboardFilters from './components/dashboard/DashboardFilters.vue';
import DashboardSummaryStats from './components/dashboard/DashboardSummaryStats.vue';
import DashboardChartsSection from './components/dashboard/DashboardChartsSection.vue';
import DashboardDataTables from './components/dashboard/DashboardDataTables.vue';

const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.loadDashboardData();
});

onUnmounted(() => {
  dashboardStore.clearListeners();
});
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <DashboardFilters :dashboardStore="dashboardStore" />

      <!-- Loading State -->
      <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลสถิติ...</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        <DashboardSummaryStats :dashboardStore="dashboardStore" />
        <DashboardChartsSection :dashboardStore="dashboardStore" />
        <DashboardDataTables :dashboardStore="dashboardStore" />
      </div>
    </div>
  </LayoutAdmin>
</template>

<style scoped>
:deep(.vue-apexcharts) {
  min-height: 100%;
}
</style>
