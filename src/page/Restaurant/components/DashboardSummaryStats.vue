<script setup>
defineProps({
  dashboardStore: Object
});
</script>

<template>
  <div class="space-y-6">
    <!-- Status Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center">
        <span class="text-amber-500 text-xs font-bold mb-1 uppercase tracking-wider">รอดำเนินการ</span>
        <span class="text-2xl font-black text-amber-600">{{ dashboardStore.orderStatuses.pending }}</span>
      </div>
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
        <span class="text-blue-500 text-xs font-bold mb-1 uppercase tracking-wider">กำลังเตรียม</span>
        <span class="text-2xl font-black text-blue-600">{{ dashboardStore.orderStatuses.preparing || dashboardStore.orderStatuses.cooking || 0 }}</span>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
        <span class="text-emerald-500 text-xs font-bold mb-1 uppercase tracking-wider">เสร็จสิ้น</span>
        <span class="text-2xl font-black text-emerald-600">{{ dashboardStore.orderStatuses.completed }}</span>
      </div>
      <div class="bg-rose-50 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center">
        <span class="text-rose-500 text-xs font-bold mb-1 uppercase tracking-wider">ยกเลิก</span>
        <span class="text-2xl font-black text-rose-600">{{ (dashboardStore.orderStatuses.cancelled || 0) + (dashboardStore.orderStatuses.returned || 0) }}</span>
      </div>
    </div>

    <!-- Revenue Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div class="flex-1">
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ยอดขายรวม</p>
            <h3 class="text-2xl font-black text-slate-800">฿{{ dashboardStore.totalRevenue.toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">ค่าธรรมเนียม</p>
              <span class="badge badge-sm bg-rose-100 text-rose-600 border-none font-bold text-[10px]">{{ dashboardStore.commissionRate }}%</span>
            </div>
            <h3 class="text-2xl font-black text-rose-600">฿{{ dashboardStore.totalCommission.toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div class="flex-1">
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">รายได้สุทธิ</p>
            <h3 class="text-2xl font-black text-emerald-700">฿{{ dashboardStore.netRevenue.toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-sky-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
        <div class="relative z-10 flex justify-between items-start">
          <div class="flex-1">
            <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ออเดอร์ทั้งหมด</p>
            <h3 class="text-2xl font-black text-slate-800">{{ dashboardStore.totalOrders.toLocaleString() }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
