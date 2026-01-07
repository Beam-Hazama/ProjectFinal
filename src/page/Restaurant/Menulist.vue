<script setup>
import { db } from '@/firebase';
import Layoutrestaurant from '@/page/Restaurant/restaurant.vue';
import { useMenuStore } from '@/stores/menu';
import { doc, updateDoc } from 'firebase/firestore';
import { RouterLink, useRoute } from 'vue-router'; // เพิ่ม useRoute
import { onMounted, watch } from 'vue';
import { useRestaurant } from '@/stores/Restaurant';

const MenuStore = useMenuStore();
const route = useRoute();
const restaurant = useRestaurant()

// ดึงข้อมูลเมนูตามชื่อร้านที่ระบุใน URL
const loadData = () => {
  const restaurantName = route.params.restaurantName;
  if (restaurantName) {
    MenuStore.loadMenuRestaurant(restaurantName);
  }
};

onMounted(() => {
  loadData();
  restaurant.loadMenusByRestaurant()
});

// ตรวจสอบหากมีการเปลี่ยนชื่อร้านใน URL ให้โหลดข้อมูลใหม่
watch(() => route.params.restaurantName, () => {
  loadData();
});

// ฟังก์ชันเปิด-ปิด สถานะเมนู
const switchStatus = async (product) => {
  try {
    const newStatus = product.Status === 'open' ? 'close' : 'open';
    const productRef = doc(db, 'menu', product.id);
    await updateDoc(productRef, {
      Status: newStatus
    });
    // หมายเหตุ: loadMenuRestaurant ใช้ onSnapshot ข้อมูลจะอัปเดตอัตโนมัติบนหน้าจอ
  } catch (error) {
    console.error("Error updating status:", error);
    alert("ไม่สามารถเปลี่ยนสถานะได้");
  }
}

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  // รองรับทั้ง Firestore Timestamp และ Date object
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
}
</script>

<template>
  <Layoutrestaurant>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <div class="text-3xl font-bold text-slate-700">Menu List</div>
          <p class="text-slate-500 text-sm">ร้าน: {{ route.params.restaurantName }}</p>
        </div>
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
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">Menu</th>
                <th>Restaurant</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>

            <tbody class="text-slate-600">
              <tr v-for="product in restaurant.menus" :key="product.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-slate-100">
                        <img :src="product.ImageUrl || 'https://via.placeholder.com/150'" class="object-cover" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ product.Name }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="font-medium">{{ product.Restaurant }}</div>
                </td>
                <td class="font-medium">{{ product.Price }} ฿</td>
                <td>
                  <div class="font-medium">{{ product.Category }}</div>
                </td>

                <td>
                  <button @click="switchStatus(product)"
                    class="btn btn-xs rounded-full px-3 font-normal border-none transition-all"
                    :class="product.Status === 'open' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'">
                    {{ product.Status === 'open' ? '● Open' : '● Closed' }}
                  </button>
                </td>

                <td class="text-xs">
                  {{ formatDate(product.CreatedAt || product.createdAt) }}
                </td>

                <td class="text-xs">
                  {{ formatDate(product.UpdatedAt || product.updatedAt) }}
                </td>

                <td class="text-center">
                  <div class="flex justify-center ">
                    <RouterLink class="btn btn-sm btn-ghost text-blue-600"
                      :to="{ name: 'Admin update menu', params: { id: product.id } }">
                      Edit
                    </RouterLink>

                    <button @click="deleteMenu(product.id, product.Name)"
                      class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-9.123a1.125 1.125 0 0 0-1.125-1.125h-2.25a1.125 1.125 0 0 0-1.125 1.125V5.123m9.902 0a48.674 48.674 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Layoutrestaurant>
</template>