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

// ฟังก์ชันจัดรูปแบบวันที่ (Optional)
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  return timestamp.toDate().toLocaleString('th-TH');
}
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="text-3xl font-bold text-slate-700">Menu List</div>
        <RouterLink to="/Admin/Menulist/Addmenu"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Menu
        </RouterLink>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold  text-xs">
              <tr>
                <th class="py-4 pl-6">Restaurant</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody class="text-slate-600">
              <tr v-for="product in Restaurant.list"  class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ product.Name }}</div>
                     
                    </div>
                  </div>
                </td>

                <td class="">
                  <RouterLink class="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50" :to="{
                    name: 'Admin update menu',
                    params: { id: product.id },
                  }"> Edit </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>