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
    deleteDoc,
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
// const openEditModal = (user) => {
//     selectedUser.value = { ...user };
//     isModalOpen.value = true;
// };

// 4. บันทึกข้อมูลกลับไปยัง Firestore
const handleUpdate = async () => {
    if (!selectedUser.value || !selectedUser.value.id) {
        alert("ไม่พบ ID ผู้ใช้งาน");
        return;
    }

    try {
        isLoading.value = true;
        const userRef = doc(db, 'User', selectedUser.value.id);

        // ค้นหาชื่อร้านค้าจากรายการ restaurants โดยใช้ ID ที่ถูกเลือกใน Modal
        const targetRestaurant = restaurants.value.find(r => r.id === selectedUser.value.restaurantId);
        const restaurantName = targetRestaurant ? targetRestaurant.Name : null;

        // สร้าง Object ข้อมูลสำหรับอัปเดต
        const updateData = {
            name: selectedUser.value.name || '',
            // เก็บเป็นชื่อร้านค้าเพื่อให้ Store ดึงเมนูได้ถูกต้อง
            restaurant: restaurantName,
            // เก็บ ID ไว้ด้วยเผื่อใช้ในการ Join ข้อมูลในหน้า Admin

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
const deleteUser = async (id, name) => {
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${name}" ใช่หรือไม่?`)) {
        try {
            isLoading.value = true;
            // ลบจาก Firestore Collection 'User'
            await deleteDoc(doc(db, 'User', id));

            alert("ลบผู้ใช้งานสำเร็จ");
            await fetchUsers(); // โหลดข้อมูลใหม่หลังจากลบ
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("ไม่สามารถลบข้อมูลได้: " + error.message);
        } finally {
            isLoading.value = false;
        }
    }
};

// ฟังก์ชันสำหรับแก้ไข (ในกรณีที่คุณต้องการใช้ Modal เดิมที่มีอยู่)
// ลบตัวแปร openEditModal ตัวเดิมออกก่อน แล้วใช้ชุดนี้แทน
const openEditModal = (user) => {
    selectedUser.value = { ...user };
    // ตรวจสอบว่ามีชื่อร้านในฐานข้อมูลไหม ถ้าไม่มีให้เป็นค่าว่างเพื่อแสดงผลใน modal
    if (!selectedUser.value.restaurant) {
        selectedUser.value.restaurant = '';
    }
    isModalOpen.value = true;
};

onMounted(() => {
    fetchUsers();
    fetchRestaurants();
});
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans ">

            <div class="flex justify-between items-center mb-6">
                <div class="text-3xl font-bold text-slate-700">Restaurant User</div>
                <RouterLink to="/Admin/Restaurant/Adduser"
                    class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add User
                </RouterLink>
            </div>


            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <th class="py-4">Name</th>
                                <th>Username</th>
                                <th>Restaurant</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
                                <td class="font-medium text-slate-700">{{ user.name || 'ไม่ได้ระบุ' }}</td>
                                <td class="text-slate-500">{{ user.email }}</td>
                                <td>
                                    <div v-if="user.restaurant"
                                        class="badge badge-outline border-blue-200 text-blue-600 px-3 py-3 gap-2">
                                        <span class="text-xs">🏢</span>
                                        {{ user.restaurant }}
                                    </div>
                                    <span v-else class="text-slate-400 italic text-sm">ยังไม่ได้เชื่อมต่อ</span>
                                </td>
                                <td class="text-center">
                                    <RouterLink :to="`/Admin/Restaurantuser/edit/${user.id}`"
                                        class="btn btn-sm btn-ghost text-blue-600 font-bold">
                                        Edit
                                    </RouterLink>

                                    <button @click="deleteUser(user.id, user.firstname)"
                                        class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-9.123a1.125 1.125 0 0 0-1.125-1.125h-2.25a1.125 1.125 0 0 0-1.125 1.125V5.123m9.902 0a48.674 48.674 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165" />
                                        </svg>
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
        </div>
        
    </LayoutAdmin>
</template>