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
            <th class="bg-transparent font-bold uppercase tracking-wider text-[10px]">{{ isAdmin ? 'ร้านอาหาร' : 'วันที่' }}</th>
            <th class="bg-transparent font-bold uppercase tracking-wider text-[10px] text-right">ยอดขายรวม</th>
            <th class="bg-transparent font-bold uppercase tracking-wider text-[10px] text-center">GP (%)</th>
            <th class="bg-transparent font-bold uppercase tracking-wider text-[10px] text-right">ค่าธรรมเนียม</th>
            <th v-if="!isAdmin" class="bg-transparent font-bold uppercase tracking-wider text-[10px] text-right text-indigo-500">ต้นทุน (COGS)</th>
            <th class="bg-transparent font-bold uppercase tracking-wider text-[10px] text-right">ยอดสุทธิ</th>
          </tr>
        </thead>
        <tbody v-if="dashboardStore.financialData?.length > 0">
          <tr v-for="(item, idx) in dashboardStore.financialData" :key="idx" class="group">
            <td class="bg-slate-50/50 rounded-l-2xl border-none py-4">
              <span class="font-bold text-slate-700">{{ isAdmin ? item.name : item.date }}</span>
            </td>
            <td class="bg-slate-50/50 border-none py-4 text-right font-medium text-slate-600">
              ฿{{ item.revenue.toLocaleString() }}
            </td>
            <td class="bg-slate-50/50 border-none py-4 text-center">
              <span class="px-2 py-1 bg-slate-200/50 rounded-lg text-[10px] font-black text-slate-500">
                {{ isAdmin ? item.rate : (dashboardStore.commissionRate || 0) }}%
              </span>
            </td>
            <td class="bg-slate-50/50 border-none py-4 text-right text-rose-500 font-bold">
              - ฿{{ Math.round(item.commission).toLocaleString() }}
            </td>
            <td v-if="!isAdmin" class="bg-slate-50/50 border-none py-4 text-right text-indigo-500 font-bold">
              - ฿{{ Math.round(item.cogs || 0).toLocaleString() }}
            </td>
            <td class="bg-slate-50/50 rounded-r-2xl border-none py-4 text-right">
              <span class="font-black text-emerald-600">฿{{ Math.round(item.net).toLocaleString() }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td :colspan="isAdmin ? 5 : 6" class="text-center py-12 text-slate-400">ไม่มีข้อมูลในช่วงเวลานี้</td>
            </tr>
        </tbody>
        <tfoot v-if="dashboardStore.financialData?.length > 0">
          <tr>
            <th class="bg-slate-800 rounded-l-2xl text-white py-4 font-black">รวมทั้งหมด</th>
            <th class="bg-slate-800 text-white py-4 text-right font-black">฿{{ (isAdmin ? dashboardStore.totalRevenue : dashboardStore.totalRevenue).toLocaleString() }}</th>
            <th class="bg-slate-800 text-slate-400 py-4 text-center"></th>
            <th class="bg-slate-800 text-rose-300 py-4 text-right font-black">- ฿{{ (isAdmin ? dashboardStore.totalCommission : dashboardStore.totalCommission).toLocaleString() }}</th>
            <th v-if="!isAdmin" class="bg-slate-800 text-indigo-300 py-4 text-right font-black">- ฿{{ (dashboardStore.totalCOGS || 0).toLocaleString() }}</th>
            <th class="bg-slate-800 rounded-r-2xl text-emerald-400 py-4 text-right font-black text-lg">฿{{ (isAdmin ? dashboardStore.netPayouts : dashboardStore.netProfit).toLocaleString() }}</th>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p class="text-[10px] text-slate-500 italic">ยอดสุทธิคำนวณจาก (ยอดขายรวม - ค่าธรรมเนียม{{ !isAdmin ? ' - ต้นทุนวัตถุดิบ' : '' }}) ตามเงื่อนไข GP ของแต่ละร้านอาหารที่ตกลงไว้ในสัญญา</p>
    </div>
  </div>
</template>
