<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useDashboardStore } from '@/stores/admin/dashboard';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue';
import DashboardSummaryStats from '@/components/dashboard/DashboardSummaryStats.vue';
import DashboardChartsSection from '@/components/dashboard/DashboardChartsSection.vue';
import DashboardListsSection from '@/components/dashboard/DashboardListsSection.vue';
import RestaurantComparisonSection from '@/components/dashboard/RestaurantComparisonSection.vue';
// import ActiveOrdersFeed from '@/components/dashboard/ActiveOrdersFeed.vue';
import FinancialStatementSection from '@/components/dashboard/FinancialStatementSection.vue';
import SalesGoalCard from '@/components/dashboard/SalesGoalCard.vue';

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
      
      <!-- <ActiveOrdersFeed :dashboardStore="dashboardStore" class="mb-6" /> -->

      <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลสถิติ...</p>
      </div>
  
      <div v-else class="space-y-6">
        <SalesGoalCard :dashboardStore="dashboardStore" :isAdmin="true" />
        <DashboardSummaryStats :dashboardStore="dashboardStore" />
        <DashboardChartsSection :dashboardStore="dashboardStore" />
        <RestaurantComparisonSection :dashboardStore="dashboardStore" />
        <FinancialStatementSection :dashboardStore="dashboardStore" :isAdmin="true" />
        <DashboardListsSection :dashboardStore="dashboardStore" />
      </div>
    </div>
  </LayoutAdmin>
</template>

<style scoped>
:deep(.vue-apexcharts) {
  min-height: 100%;
}
</style>
