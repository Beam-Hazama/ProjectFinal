<script setup>
import { db } from '@/firebase';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useMenuStore } from '@/stores/menu';
import { doc, updateDoc } from 'firebase/firestore';
import { RouterLink } from 'vue-router';
import { onMounted } from 'vue';

const MenuStore = useMenuStore();

onMounted(() => {
  MenuStore.loadProducts();
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
        <RouterLink to="/Managemenu"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </RouterLink>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th class="py-4 pl-6">Product Name</th>
                <th>Price</th>
                <th>Stock (Remain/Total)</th>
                <th>Category (Role)</th>
                <th>Status</th>
                <th>Quick Restock</th>
                <th>Last Update</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>

            <tbody class="text-slate-600">
              <tr v-for="product in MenuStore.list"  class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                        <img :src="product.ImageUrl || 'https://via.placeholder.com/150'" alt="Product Image" class="object-cover" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ product.Name }}</div>
                      <div class="text-xs text-slate-400 opacity-70">ID: {{ product.id.substring(0, 6) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="font-medium">{{ product.Price}} ฿</td>

                <td>
                  <span
                    :class="{ 'text-red-500 font-bold': product.Remainquantity < 5, 'text-green-600': product.Remainquantity >= 5 }">
                    {{ product.Remainquantity }}
                  </span>
                  <span class="text-slate-300 mx-1">/</span>
                  {{ product.Quantity }}
                </td>

                <td>
                  <div class="badge badge-ghost text-xs">{{ product.Store }}</div>
                </td>

                <td>
                  <button @click="switchStatus(product)"
                    class="btn btn-xs rounded-full px-3 font-normal border-none transition-all" :class="product.Status === 'open'
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-500 hover:bg-red-200'
                      ">
                    <span v-if="product.Status === 'open'" class="flex items-center gap-1">● Open</span>
                    <span v-else class="flex items-center gap-1">● Closed</span>
                  </button>
                </td>

                <td>
                  <div class="flex items-center gap-2">
                    <input type="number"
                      class="input input-bordered input-sm w-20 bg-white focus:outline-none focus:border-blue-500 text-center"
                      placeholder="0" v-model="product.reStock" min="0" />
                    <button class="btn btn-sm btn-square btn-ghost text-blue-500 hover:bg-blue-50"
                      @click="reStock(product)" title="Add Stock">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </td>

                <td class="text-xs">{{ formatDate(product.updatedAt) }}</td>

                <td class="text-center">
                  <RouterLink class="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50" :to="{
                    name: 'Manageupdatemenu',
                    params: { id: product.id },
                  }"> details </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>