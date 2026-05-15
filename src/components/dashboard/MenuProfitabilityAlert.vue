<script setup>
import { computed } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

// เมนูที่ยังไม่ตั้งต้นทุน (Cost = 0 หรือไม่มี)
const noCostMenus = computed(() =>
  (props.dashboardStore.allMenus || [])
    .filter(m => !Number(m.Cost))
    .map(m => ({ id: m.MenuId, name: m.MenuName, price: Number(m.Price || 0), category: m.Category }))
);

// Plowhorses: ขายดีแต่กำไรน้อยกว่าค่าเฉลี่ย
const plowhorseMenus = computed(() =>
  (props.dashboardStore.menuEngineeringData || [])
    .filter(d => d.type === 'Plowhorse')
    .sort((a, b) => b.quantity - a.quantity)
);

const marginPercent = (item) => {
  if (!item.revenue || !item.quantity) return 0;
  const price = item.revenue / item.quantity;
  if (price === 0) return 0;
  return Math.round((item.profit / price) * 100);
};

const hasAnyAlert = computed(() =>
  noCostMenus.value.length > 0 || plowhorseMenus.value.length > 0
);

const activeAlertCount = computed(() =>
  [noCostMenus.value.length > 0, plowhorseMenus.value.length > 0].filter(Boolean).length
);

const gridClass = computed(() => ({
  'lg:grid-cols-2': activeAlertCount.value === 2,
  'lg:grid-cols-3': activeAlertCount.value === 3,
}));
</script>

<template>
  <div v-if="hasAnyAlert" class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden h-full">
    <div class="absolute top-0 right-0 w-64 h-64 bg-amber-50/40 rounded-bl-full -mr-20 -mt-20 pointer-events-none"></div>

    <div class="mb-6 relative z-10">
      <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
        <div class="w-2 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-100"></div>
        แจ้งเตือนความสามารถในการทำกำไรของเมนู
      </h2>
      <p class="text-slate-400 text-sm mt-1">ตรวจพบเมนูที่ต้องการการปรับปรุงเพื่อเพิ่มความสามารถในการทำกำไร</p>
    </div>

    <div class="grid grid-cols-1 gap-5 relative z-10 items-start" :class="gridClass">

      <!-- เมนูไม่มีต้นทุน -->
      <div v-if="noCostMenus.length > 0" class="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-amber-800">ยังไม่ตั้งต้นทุน</h3>
            <p class="text-[10px] text-amber-600">{{ noCostMenus.length }} เมนู — ไม่รู้กำไรที่แท้จริง</p>
          </div>
        </div>

        <p class="text-[10px] text-amber-700 bg-amber-100 rounded-xl px-3 py-2 mb-4 leading-relaxed">
          เมนูเหล่านี้ยังไม่มีข้อมูลต้นทุน ทำให้ไม่สามารถคำนวณกำไรที่แท้จริงได้ แนะนำให้เพิ่มต้นทุนในการตั้งค่าเมนู
        </p>

        <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
          <div v-for="item in noCostMenus" :key="item.id"
               class="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-700 truncate">{{ item.name }}</p>
              <p class="text-[10px] text-slate-400">{{ item.category || 'ไม่มีหมวดหมู่' }}</p>
            </div>
            <div class="text-right shrink-0 ml-2">
              <p class="text-xs font-black text-slate-600">฿{{ item.price.toLocaleString() }}</p>
              <p class="text-[9px] text-amber-500 font-bold">ไม่มีต้นทุน</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Plowhorses: ขายดีแต่กำไรน้อย -->
      <div v-if="plowhorseMenus.length > 0" class="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-blue-800">ขายดีแต่กำไรน้อย</h3>
            <p class="text-[10px] text-blue-600">{{ plowhorseMenus.length }} เมนู — พิจารณาปรับราคา</p>
          </div>
        </div>

        <p class="text-[10px] text-blue-700 bg-blue-100 rounded-xl px-3 py-2 mb-4 leading-relaxed">
          เมนูขายดีแต่กำไรต่ำกว่าค่าเฉลี่ย ลองปรับขึ้นราคาเล็กน้อยหรือลดต้นทุนวัตถุดิบ
        </p>

        <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
          <div v-for="item in plowhorseMenus" :key="item.id"
               class="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-blue-100">
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-700 truncate">{{ item.name }}</p>
              <p class="text-[10px] text-slate-400">ขาย {{ item.quantity }} ชิ้น</p>
            </div>
            <div class="text-right shrink-0 ml-2">
              <p class="text-xs font-black text-blue-600">฿{{ Math.round(item.profit) }}/ชิ้น</p>
              <p class="text-[9px] font-bold"
                 :class="marginPercent(item) < 20 ? 'text-rose-400' : 'text-amber-400'">
                margin {{ marginPercent(item) }}%
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
