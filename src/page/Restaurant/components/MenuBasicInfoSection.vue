<script setup>
defineProps({
  mode: String,
  menuData: Object,
  restaurantList: Array,
  categoryList: Array,
  formatTimestamp: Function
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <div v-if="mode === 'Update Menu'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">วันที่สร้าง</span>
          <span class="text-sm font-semibold text-slate-700">{{ formatTimestamp(menuData.CreatedAt) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">แก้ไขล่าสุด</span>
          <span class="text-sm font-semibold text-slate-700">{{ formatTimestamp(menuData.UpdatedAt) }}</span>
        </div>
      </div>

      <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลทั่วไป</h3>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">ชื่อเมนูอาหาร <span class="text-red-500">*</span></span>
          </label>
          <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
            v-model="menuData.Name" />
        </div>
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">ราคาปกติ<span class="text-red-500">*</span></span>
          </label>
          <div class="relative">
            <input type="number" class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200"
              v-model="menuData.Price" />
            <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
          </div>
        </div>
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">ราคาโปรโมชั่น</span>
          </label>
          <div class="relative">
            <input type="number" class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200 text-slate-700"
              v-model="menuData.PromoPrice" />
            <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
          </div>
        </div>

        <div class="form-control md:col-span-6">
          <label class="label">
            <span class="label-text font-medium text-slate-600">รายละเอียด</span>
          </label>
          <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
            v-model="menuData.Description" />
        </div>

        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">ร้านอาหาร</span>
          </label>
          <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            v-model="menuData.Restaurant" :disabled="true">
            <option disabled value="">เลือกร้านอาหาร</option>
            <option v-for="res in restaurantList" :key="res.id" :value="res.Name">{{ res.Name }}</option>
          </select>
        </div>

        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">หมวดหมู่อาหาร</span>
          </label>
          <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
            v-model="menuData.Category">
            <option disabled value="">เลือกหมวดหมู่</option>
            <option v-for="cat in categoryList" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
          </select>
        </div>

        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium text-slate-600">สถานะการขาย</span>
          </label>
          <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
            v-model="menuData.Status">
            <option disabled value="">เลือกสถานะ</option>
            <option value="open">🟢 เปิดขาย (Open)</option>
            <option value="close">🔴 ปิดชั่วคราว (Close)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
