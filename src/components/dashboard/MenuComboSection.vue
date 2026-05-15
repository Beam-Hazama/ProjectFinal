<script setup>
import { computed } from 'vue';

const props = defineProps({
  dashboardStore: Object
});

const combos = computed(() => props.dashboardStore.menuComboData || []);
const maxCount = computed(() => combos.value[0]?.count || 1);

const barWidth = (count) => Math.round((count / maxCount.value) * 100);

const rankColor = (index) => {
  if (index === 0) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-400' };
  if (index === 1) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', bar: 'bg-slate-400' };
  if (index === 2) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-400' };
  return { bg: 'bg-indigo-50', text: 'text-indigo-500', border: 'border-indigo-100', bar: 'bg-indigo-400' };
};
</script>

<template>
  <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden h-full">
    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-bl-full -mr-20 -mt-20 pointer-events-none"></div>

    <div class="mb-8 relative z-10">
      <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
        <div class="w-2 h-8 bg-violet-600 rounded-full shadow-lg shadow-violet-100"></div>
        วิเคราะห์การสั่งเมนูคู่กัน (Combo Analysis)
      </h2>
      <p class="text-slate-400 text-sm mt-1">เมนูที่ลูกค้ามักสั่งพร้อมกันในออเดอร์เดียว — โอกาสในการจัด Set หรือโปรโมชั่นคู่</p>
    </div>

    <!-- มีข้อมูล -->
    <div v-if="combos.length > 0" class="relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="(combo, index) in combos" :key="combo.key"
             class="rounded-2xl border p-4 hover:shadow-md transition-all group"
             :class="rankColor(index).border">

          <div class="flex items-start gap-3">
            <!-- Rank Badge -->
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                 :class="[rankColor(index).bg, rankColor(index).text]">
              {{ index + 1 }}
            </div>

            <!-- Menu Pair -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold truncate max-w-[45%]">
                  {{ combo.menuA.name }}
                </span>
                <div class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold truncate max-w-[45%]">
                  {{ combo.menuB.name }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="flex items-center gap-2">
                <div class="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                       :class="rankColor(index).bar"
                       :style="{ width: barWidth(combo.count) + '%' }">
                  </div>
                </div>
                <span class="text-xs font-black text-slate-600 shrink-0">{{ combo.count }} ครั้ง</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- คำแนะนำ -->
      <div class="mt-6 p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-black text-violet-800 mb-1">คำแนะนำ</p>
          <p class="text-xs text-violet-700 leading-relaxed">
            ลองสร้าง <span class="font-bold">"Set Menu"</span> หรือ <span class="font-bold">โปรโมชั่นซื้อคู่</span> จากเมนูอันดับต้นๆ เพื่อเพิ่มยอดต่อบิล (AOV) และทำให้ลูกค้าสั่งได้ง่ายขึ้น
          </p>
        </div>
      </div>
    </div>

    <!-- ไม่มีข้อมูล -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-slate-400 relative z-10">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-sm font-bold text-slate-500 mb-1">ยังไม่มีข้อมูล Combo</p>
      <p class="text-xs text-center max-w-xs leading-relaxed">ต้องมีออเดอร์ที่สั่งเมนูมากกว่า 1 รายการพร้อมกัน อย่างน้อย 2 ครั้ง จึงจะแสดงผลได้</p>
    </div>
  </div>
</template>
