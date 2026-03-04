<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRestaurantDashboardStore } from '@/stores/restaurantDashboard';
import { useAccountStore } from '@/stores/account'
import restaurantLayout from '@/page/Restaurant/restaurant.vue';

const dashboardStore = useRestaurantDashboardStore();

const accountStore = useAccountStore()

onMounted(async () => {
    await accountStore.checkAuthState()

    if (accountStore.user?.Restaurant) {
        dashboardStore.loadDashboardData(accountStore.user.Restaurant)
    }
})

watch(
    () => accountStore.user,
    (user) => {
        if (user?.Restaurant) {
            dashboardStore.loadDashboardData(user.Restaurant)
        }
    }
)

onUnmounted(() => {
    dashboardStore.clearListeners()
})
</script>

<template>
    <restaurantLayout>
        <div class="p-6 font-sans">


            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">Dashboard</h1>
                </div>
<<<<<<< HEAD

                <!-- Refresh Button -->
                <button @click="dashboardStore.loadDashboardData(accountStore.user?.Restaurant)"
                    class="btn btn-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4" :class="{ 'animate-spin': dashboardStore.isLoading }">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    รีเฟรชข้อมูล
                </button>
=======
>>>>>>> b41e0d79b23554bc4cff6e56557eafe63ba6af40
            </div>


            <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20">
                <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
                <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลสถิติ...</p>
            </div>

            <div v-else class="space-y-6">

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


                    <div
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 leading-none to-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
                        </div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-sm font-bold text-slate-500 mb-1">ยอดขายรวมของคุณ</p>
                                <h3 class="text-3xl font-extrabold text-slate-800">฿{{
                                    dashboardStore.totalRevenue.toLocaleString() }}
                                </h3>
                            </div>
                            <div
                                class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                    </div>


                    <div
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-sky-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
                        </div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-sm font-bold text-slate-500 mb-1">ออเดอร์ทั้งหมด</p>
                                <h3 class="text-3xl font-extrabold text-slate-800">{{
                                    dashboardStore.totalOrders.toLocaleString() }}
                                </h3>
                            </div>
                            <div
                                class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                    </div>


                    <div
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
                        </div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-sm font-bold text-slate-500 mb-1">เมนูอาหารของคุณ</p>
                                <h3 class="text-3xl font-extrabold text-slate-800">{{
                                    dashboardStore.totalProducts.toLocaleString() }}
                                </h3>
                            </div>
                            <div
                                class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>


                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">


                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                        <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            ยอดขายย้อนหลัง 7 วัน
                        </h2>
                        <div class="h-72 w-full">
                            <apexchart type="bar" height="100%" :options="dashboardStore.salesChartOptions"
                                :series="dashboardStore.salesChartSeries"></apexchart>
                        </div>
                    </div>


                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
                        <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            หมวดหมู่เมนู
                        </h2>
                        <div class="h-72 w-full flex items-center justify-center">
                            <apexchart v-if="dashboardStore.categoryChartSeries.length > 0" type="donut" width="100%"
                                :options="dashboardStore.categoryChartOptions"
                                :series="dashboardStore.categoryChartSeries"></apexchart>
                            <div v-else class="text-slate-400 text-sm">ไม่มีข้อมูลหมวดหมู่</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </restaurantLayout>
</template>

<style scoped>
.vue-apexcharts {
    min-height: 100%;
}
</style>
