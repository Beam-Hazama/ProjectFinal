<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore'; 
import LayoutAdmin from '@/page/Admin/Admin.vue';

const users = ref([]);
const restaurants = ref([]);
const selectedUser = ref(null);
const isModalOpen = ref(false);
const isLoading = ref(false);

// 1. ดึงเฉพาะ User ที่มี role เป็น 'restaurant'
const fetchUsers = async () => {
  try {
    const q = query(
      collection(db, 'User'), 
      where('role', '==', 'restaurant')
    );
    const querySnapshot = await getDocs(q);
    users.value = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// 2. ดึงรายชื่อร้านค้าทั้งหมดมาเพื่อทำ Dropdown ให้เลือก
const fetchRestaurants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Restaurant'));
    restaurants.value = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }
};

// 3. ฟังก์ชันเปิด Modal และคัดลอกข้อมูลไปวางใน Form
const openEditModal = (user) => {
  selectedUser.value = { ...user };
  isModalOpen.value = true;
};

// 4. บันทึกข้อมูลกลับไปยัง Firestore
const handleUpdate = async () => {
  if (!selectedUser.value || !selectedUser.value.id) {
    alert("ไม่พบ ID ผู้ใช้งาน");
    return;
  }

  try {
    isLoading.value = true;
    const userRef = doc(db, 'User', selectedUser.value.id);

    // สร้าง Object ข้อมูล (ตรวจสอบชื่อฟิลด์ให้ตรงกับ Database ของคุณ)
    const updateData = {
      name: selectedUser.value.name || '',
      restaurant: selectedUser.value.restaurant || null,
      role: 'restaurant',
      updatedAt: serverTimestamp() 
    };

    await updateDoc(userRef, updateData);

    alert('อัปเดตข้อมูลสำเร็จ!');
    isModalOpen.value = false;
    await fetchUsers(); // โหลดตารางใหม่
  } catch (error) {
    console.error("Error updating database:", error);
    alert('บันทึกไม่สำเร็จ: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
  fetchRestaurants();
});
</script>

<template>
  <LayoutAdmin>
    <div class="min-h-screen p-6 md:p-8 font-sans bg-slate-50">
      
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">จัดการผู้ใช้งานร้านค้า</h1>
        <p class="text-sm text-slate-500">เชื่อมโยงบัญชีผู้ใช้เข้ากับร้านค้าที่รับผิดชอบ</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th class="py-4">ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>ร้านค้าที่สังกัด</th>
                <th class="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="font-medium text-slate-700">{{ user.name || 'ไม่ได้ระบุ' }}</td>
                <td class="text-slate-500">{{ user.email }}</td>
                <td>
                  <div v-if="user.restaurantId" class="badge badge-outline border-blue-200 text-blue-600 px-3 py-3 gap-2">
                    <span class="text-xs">🏢</span>
                    {{ restaurants.find(r => r.id === user.restaurantId)?.Name || 'กำลังโหลด...' }}
                  </div>
                  <span v-else class="text-slate-400 italic text-sm">ยังไม่ได้เชื่อมต่อ</span>
                </td>
                <td class="text-center">
                  <button @click="openEditModal(user)" 
                    class="btn btn-sm bg-amber-400 hover:bg-amber-500 border-none text-white px-5 rounded-lg">
                    แก้ไข
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="4" class="text-center py-12 text-slate-400">
                  ไม่พบผู้ใช้ที่มีบทบาทเป็น Restaurant
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="isModalOpen" class="modal modal-open">
        <div class="modal-box max-w-md bg-white rounded-2xl p-8">
          <h3 class="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
            <span class="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">📝</span>
            แก้ไขข้อมูลผู้ใช้งาน
          </h3>
          
          <div class="space-y-5">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold text-slate-600">ชื่อ-นามสกุล</span>
              </label>
              <input type="text" v-model="selectedUser.name" 
                class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold text-slate-600">อีเมล (อ่านเท่านั้น)</span>
              </label>
              <input type="text" :value="selectedUser.email" disabled
                class="input input-bordered w-full bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold text-slate-600">เชื่อมโยงกับร้านค้า</span>
              </label>
              <select v-model="selectedUser.restaurantId" 
                class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200">
                <option :value="null">-- กรุณาเลือกร้านค้า --</option>
                <option v-for="res in restaurants" :key="res.id" :value="res.id">
                  {{ res.Name }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-action mt-10">
            <button @click="isModalOpen = false" 
              class="btn btn-ghost text-slate-500 hover:bg-slate-100" :disabled="isLoading">
              ยกเลิก
            </button>
            <button @click="handleUpdate" 
              class="btn bg-blue-600 hover:bg-blue-700 border-none text-white px-8" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
        <div class="modal-backdrop bg-slate-900/40" @click="isModalOpen = false"></div>
      </div>

    </div>
  </LayoutAdmin>
</template>