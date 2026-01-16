<script setup>
import { db } from '@/firebase';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useRestaurant } from '@/stores/Restaurant';
import { RouterLink } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';

import { doc, deleteDoc } from 'firebase/firestore'; 

const Restaurant = useRestaurant();
const now = ref(new Date()); 
let timer;

onMounted(async () => {
    
    await Restaurant.loadListRestaurant(); 
    
    timer = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});


const deleteRestaurant = async (id, name) => {
    if (confirm(`คุณต้องการลบร้านค้า "${name}" ใช่หรือไม่?`)) {
        try {
           
            await deleteDoc(doc(db, 'Restaurant', id));
          
            await Restaurant.loadRestaurant();
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            alert("ลบไม่สำเร็จ: " + error.message);
        }
    }
}


const getAutoStatus = (product) => {
    if (product.ManualStatus === 'force_open') return 'open';
    if (product.ManualStatus === 'force_close') return 'close';
    if (!product.OpenTime || !product.CloseTime) return 'close';
    
    try {
        const currentTime = now.value.getHours() * 60 + now.value.getMinutes();
        const [openH, openM] = product.OpenTime.split(':').map(Number);
        const [closeH, closeM] = product.CloseTime.split(':').map(Number);
        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;

        if (closeMin > openMin) {
            return (currentTime >= openMin && currentTime < closeMin) ? 'open' : 'close';
        } else {
            return (currentTime >= openMin || currentTime < closeMin) ? 'open' : 'close';
        }
    } catch (e) {
        return 'close';
    }
}


const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH');
}
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="text-3xl font-bold text-slate-700">Restaurant List</div>
        <RouterLink to="/Admin/Restaurant/Addrestaurant"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
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
                <th>Status</th>
                <th>Open-Close</th>
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
                    </div>
                  </div>
                </td>

                <td>
                  <div v-if="getAutoStatus(product) === 'open'" class="badge badge-success gap-1 text-[10px] text-white font-bold border-none">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Open Now
                  </div>
                  <div v-else class="badge badge-error gap-1 text-[10px] text-white font-bold border-none">
                    <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Closed
                  </div>
                </td>
                

                <td>
                  <div v-if="product.OpenTime && product.CloseTime" class="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    {{ product.OpenTime }} - {{ product.CloseTime }}
                  </div>
                  <div v-else class="text-xs text-slate-400 italic">ไม่ได้ระบุเวลา</div>
                </td>

                <td class="text-xs font-medium">{{ formatDate(product.CreatedAt) }}</td>
                <td class="text-xs font-medium">{{ formatDate(product.UpdatedAt) }}</td>

                <td>
                  <button @click="deleteRestaurant(product.id, product.Name)" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-9.123a1.125 1.125 0 0 0-1.125-1.125h-2.25a1.125 1.125 0 0 0-1.125 1.125V5.123m9.902 0a48.674 48.674 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>