<script setup>
defineProps({
  optionGroups: Array
});

const emit = defineEmits(['addGroup', 'removeGroup', 'addChoice', 'removeChoice']);
</script>

<template>
  <div class="mt-12">
    <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
      <span>ตัวเลือกเพิ่มเติม</span>
      <button @click="$emit('addGroup')" class="btn btn-sm btn-ghost text-emerald-600 hover:bg-emerald-50 font-medium">
        + เพิ่มหมวดหมู่
      </button>
    </h3>

    <div class="space-y-6">
      <transition-group name="fade" tag="div" class="space-y-6">
        <div v-for="(group, gIndex) in optionGroups" :key="'group-' + gIndex"
          class="relative pb-6 border-b border-slate-100 last:border-0 last:pb-0 group">

          <button @click="$emit('removeGroup', gIndex)"
            class="absolute top-0 right-0 btn btn-square btn-sm btn-ghost text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
            title="ลบหมวดหมู่">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
              class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4 pr-10 items-end">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-slate-600">ชื่อหมวดหมู่ตัวเลือก <span
                    class="text-red-500">*</span></span>
              </label>
              <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                v-model="group.name" />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-slate-600">จำนวนที่เลือกได้ <span
                    class="text-red-500">*</span></span>
              </label>
              <div class="relative">
                <input type="number" min="1"
                  class="input input-bordered w-full pr-16 focus:input-primary bg-slate-50 border-slate-200"
                  v-model="group.maxChoices" />
                <span class="absolute right-4 top-3 text-slate-400 text-sm font-medium">รายการ</span>
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-slate-600">สถานะการเลือก</span>
              </label>
              <div class="relative">
                <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                  v-model="group.isRequired">
                  <option :value="true">บังคับเลือก</option>
                  <option :value="false">ไม่บังคับ</option>
                </select>
              </div>
            </div>
          </div>

          <div class="pl-2 md:pl-4 border-l-2 border-slate-100">
            <div class="flex items-center justify-between mb-2">
              <label class="label px-0">
                <span class="label-text font-medium text-slate-600">ตัวเลือก</span>
              </label>
            </div>

            <div class="space-y-3 mb-4">
              <div v-for="(choice, cIndex) in group.choices" :key="'choice-' + gIndex + '-' + cIndex"
                class="flex items-start gap-4">
                <div class="form-control flex-1">
                  <input type="text" class="input input-sm input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 h-10"
                    v-model="choice.name" />
                </div>
                <div class="form-control w-32">
                  <div class="relative">
                    <input type="number" class="input input-sm input-bordered w-full pr-8 text-right focus:input-primary bg-slate-50 border-slate-200 h-10"
                      v-model="choice.price" />
                    <span class="absolute right-3 top-2.5 text-slate-400 text-sm">฿</span>
                  </div>
                </div>
                <button @click="$emit('removeChoice', gIndex, cIndex)"
                  class="btn btn-square btn-ghost btn-sm h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <button @click="$emit('addChoice', gIndex)"
              class="btn btn-sm btn-outline border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 w-full md:w-auto font-medium font-sans">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                class="w-4 h-4 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              เพิ่มรายการใหม่
            </button>
          </div>
        </div>
      </transition-group>

      <div v-if="!optionGroups || optionGroups.length === 0"
        class="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
        <div class="text-slate-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-10 h-10 text-slate-300">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m12 3V10.5m0 0V7.5m0 3h3m-3 0h-3M6 19.5v-3m0 3h3m-3 0h-3m12 3v-3m0 3h3m-3 0h-3M12 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m0 9v-3m0 3h3m-3 0h-3" />
          </svg>
        </div>
        <h4 class="text-lg font-bold text-slate-600 mb-1">ยังไม่มีตัวเลือกเพิ่มเติม</h4>
        <p class="text-slate-500 text-sm mb-6 text-center max-w-sm">เพิ่มหมวดหมู่ให้ลูกค้าปรับแต่งเมนู เช่น ท็อปปิ้งเสริม
          ระดับความเผ็ด</p>
        <button @click="$emit('addGroup')"
          class="btn btn-sm bg-white border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 font-medium">
          + สร้างหมวดหมู่ตัวเลือก
        </button>
      </div>
    </div>
  </div>
</template>
