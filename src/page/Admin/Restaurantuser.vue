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
const isLoading = ref(false);

// ดึงข้อมูลผู้ใช้ที่มีบทบาทเป็น restaurant
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

// จัดรูปแบบวันที่
const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH');
};

// ดึงข้อมูลร้านอาหารทั้งหมด
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

// ฟังก์ชันสลับสถานะผู้ใช้ (Active / Blocked)
const toggleUserStatus = async (user) => {
    const currentStatus = user.status || 'active';
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

    if (confirm(`คุณต้องการเปลี่ยนสถานะของ "${user.firstname}" เป็น ${newStatus.toUpperCase()} ใช่หรือไม่?`)) {
        try {
            isLoading.value = true;
            const userRef = doc(db, 'User', user.id);
            await updateDoc(userRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            alert("อัปเดตสถานะสำเร็จ");
            await fetchUsers();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("ไม่สามารถอัปเดตสถานะได้: " + error.message);
        } finally {
            isLoading.value = false;
        }
    }
};

// เพิ่มฟังก์ชันสำหรับหา URL รูปภาพของร้านอาหารตามชื่อร้าน
const getRestaurantImage = (restaurantName) => {
    // ค้นหาข้อมูลร้านอาหารจาก array restaurants ที่โหลดมาแล้ว
    const found = restaurants.value.find(res => res.Name === restaurantName);
    // ส่งคืน ImageUrl ถ้าพบ ถ้าไม่พบให้ส่งคืนค่าว่างหรือรูป default
    return found ? found.ImageUrl : '';
};

// ลบผู้ใช้งาน
const deleteUser = async (id, name) => {
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${name}" ใช่หรือไม่?`)) {
        try {
            isLoading.value = true;
            await deleteDoc(doc(db, 'User', id));
            alert("ลบผู้ใช้งานสำเร็จ");
            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("ไม่สามารถลบข้อมูลได้: " + error.message);
        } finally {
            isLoading.value = false;
        }
    }
};

onMounted(() => {
    fetchUsers();
    fetchRestaurants();
});
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Restaurant Users</h1>
                <RouterLink to="/Admin/Restaurant/Adduser"
                    class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add New User
                </RouterLink>
            </div>

            <div v-if="users.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div v-for="user in users" :key="user.id"
                    class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">

                    <div class="relative h-30 w-full overflow-visible bg-slate-200">

                        <img v-if="getRestaurantImage(user.restaurant)" :src="getRestaurantImage(user.restaurant)"
                            class="absolute inset-0 w-full h-full object-cover  transition-transform duration-700"
                            alt="restaurant-bg" />

                        <div v-else class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

                        <div class="absolute inset-0 bg-black/30 z-10"></div>

                        <div class="absolute top-4 right-4 flex flex-col gap-2 items-end z-20">
                            <span :class="[
                                'badge badge-sm border-none font-bold px-3 py-3 shadow-sm capitalize',
                                (user.status || 'active') === 'active' ? 'bg-emerald-400 text-white' : 'bg-red-400 text-white'
                            ]">
                                {{ user.status || 'active' }}
                            </span>
                        </div>

                        <div class="absolute -bottom-8 left-6 z-20">
                            <div class="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                                <img v-if="user.ImageUrl" :src="user.ImageUrl" class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 text-2xl font-bold">
                                    {{ user.firstname?.charAt(0) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-10 p-6 flex-grow flex flex-col">
                        <div class="mb-5">
                            <h2 class="text-xl font-bold text-slate-800 truncate">คุณ {{ user.firstname }} {{
                                user.lastname }}</h2>
                            <p class="text-sm text-indigo-600 font-bold flex items-center gap-1.5 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {{ user.restaurant || 'ยังไม่เชื่อมต่อร้าน' }}
                            </p>
                        </div>

                        <div class="space-y-3 bg-slate-50/50 p-4 rounded-2xl">
                            <div class="flex items-start gap-3 text-sm">
                                <div class="bg-white p-1.5 rounded-lg shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <span class="text-slate-600 leading-tight">{{ user.phone || 'ไม่ระบุเบอร์โทร' }}</span>
                            </div>

                            <div class="flex items-start gap-3 text-sm">
                                <div class="bg-white p-1.5 rounded-lg shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span class="text-slate-500 line-clamp-3 leading-tight">{{ user.address
                                    ||'ไม่ระบุที่อยู่' }}</span>
                            </div>
                        </div>

                        <div
                            class="mt-auto space-y-2 border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <div class="flex justify-between">
                                <span>Created</span>
                                <span class="text-slate-500">{{ formatDate(user.createdAt) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Modified</span>
                                <span class="text-slate-500">{{ formatDate(user.updatedAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 pb-6 pt-2 flex gap-3">
                        <RouterLink :to="`/Admin/Restaurant/edituser/${user.id}`"
                            class="flex-[2] btn btn-sm bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border-none rounded-xl font-bold transition-all duration-300">
                            Edit
                        </RouterLink>

                        <button @click="toggleUserStatus(user)" :class="[
                            'flex-1 btn btn-sm border-none rounded-xl transition-all duration-300',
                            (user.status || 'active') === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                        ]">
                            <svg v-if="(user.status || 'active') === 'active'" xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        </button>

                        <button @click="deleteUser(user.id, user.firstname)"
                            class="flex-1 btn btn-sm bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border-none rounded-xl transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div class="bg-slate-100 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-700">No users found</h3>
                <p class="text-slate-400 mt-1">เริ่มต้นใช้งานโดยการเพิ่มผู้ใช้ร้านอาหารใหม่</p>
            </div>
        </div>
    </LayoutAdmin>
</template>