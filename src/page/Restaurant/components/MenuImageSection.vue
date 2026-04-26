<script setup>
defineProps({
  imagePreview: String,
  imageInputMethod: String,
  modelValue: String
});

const emit = defineEmits(['update:imageInputMethod', 'update:modelValue', 'fileUpload']);

const handleFileUpload = (e) => {
  emit('fileUpload', e);
};
</script>

<template>
  <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
    <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      รูปภาพเมนู
    </h3>

    <div class="flex flex-col items-center gap-5 w-full max-w-xs">
      <div
        class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative group">
        <img v-if="imagePreview || modelValue" :src="imagePreview || modelValue" class="w-full h-full object-cover" />
        <div v-else class="text-slate-400 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
        </div>
      </div>

      <div role="tablist" class="tabs tabs-boxed bg-white border border-slate-200 p-1">
        <a role="tab" class="tab text-xs h-8 transition-all"
          :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'file' }"
          @click="$emit('update:imageInputMethod', 'file')">
          อัปโหลดไฟล์
        </a>
        <a role="tab" class="tab text-xs h-8 transition-all"
          :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'url' }"
          @click="$emit('update:imageInputMethod', 'url')">
          ใช้ URL
        </a>
      </div>

      <div v-if="imageInputMethod === 'file'" class="w-full text-center animate-fade-in">
        <label
          class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          เลือกรูปภาพจากเครื่อง
          <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
        </label>
        <div class="text-[10px] text-slate-400 mt-2">รองรับไฟล์ .jpg, .png ขนาดไม่เกิน 5MB</div>
      </div>

      <div v-else class="w-full animate-fade-in">
        <div class="relative">
          <input type="text" class="input input-bordered input-sm w-full pl-9 focus:input-primary bg-white h-10"
            :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-3 text-slate-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1 1.1" />
          </svg>
        </div>
        <div class="text-[10px] text-slate-400 mt-2 text-center">รูปภาพจะแสดงตัวอย่างด้านบนทันที</div>
      </div>
    </div>
  </div>
</template>
