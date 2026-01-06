<script setup>
import { db } from '@/firebase';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useRestaurant } from '@/stores/Restaurant';
import { doc, updateDoc } from 'firebase/firestore';
import { RouterLink } from 'vue-router';
import { onMounted } from 'vue';

const Restaurant = useRestaurant();

onMounted(() => {
    Restaurant.loadRestaurant();
});

// ฟังก์ชันจัดรูปแบบวันที่ให้แสดงผลสวยงาม
const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    // ตรวจสอบว่าเป็น Firestore Timestamp (มีฟังก์ชัน toDate) หรือไม่
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString('th-TH');
    }
    // กรณีเป็น Date Object หรือ String ทั่วไป
    return new Date(timestamp).toLocaleString('th-TH');
}
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="text-3xl font-bold text-slate-700">Restaurant List</div>
        <RouterLink to="/Admin/Restaurant/Addrestaurant"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Restaurant
        </RouterLink>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">Restaurant</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody class="text-slate-600">
              <tr v-for="product in Restaurant.list" :key="product.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                         <img v-if="product.ImageUrl" :src="product.ImageUrl" :alt="product.Name" class="object-cover" />
                         <div v-else class="flex items-center justify-center h-full text-[10px] text-slate-400">No Image</div>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ product.Name }}</div>
                      <div class="text-[10px] text-slate-400">ID: {{ product.id }}</div>
                    </div>
                  </div>
                </td>

                <td class="text-xs font-medium">
                  {{ formatDate(product.CreatedAt) }}
                </td>

                <td class="text-xs font-medium">
                  {{ formatDate(product.UpdatedAt) }}
                </td>

                <td>
                  <RouterLink class="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50 font-bold" :to="{
                    name: 'Admin update menu',
                    params: { id: product.id },
                  }">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit
                  </RouterLink>
                </td>
              </tr>
              
              <tr v-if="Restaurant.list.length === 0">
                <td colspan="4" class="text-center py-10 text-slate-400">
                  ไม่พบข้อมูลร้านค้าในระบบ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>