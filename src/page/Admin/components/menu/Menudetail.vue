<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

const imagePreview = ref('');

const menuData = reactive({
  Name: '',
  ImageUrl: '',
  Price: 0,
  PromoPrice: null,
  Restaurant: '',
  Description: '',
  Category: '',
  Status: '',
  OptionGroups: [],
});

const goBack = () => {
  router.go(-1);
};

onMounted(async () => {
  if (route.params.name) {
    const q = query(collection(db, 'Menu'), where('Name', '==', route.params.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const res = querySnapshot.docs[0].data();
      Object.assign(menuData, res);
      imagePreview.value = res.ImageUrl;
    }
  }
});
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">

      <div class="flex justify-between items-start mb-6">
        <h1 class="text-3xl font-bold text-slate-700">Menu Detail</h1>

        <div class="flex gap-3">
          <button @click="goBack"
            class="btn btn-ghost text-slate-500 hover:bg-slate-200 gap-2 w-28 rounded-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100 mb-4">

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
                <img v-if="imagePreview || menuData.ImageUrl" :src="imagePreview || menuData.ImageUrl"
                  class="w-full h-full object-cover" />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-50" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
                </div>
              </div>
            </div>
          </div>


          <div class="p-8 lg:col-span-2 space-y-8">

            <div>
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                ข้อมูลเมนูอาหาร
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ชื่อเมนูอาหาร <span
                        class="text-red-500">*</span></span>
                  </label>
                  <div
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 flex items-center">
                    {{ menuData.Name }}
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ราคาปกติ <span
                        class="text-red-500">*</span></span>
                  </label>
                  <div class="relative">
                    <div
                      class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200 flex items-center justify-end">
                      {{ menuData.Price }}
                    </div>
                    <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ราคาโปรโมชั่น</span>
                  </label>
                  <div class="relative">
                    <div
                      class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200 text-slate-700 flex items-center justify-end">
                      {{ menuData.PromoPrice || 'ไม่มี' }}
                    </div>
                    <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                  </div>
                </div>

                <div class="form-control md:col-span-6">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">รายละเอียด</span>
                  </label>
                  <div
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 flex items-center">
                    {{ menuData.Description }}
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ร้านอาหาร</span>
                  </label>
                  <div
                    class="input input-bordered w-full focus:select-primary bg-slate-50 border-slate-200 flex items-center">
                    {{ menuData.Restaurant }}
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">หมวดหมู่อาหาร</span>
                  </label>
                  <div
                    class="input input-bordered w-full focus:select-primary bg-slate-50 border-slate-200 flex items-center">
                    {{ menuData.Category }}
                  </div>
                </div>

                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">สถานะการขาย</span>
                  </label>
                  <div
                    class="block w-full px-4 py-2 rounded-lg text-center font-medium bg-slate-50 border border-slate-200">
                    <span v-if="menuData.Status === 'open'" class="text-green-600">
                      🟢 เปิดขาย (Open)
                    </span>
                    <span v-else-if="menuData.Status === 'close'" class="text-red-600">
                      🔴 ปิดชั่วคราว (Close)
                    </span>
                    <span v-else class="text-slate-400">
                      ยังไม่ได้กำหนดสถานะ
                    </span>
                  </div>
                </div>
              </div>
            </div>


            <div class="mt-12">
              <h3
                class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                <span>ตัวเลือกเพิ่มเติม</span>
              </h3>

              <div class="space-y-6">
                <div v-if="menuData.OptionGroups && menuData.OptionGroups.length > 0" class="space-y-6">
                  <div v-for="(group, gIndex) in menuData.OptionGroups" :key="'group-' + gIndex"
                    class="relative pb-6 border-b border-slate-100 last:border-0 last:pb-0 group">

                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4 items-end">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium text-slate-600">ชื่อหมวดหมู่ตัวเลือก</span>
                        </label>
                        <div
                          class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 flex items-center">
                          {{ group.name.replace(' / คุณสมบัติพิเศษ', '') }}
                        </div>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium text-slate-600">จำนวนที่เลือกได้</span>
                        </label>
                        <div class="relative">
                          <div
                            class="input input-bordered w-full pr-16 focus:input-primary bg-slate-50 border-slate-200 flex items-center">
                            {{ group.maxChoices }}
                          </div>
                          <span class="absolute right-4 top-3 text-slate-400 text-sm font-medium">รายการ</span>
                        </div>
                      </div>

                      <div class="form-control">
                        <label class="label">
                          <span class="label-text font-medium text-slate-600">สถานะการเลือก</span>
                        </label>
                        <div
                          class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 flex items-center">
                          {{ group.isRequired ? 'บังคับเลือก ' : 'ไม่บังคับ ' }}
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
                            <div
                              class="input input-sm input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 h-10 flex items-center">
                              {{ choice.name }}
                            </div>
                          </div>

                          <div class="form-control w-32">
                            <div class="relative">
                              <div
                                class="input input-sm input-bordered w-full pr-8 text-right focus:input-primary bg-slate-50 border-slate-200 h-10 flex items-center justify-end">
                                {{ choice.price }}
                              </div>
                              <span class="absolute right-3 top-2.5 text-slate-400 text-sm">฿</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div v-else
                  class="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
                  <div class="text-slate-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-10 h-10 text-slate-300">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m12 3V10.5m0 0V7.5m0 3h3m-3 0h-3M6 19.5v-3m0 3h3m-3 0h-3m12 3v-3m0 3h3m-3 0h-3M12 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m0 9v-3m0 3h3m-3 0h-3" />
                    </svg>
                  </div>
                  <h4 class="text-lg font-bold text-slate-600 mb-1">ยังไม่มีตัวเลือกเพิ่มเติม</h4>
                  <p class="text-slate-500 text-sm mb-6 text-center max-w-sm">
                    เมนูนี้ยังไม่มีหมวดหมู่ตัวเลือก ตัวเลือกปรับแต่ง
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>
