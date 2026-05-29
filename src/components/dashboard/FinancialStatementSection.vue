<script setup>
const props = defineProps({
  dashboardStore: Object,
  isAdmin: Boolean
});
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-black text-slate-800 flex items-center gap-2">
          <div class="w-2 h-8 bg-rose-600 rounded-full"></div>
          รายงานสรุปการเงิน
        </h2>
        <p class="text-slate-400 text-sm mt-1">รายละเอียดรายได้และค่าธรรมเนียมในช่วงเวลาที่เลือก</p>
      </div>
      
      <div class="hidden md:flex items-center gap-4">
        <div class="text-right">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ยอดรับสุทธิรวม</p>
          <p class="text-xl font-black text-emerald-600">฿{{ (isAdmin ? dashboardStore.netPayouts : dashboardStore.totalRevenue - dashboardStore.totalCommission).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-zebra w-full border-separate border-spacing-y-2">
        <thead>
          <tr class="text-slate-400 border-none">
            <th class="w-1/5 bg-transparent font-bold uppercase tracking-wider text-[10px] text-left pl-4">{{ isAdmin ? 'ร้านอาหาร' : 'วันที่' }}</th>
            <th class="w-1/5 bg-transparent font-bold uppercase tracking-wider text-[10px] text-center">ยอดขายรวม</th>
            <th class="w-1/5 bg-transparent font-bold uppercase tracking-wider text-[10px] text-center">Commission (%)</th>
            <th class="w-1/5 bg-transparent font-bold uppercase tracking-wider text-[10px] text-center">ค่าธรรมเนียม</th>
            <th class="w-1/5 bg-transparent font-bold uppercase tracking-wider text-[10px] text-right pr-4">ยอดสุทธิ</th>
          </tr>
        </thead>
        <tbody v-if="dashboardStore.financialData?.length > 0">
          <tr v-for="(item, idx) in dashboardStore.financialData" :key="idx" class="group">
            <td class="w-1/5 bg-slate-50/50 rounded-l-2xl border-none py-4 text-left pl-4">
              <span class="font-bold text-slate-700">{{ isAdmin ? item.name : item.date }}</span>
            </td>
            <td class="w-1/5 bg-slate-50/50 border-none py-4 text-center font-medium text-slate-600">
              ฿{{ item.revenue.toLocaleString() }}
            </td>
            <td class="w-1/5 bg-slate-50/50 border-none py-4 text-center">
              <span class="px-2 py-1 bg-slate-200/50 rounded-lg text-[10px] font-black text-slate-500">
                {{ isAdmin ? item.rate : (dashboardStore.commissionRate || 0) }}%
              </span>
            </td>
            <td class="w-1/5 bg-slate-50/50 border-none py-4 text-center text-rose-500 font-bold">
              - ฿{{ Math.round(item.commission).toLocaleString() }}
            </td>
            <td class="w-1/5 bg-slate-50/50 rounded-r-2xl border-none py-4 text-right pr-4">
              <span class="font-black text-emerald-600">฿{{ Math.round(item.net).toLocaleString() }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td colspan="5" class="text-center py-12 text-slate-400">ไม่มีข้อมูลในช่วงเวลานี้</td>
            </tr>
        </tbody>
        <tfoot v-if="dashboardStore.financialData?.length > 0">
          <tr>
            <th class="w-1/5 bg-slate-800 rounded-l-2xl text-white py-4 font-black text-left pl-4">รวมทั้งหมด</th>
            <th class="w-1/5 bg-slate-800 text-white py-4 text-center font-black">฿{{ (isAdmin ? dashboardStore.totalRevenue : dashboardStore.totalRevenue).toLocaleString() }}</th>
            <th class="w-1/5 bg-slate-800 text-slate-400 py-4 text-center"></th>
            <th class="w-1/5 bg-slate-800 text-rose-300 py-4 text-center font-black">- ฿{{ (isAdmin ? dashboardStore.totalCommission : dashboardStore.totalCommission).toLocaleString() }}</th>
            <th class="w-1/5 bg-slate-800 rounded-r-2xl text-emerald-400 py-4 text-right pr-4 font-black text-lg">฿{{ (isAdmin ? dashboardStore.netPayouts : dashboardStore.netProfit).toLocaleString() }}</th>
          </tr>
        </tfoot>
      </table>
    </div>
    

  </div>
</template>
