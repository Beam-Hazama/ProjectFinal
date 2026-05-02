<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRestaurantDashboardStore } from '@/stores/restaurantDashboard';
import { useAccountStore } from '@/stores/accountStore';
import RestaurantLayout from '@/page/Restaurant/restaurant.vue';
import DashboardFilters from './components/Dashboard/DashboardFilters.vue';
import DashboardSummaryStats from './components/Dashboard/DashboardSummaryStats.vue';
import DashboardChartsSection from './components/Dashboard/DashboardChartsSection.vue';
import DashboardDataTables from './components/Dashboard/DashboardDataTables.vue';

const dashboardStore = useRestaurantDashboardStore();
const accountStore = useAccountStore();

onMounted(async () => {
    await loadData();
});

const loadData = async () => {
    await accountStore.checkAuthState();
    if (accountStore.user?.Restaurant) {
        dashboardStore.loadDashboardData(accountStore.user.Restaurant);
    }
};

onUnmounted(() => {
    dashboardStore.clearListeners();
});

watch(
    () => accountStore.user,
    (user) => {
        if (user?.Restaurant) {
            dashboardStore.loadDashboardData(user.Restaurant);
        }
    }
);
</script>

<template>
    <RestaurantLayout>
        <div class="p-6">
            <DashboardFilters :dashboardStore="dashboardStore" />

            <!-- Loading State -->
            <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20">
                <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
                <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลสถิติ...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="dashboardStore.isError" class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
                <p class="text-slate-500 mb-6">{{ dashboardStore.errorMessage || 'กรุณาลองใหม่อีกครั้ง' }}</p>
                <button @click="loadData" class="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none px-8 rounded-xl shadow-lg shadow-indigo-200">
                    ลองใหม่อีกครั้ง
                </button>
            </div>

            <!-- Content -->
            <div v-else class="space-y-6">
                <DashboardSummaryStats :dashboardStore="dashboardStore" />
                <DashboardChartsSection :dashboardStore="dashboardStore" />
                <DashboardDataTables :dashboardStore="dashboardStore" />
            </div>
        </div>
    </RestaurantLayout>
</template>

<style scoped>
:deep(.vue-apexcharts) {
    min-height: 100%;
}
</style>
