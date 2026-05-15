<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  dashboardStore: Object,
  isAdmin: Boolean
});

const isEditing = ref(false);
const newGoal = ref(props.dashboardStore.monthlyGoal || props.dashboardStore.totalMonthlyGoal || 0);

const currentRevenue = computed(() => {
    return props.dashboardStore.totalRevenue || 0;
});

const goal = computed(() => props.isAdmin ? props.dashboardStore.adminMonthlyGoal : props.dashboardStore.monthlyGoal);

const progress = computed(() => {
    if (!goal.value || goal.value === 0) return 0;
    return Math.min(Math.round((currentRevenue.value / goal.value) * 100), 100);
});

const motivationalMessage = computed(() => {
    if (progress.value === 0) return "เริ่มต้นเดือนใหม่ด้วยพลังเต็มเปี่ยม! 🚀";
    if (progress.value < 30) return "เริ่มต้นได้ดี! พยายามต่อไปครับ 💪";
    if (progress.value < 50) return "มาได้เกือบครึ่งทางแล้ว สู้ๆ! ✨";
    if (progress.value < 80) return "ยอดเยี่ยม! ใกล้ถึงเป้าหมายแล้วครับ 🌟";
    if (progress.value < 100) return "อีกนิดเดียวเท่านั้น! คุณทำได้แน่นอน 🏆";
    return "ยินดีด้วย! คุณบรรลุเป้าหมายเดือนนี้แล้ว 🎉";
});

const startEditing = () => {
    newGoal.value = goal.value;
    isEditing.value = true;
};

const saveGoal = async () => {
    if (props.isAdmin) {
        await props.dashboardStore.updateAdminMonthlyGoal(newGoal.value);
        isEditing.value = false;
    } else {
        await props.dashboardStore.updateMonthlyGoal(newGoal.value);
        isEditing.value = false;
    }
};
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {{ isAdmin ? 'เป้าหมายยอดขายรวมทั้งแพลตฟอร์ม' : 'เป้าหมายยอดขายเดือนนี้' }}
          </h2>
          <div v-if="!isEditing" class="flex items-center gap-3">
            <p class="text-xl font-black text-slate-800">฿{{ goal.toLocaleString() }}</p>
            <button @click="startEditing" class="btn btn-ghost btn-xs h-7 min-h-0 text-indigo-500 bg-indigo-50/50 hover:bg-indigo-100 border-none rounded-lg flex items-center gap-1 px-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span class="text-[10px] font-bold uppercase tracking-wider">แก้ไขเป้าหมาย</span>
            </button>
          </div>
          <div v-else class="flex items-center gap-2 mt-1">
            <input v-model="newGoal" type="number" class="input input-xs input-bordered w-24 bg-slate-50 font-bold" />
            <button @click="saveGoal" class="btn btn-xs btn-indigo rounded-lg">บันทึก</button>
            <button @click="isEditing = false" class="btn btn-xs btn-ghost rounded-lg">ยกเลิก</button>
          </div>
        </div>
      </div>
      
      <div class="text-right">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ความคืบหน้า</p>
        <p class="text-2xl font-black text-indigo-600">{{ progress }}%</p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-1 shadow-inner">
        <div class="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 relative group" 
             :style="{ width: progress + '%' }">
          <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-slate-500">{{ motivationalMessage }}</p>
        <p class="text-xs font-bold text-slate-700">
          <span class="text-slate-400 font-normal">ปัจจุบัน:</span> ฿{{ currentRevenue.toLocaleString() }}
        </p>
      </div>
    </div>

    <div v-if="!isAdmin && progress < 100 && goal > 0" class="mt-4 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 border-dashed flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p class="text-[10px] text-indigo-700 font-medium">ขาดอีกเพียง ฿{{ (goal - currentRevenue).toLocaleString() }} จะถึงเป้าหมายที่คุณตั้งไว้ครับ!</p>
    </div>
  </div>
</template>
