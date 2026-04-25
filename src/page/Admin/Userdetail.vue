<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();
const username = route.params.username;

const imagePreview = ref(null);
const userData = ref({
    Firstname: '',
    Lastname: '',
    Username: '',
    Password: '',
    Phone: '',
    Address: '',
    Status: 'active',
    Role: 'restaurant',
    ImageUrl: '',
    Restaurant: '',
    Email: '',
    Age: ''
});

onMounted(() => {
    fetchUserData();
});

const fetchUserData = async () => {
    if (!username) return;
    
    try {
        const q = query(collection(db, 'User'), where('Username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            userData.value = { ...userData.value, ...data };
            imagePreview.value = data.ImageUrl;
            if (data.ImageUrl && data.ImageUrl.startsWith('http')) {
                imageInputMethod.value = 'url';
            }
        } else {
            alert("ไม่พบข้อมูลผู้ใช้งาน");
            router.push('/Admin/Restaurantuser');
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
};

const goBack = () => router.go(-1);
</script>

<template>
    <LayoutAdmin>
        <div class="p-6 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">
                        Restaurant User Detail
                    </h1>

                </div>

                <div class="flex gap-3">
                    <button @click="goBack"
                        class="btn btn-ghost text-slate-500 hover:bg-slate-200 w-28 rounded-xl font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Back</button>

                </div>
            </div>

            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
                            รูปภาพผู้ใช้งาน
                        </h3>

                        <div class="flex flex-col items-center gap-5 w-full max-w-xs">
                            <div
                                class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                                <img v-if="imagePreview || userData.ImageUrl" :src="imagePreview || userData.ImageUrl"
                                    class="w-full h-full object-cover" />
                                <div v-else class="text-slate-400 flex flex-col items-center">
                                    <span class="text-sm font-medium">ไม่มีรูปภาพร้าน</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-8 lg:col-span-2 space-y-8">
                        <div>
                            <h3
                                class="font-bold text-slate-700 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                ข้อมูลรายละเอียดผู้ใช้งาน
                            </h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ชื่อ <span
                                                class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Firstname }}
                                    </div>
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล
                                            <span class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Lastname }}</div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username
                                            <span class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700 font-medium">
                                        {{ userData.Username }}
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">
                                            Password
                                        </span>
                                    </label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        ••••••••
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">ร้านอาหาร
                                            <span class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Restaurant }}
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Email <span
                                                 class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full relative flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Email }}
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span
                                            class="label-text font-medium text-slate-600">เบอร์โทรศัพท์ <span
                                                class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Phone }}
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">อายุ <span
                                                class="text-red-500">*</span></span></label>
                                    <div class="input input-bordered w-full flex items-center bg-slate-50 text-slate-700">
                                        {{ userData.Age }}
                                    </div>
                                </div>

                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่
                                            (Address) <span class="text-red-500">*</span></span></label>
                                    <textarea rows="3"
                                        class="textarea textarea-bordered w-full focus:textarea-primary bg-slate-50"
                                        readonly="">{{ userData.Address }}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
