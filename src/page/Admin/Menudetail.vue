<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';

import { useMenuStore } from '@/stores/menu';
import { useRestaurant } from '@/stores/Restaurant';

import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp, } from 'firebase/firestore';
import { db } from '@/firebase';

import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

const mode = ref('');

const MenuStore = useMenuStore();
const Restaurant = useRestaurant();

const productId = route.params.id;
const selectedFile = ref(null);
const imagePreview = ref('');
const imageInputMethod = ref('file');

const MenuData = reactive({
  Name: '',
  ImageUrl: '',
  Price: 0,
  Restaurant: '',
  Description: '',
  Category: '',
  Status: '',
});

const goBack = () => {
  router.go(-1);
};



onMounted(async () => {
  if (route.params.id) {
    const productSnap = await getDoc(doc(db, 'Menu', route.params.id));

    if (productSnap.exists()) {
      const res = productSnap.data();
      Object.assign(MenuData, res);

      imagePreview.value = res.ImageUrl;
      if (res.ImageUrl && res.ImageUrl.startsWith('http')) {
        imageInputMethod.value = 'url';
      }
    }
  } else {
    ;
  }

  Restaurant.loadListRestaurant();
});
</script>

<template>
  <LayoutAdmin>
    <div class="p-6 font-sans">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
              Menu Detail
            </h1>
            <p class="text-sm text-slate-500">
              ดูรายละเอียด ข้อมูลราคา และสต็อกสินค้า
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            กลับ
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                <img v-if="imagePreview || MenuData.ImageUrl" :src="imagePreview || MenuData.ImageUrl"
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
                ข้อมูลทั่วไป
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="form-control md:col-span-1">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ชื่อเมนูอาหาร <span
                        class="text-red-500">*</span></span>
                  </label>
                  <label type="text"
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200">{{
                      MenuData.Name }}</label>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ราคา<span class="text-red-500">*</span></span>
                  </label>
                  <div class="relative">
                    <label type="number"
                      class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200">{{
                        MenuData.Price }}</label>
                    <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                  </div>
                </div>


                <div class="form-control md:col-span-3">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">รายละเอียด</span>
                  </label>
                  <label type="text"
                    class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200">{{
                      MenuData.Description }}</label>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">ร้านอาหาร</span>
                  </label>
                  <label
                    class="input input-bordered w-full focus:select-primary bg-slate-50 border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">{{
                      MenuData.Restaurant }}
                  </label>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">หมวดหมู่อาหาร</span>
                  </label>
                  <label class="input input-bordered w-full focus:select-primary bg-slate-50 border-slate-200">
                    {{ MenuData.Category }}
                  </label>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-slate-600">สถานะการขาย</span>
                  </label>
                  <label
                    class="block w-full px-4 py-2 rounded-lg text-center font-medium bg-slate-50 border border-slate-200">
                    <span v-if="MenuData.Status === 'open'" class="text-green-600">
                      🟢 เปิดขาย (Open)
                    </span>

                    <span v-else-if="MenuData.Status === 'close'" class="text-red-600">
                      🔴 ปิดชั่วคราว (Close)
                    </span>

                    <span v-else class="text-slate-400">
                      ยังไม่ได้กำหนดสถานะ
                    </span>
                  </label>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>
