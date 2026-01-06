<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';

import { useRestaurant } from '@/stores/Restaurant'; //
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase'; //

import LayoutAdmin from '@/page/Admin/Admin.vue'; //

const route = useRoute();
const router = useRouter();

const mode = ref('');
const RestaurantStore = useRestaurant();

const restaurantId = route.params.id;
const profileImagePreview = ref(''); 
const bgImagePreview = ref(''); 

const RestaurantData = reactive({
  Name: '',
  Status: 'open',
  ImageUrl: '',      // รูปโปรไฟล์
  BackGroundUrl: '', // รูปพื้นหลัง (BG)
  OpenTime: '08:00', // เวลาเปิด
  CloseTime: '20:00', // เวลาปิด
  Address: '',
  Phone: ''
});

// Watch สำหรับ Preview รูปโปรไฟล์
watch(() => RestaurantData.ImageUrl, (newVal) => {
    profileImagePreview.value = newVal;
});

// Watch สำหรับ Preview รูป BG
watch(() => RestaurantData.BackGroundUrl, (newVal) => {
    bgImagePreview.value = newVal;
});

const checkSaveRestaurant = async (data) => {
  try {
    let docId;
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    if (mode.value === 'Add Restaurant') {
      const docRef = await addDoc(collection(db, 'Restaurant'), updateData);
      docId = docRef.id;
    } else {
      docId = restaurantId;
      await updateDoc(doc(db, 'Restaurant', docId), updateData);
    }
    
    router.push({ name: 'Admin Restaurant List' }); 
  } catch (error) {
    console.error('Save error:', error);
    alert('บันทึกไม่สำเร็จ');
  }
};

const goBack = () => {
  router.go(-1);
};

onMounted(async () => {
  if (restaurantId) {
    mode.value = 'Update Restaurant';
    const docSnap = await getDoc(doc(db, 'Restaurant', restaurantId));
    
    if (docSnap.exists()) {
        const res = docSnap.data();
        Object.assign(RestaurantData, res);
        profileImagePreview.value = res.ImageUrl;
        bgImagePreview.value = res.BackGroundUrl;
    }
  } else {
    mode.value = 'Add Restaurant';
  }
});
</script>

<template>
  <LayoutAdmin>
    <div class="min-h-screen p-6 md:p-8 font-sans">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
            {{ mode === 'Add Restaurant' ? 'เพิ่มร้านค้าใหม่' : 'แก้ไขข้อมูลร้านค้า' }}
          </h1>
        </div>
        
        <div class="flex gap-3">
            <button @click="goBack" class="btn btn-ghost text-slate-500">ยกเลิก</button>
            <button @click="checkSaveRestaurant(RestaurantData)" class="btn bg-blue-600 border-none text-white px-6">
                บันทึกข้อมูลร้าน
            </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
            
            <div class="p-8 lg:col-span-1 bg-slate-50/30 space-y-8">
                <div>
                    <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">รูปโปรไฟล์ร้าน</h3>
                    <div class="w-full aspect-square rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center">
                        <img v-if="profileImagePreview" :src="profileImagePreview" class="w-full h-full object-cover" />
                        <span v-else class="text-slate-400 text-xs">ไม่มีรูปโปรไฟล์</span>
                    </div>
                    <input type="text" v-model="RestaurantData.ImageUrl" placeholder="วาง URL รูปโปรไฟล์" class="input input-bordered input-sm w-full mt-3 text-xs" />
                </div>

                <div>
                    <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">รูปพื้นหลัง (BG)</h3>
                    <div class="w-full h-32 rounded-xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center">
                        <img v-if="bgImagePreview" :src="bgImagePreview" class="w-full h-full object-cover" />
                        <span v-else class="text-slate-400 text-xs">ไม่มีรูปพื้นหลัง</span>
                    </div>
                    <input type="text" v-model="RestaurantData.BackGroundUrl" placeholder="วาง URL รูปพื้นหลัง" class="input input-bordered input-sm w-full mt-3 text-xs" />
                </div>
            </div>

            <div class="p-8 lg:col-span-2 space-y-6">
                <h3 class="font-bold text-slate-700 border-b border-slate-100 pb-2">รายละเอียดข้อมูลร้าน</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="form-control md:col-span-2">
                        <label class="label"><span class="label-text font-medium text-slate-600">ชื่อร้านอาหาร</span></label>
                        <input v-model="RestaurantData.Name" type="text" placeholder="ระบุชื่อร้าน" class="input input-bordered w-full bg-slate-50" />
                    </div>

                    

                    

                    <div class="form-control">
                        <label class="label"><span class="label-text font-medium text-slate-600">เวลาเปิด</span></label>
                        <input v-model="RestaurantData.OpenTime" type="time" class="input input-bordered w-full bg-slate-50" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-medium text-slate-600">เวลาปิด</span></label>
                        <input v-model="RestaurantData.CloseTime" type="time" class="input input-bordered w-full bg-slate-50" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-medium text-slate-600">สถานะร้าน</span></label>
                        <select v-model="RestaurantData.Status" class="select select-bordered w-full bg-slate-50">
                            <option value="open">🟢 เปิดให้บริการ</option>
                            <option value="close">🔴 ปิดให้บริการ</option>
                        </select>
                    </div>

                   
                </div>
            </div>
        </div>
      </div>
    </div>
  </LayoutAdmin>
</template>