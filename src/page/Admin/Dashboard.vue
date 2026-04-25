<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import LayoutAdmin from '@/page/Admin/Admin.vue';

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

      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="text-3xl font-bold text-slate-700">Dashboard</div>

        <div class="flex lg:flex-row flex-col gap-3 w-full lg:w-auto mt-4 md:mt-0">
          <select
            class="select select-bordered select-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
            :value="dashboardStore.timeFilter" @change="dashboardStore.setTimeFilter($event.target.value)">
            <option value="today">วันนี้</option>
            <option value="7days">ย้อนหลัง 7 วัน</option>
            <option value="thisMonth">เดือนนี้</option>
            <option value="all">ทั้งหมด</option>
            <option value="custom">กำหนดเอง</option>
          </select>
          <div v-if="dashboardStore.timeFilter === 'custom'" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <input 
              type="date" 
              class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
              :value="dashboardStore.customStartDate"
              @input="dashboardStore.setCustomDates($event.target.value, dashboardStore.customEndDate)"
            />
            <span class="text-slate-400 font-bold">-</span>
            <input 
              type="date" 
              class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
              :value="dashboardStore.customEndDate"
              @input="dashboardStore.setCustomDates(dashboardStore.customStartDate, $event.target.value)"
            />
          </div>

          <select
            class="select select-bordered select-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
            :value="dashboardStore.menuCategoryFilter"
            @change="dashboardStore.setMenuCategoryFilter($event.target.value)">
            <option value="all">ทุกหมวดหมู่อาหาร</option>
            <option v-for="category in dashboardStore.availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <select
            class="select select-bordered select-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
            :value="dashboardStore.menuFilter" @change="dashboardStore.setMenuFilter($event.target.value)">
            <option value="all">ทุกเมนูอาหาร</option>
            <option v-for="menu in dashboardStore.availableMenus" :key="menu.id" :value="menu.id">
              {{ menu.Name }} <template v-if="menu.Restaurant">- {{ menu.Restaurant }}</template>
            </option>
          </select>

          <select
            class="select select-bordered select-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
            :value="dashboardStore.restaurantFilter" @change="dashboardStore.setRestaurantFilter($event.target.value)">
            <option value="all">ทุกร้านอาหาร</option>
            <option v-for="restaurant in dashboardStore.availableRestaurants" :key="restaurant" :value="restaurant">
              {{ restaurant }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลสถิติ...</p>
      </div>

      
      <div v-else class="space-y-6">
        

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center">
            <span class="text-amber-500 text-xs font-bold mb-1 uppercase tracking-wider">รอดำเนินการ</span>
            <span class="text-2xl font-black text-amber-600">{{ dashboardStore.orderStatuses.pending }}</span>
          </div>
          <div
            class="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
            <span class="text-blue-500 text-xs font-bold mb-1 uppercase tracking-wider">กำลังเตรียม</span>
            <span class="text-2xl font-black text-blue-600">{{ dashboardStore.orderStatuses.preparing ||
              dashboardStore.orderStatuses.cooking || 0 }}</span>
          </div>
          <div
            class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
            <span class="text-emerald-500 text-xs font-bold mb-1 uppercase tracking-wider">เสร็จสิ้น</span>
            <span class="text-2xl font-black text-emerald-600">{{ dashboardStore.orderStatuses.completed }}</span>
          </div>
          <div
            class="bg-rose-50 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center">
            <span class="text-rose-500 text-xs font-bold mb-1 uppercase tracking-wider">ยกเลิก</span>
            <span class="text-2xl font-black text-rose-600">{{ (dashboardStore.orderStatuses.cancelled || 0) +
              (dashboardStore.orderStatuses.returned || 0) }}</span>
          </div>
        </div>

        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 leading-none to-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
            </div>
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ยอดขายรวม</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-slate-800">฿{{ dashboardStore.totalRevenue.toLocaleString() }}</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
            </div>
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">รายได้ค่าธรรมเนียมรวม</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-rose-600">฿{{ dashboardStore.totalCommission.toLocaleString() }}</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ออเดอร์ทั้งหมด</p>
                <h3 class="text-3xl font-black text-slate-800">{{ dashboardStore.totalOrders.toLocaleString() }}</h3>
              </div>
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
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
                <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">เมนูอาหาร</p>
                <h3 class="text-3xl font-black text-slate-800">{{ dashboardStore.filteredTotalMenus.toLocaleString() }}</h3>
              </div>
              <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5l-3 3m0 0l-3-3m3 3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110">
            </div>
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">จำนวนร้านอาหาร</p>
                <h3 class="text-3xl font-black text-slate-800">{{ dashboardStore.totalRestaurants.toLocaleString() }}</h3>
              </div>
              <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
            <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              ยอดขายตามช่วงเวลา
            </h2>
            <div class="h-72 w-full">
              <apexchart type="bar" height="100%" :options="dashboardStore.salesChartOptions"
                :series="dashboardStore.salesChartSeries"></apexchart>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
            <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              หมวดหมู่เมนู
            </h2>
            <div class="h-72 w-full flex items-center justify-center">
              <apexchart v-if="dashboardStore.categoryChartSeries.length > 0" type="donut" width="100%"
                :options="dashboardStore.categoryChartOptions" :series="dashboardStore.categoryChartSeries">
              </apexchart>
              <div v-else class="text-slate-400 text-sm">ไม่มีข้อมูลหมวดหมู่</div>
            </div>
          </div>

        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            วิเคราะห์ช่วงเวลาที่ออเดอร์เข้าสูงสุด (Peak Hours)
          </h2>
          <div class="h-72 w-full">
            <apexchart type="area" height="100%" :options="dashboardStore.peakHoursChartOptions"
              :series="dashboardStore.peakHoursChartSeries"></apexchart>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                  clip-rule="evenodd" />
              </svg>
              5 อันดับร้านอาหารขายดี
            </h2>
            <div class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr class="text-slate-500">
                    <th>อันดับ</th>
                    <th>ร้านอาหาร</th>
                    <th class="text-right">ยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(rest, index) in dashboardStore.topRestaurants" :key="rest.name"
                    class="hover:bg-slate-50 transition-colors">
                    <td class="font-bold text-slate-400">
                      <span v-if="index === 0" class="text-yellow-500 text-lg">🥇</span>
                      <span v-else-if="index === 1" class="text-slate-400 text-lg">🥈</span>
                      <span v-else-if="index === 2" class="text-amber-700 text-lg">🥉</span>
                      <span v-else>#{{ index + 1 }}</span>
                    </td>
                    <td class="font-medium text-slate-700">{{ rest.name }}</td>
                    <td class="text-right font-bold text-emerald-600">฿{{ rest.revenue.toLocaleString() }}</td>
                  </tr>
                  <tr v-if="dashboardStore.topRestaurants.length === 0">
                    <td colspan="3" class="text-center py-4 text-slate-400">ไม่มีข้อมูลการขาย</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500" viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              5 อันดับเมนูยอดฮิต
            </h2>
            <div class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr class="text-slate-500">
                    <th>เมนู</th>
                    <th>ร้านอาหาร</th>
                    <th class="text-right">จำนวน (จาน)</th>
                    <th class="text-right">ยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="menu in dashboardStore.topMenuItems" :key="menu.name + menu.restaurant"
                    class="hover:bg-slate-50 transition-colors">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="avatar">
                          <div class="mask mask-squircle w-8 h-8 bg-slate-100">
                            <img v-if="menu.image" :src="menu.image" />
                            <span v-else
                              class="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">IMG</span>
                          </div>
                        </div>
                        <div class="font-medium text-slate-700">{{ menu.name }}</div>
                      </div>
                    </td>
                    <td class="text-xs text-slate-500">{{ menu.restaurant }}</td>
                    <td class="text-right font-bold text-blue-600">{{ menu.qty }}</td>
                    <td class="text-right font-bold text-emerald-600">฿{{ menu.revenue.toLocaleString() }}</td>
                  </tr>
                  <tr v-if="dashboardStore.topMenuItems.length === 0">
                    <td colspan="4" class="text-center py-4 text-slate-400">ไม่มีข้อมูลการสั่งซื้อ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </LayoutAdmin>
</template>

<style scoped>
.vue-apexcharts {
  min-height: 100%;
}
</style>

