<script setup>
import { db } from '@/firebase';
import Layoutrestaurant from '@/page/Restaurant/Restaurant.vue';
import { useMenuStore } from '@/stores/menu';
import { doc, updateDoc } from 'firebase/firestore';
import { onMounted, computed } from 'vue';

const MenuStore = useMenuStore();

// ดึงข้อมูลจาก Store (ตรวจสอบชื่อตัวแปรให้ตรงกับใน Store ของคุณ)
const restaurant = computed(() => MenuStore.restaurantInfo || {});

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  try {
    return timestamp.toDate ? timestamp.toDate().toLocaleString('th-TH') : new Date(timestamp).toLocaleString('th-TH');
  } catch (e) { return '-'; }
}
</script>

<template>
  <Layoutrestaurant>
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">จัดการโปรไฟล์ร้านค้า</h1>
        <p class="text-sm text-gray-500">จัดการข้อมูลพื้นฐานและเวลาทำการของร้านอาหารของคุณ</p>
      </div>

      <div class="grid grid-cols-12 gap-6">
        
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="h-32 bg-gradient-to-r from-slate-700 to-slate-900 relative">
              <img v-if="restaurant.Image_bg" :src="restaurant.Image_bg" class="w-full h-full object-cover opacity-50" />
            </div>
            <div class="px-6 pb-6">
              <div class="relative -mt-12 mb-4 flex justify-center">
                <img 
                  :src="restaurant.Image || 'https://via.placeholder.com/150'" 
                  class="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md bg-white"
                />
              </div>
              <div class="text-center">
                <h2 class="text-xl font-bold text-gray-800">{{ restaurant.Restaurant_name || 'ชื่อร้านอาหาร' }}</h2>
                <p class="text-sm text-gray-400">ID: {{ restaurant.Restaurant_id || '-' }}</p>
                <div class="mt-4 flex justify-center">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="restaurant.Status === 'เปิด' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                  >
                    {{ restaurant.Status || 'ปิดปรับปรุง' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-sm font-bold text-gray-700 mb-4 border-b pb-2 uppercase tracking-wider">ข้อมูลระบบ</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">รหัสผู้ดูแล:</span>
                <span class="font-mono text-gray-700">{{ restaurant.User_id || '-' }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">สร้างเมื่อ:</span>
                <span class="text-gray-700">{{ formatDate(restaurant.Created_at) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">แก้ไขล่าสุด:</span>
                <span class="text-gray-700">{{ formatDate(restaurant.Updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-800">ข้อมูลรายละเอียด</h3>
              <button class="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                แก้ไขข้อมูล
              </button>
            </div>
            
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-400 uppercase">ชื่อร้านอาหาร</label>
                  <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                    {{ restaurant.Restaurant_name || '-' }}
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-400 uppercase">สถานะปัจจุบัน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                    {{ restaurant.Status || '-' }}
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-400 uppercase leading-relaxed">เวลาเปิดทำการ</label>
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-gray-700 font-semibold">{{ restaurant.Opened_at || '00:00' }} น.</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-400 uppercase">เวลาปิดทำการ</label>
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-gray-700 font-semibold">{{ restaurant.Closed_at || '00:00' }} น.</span>
                  </div>
                </div>
              </div>

              <div class="mt-10 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-blue-700 leading-relaxed">
                  <strong>หมายเหตุ:</strong> การเปลี่ยนชื่อร้านอาหารอาจส่งผลต่อการค้นหาของลูกค้า กรุณาตรวจสอบความถูกต้องก่อนบันทึกข้อมูลทุกครั้ง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layoutrestaurant>
</template>

<style scoped>
/* ดึงฟอนต์ที่ใช้ในหน้าอื่นมาใส่ตรงนี้ได้เลยครับ */
</style>