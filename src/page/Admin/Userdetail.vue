<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const restaurants = ref([]);

// ตรวจสอบโหมด (ถ้ามี ID ใน URL คือโหมดแก้ไข)
const userId = route.params.id;
const mode = ref(userId ? 'edit' : 'add');

// การจัดการรูปภาพ
const imageInputMethod = ref('file');
const imagePreview = ref(null);

const userData = ref({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    status: 'active', // เพิ่มสเตตัสเริ่มต้นเป็น active ใน Object ข้อมูล
    role: 'restaurant',
    ImageUrl: '',
    restaurant: ''
});

// ดึงรายชื่อร้านอาหารสำหรับ Dropdown
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

// ดึงข้อมูลผู้ใช้งานกรณีโหมดแก้ไข
const fetchUserData = async () => {
    if (mode.value === 'edit') {
        try {
            const docRef = doc(db, 'User', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // นำข้อมูลเดิมรวมถึงรหัสผ่านมาใส่ในฟอร์ม และรักษาค่า status เดิมไว้
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
    }
};

onMounted(() => {
    fetchRestaurants();
    fetchUserData();
});

watch(() => userData.value.ImageUrl, (newVal) => {
    if (imageInputMethod.value === 'url') {
        imagePreview.value = newVal;
    }
});


const goBack = () => router.go(-1);
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans bg-slate-50/50">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">
                         ข้อมูลรายละเอียดผู้ให้บริการร้านค้า 
                    </h1>
                    <p class="text-slate-500 mt-1">ดูรายละเอียดบัญชี ข้อมูลติดต่อ และร้านอาหารที่สังกัด</p>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">กลับ</button>
                
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
                                    <label type="text" class="input input-bordered w-full focus:input-primary bg-slate-50">
                                        {{ userData.firstname}}
                                    </label>
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล
                                            <span class="text-red-500">*</span></span></label>
                                    <label type="text" class="input input-bordered w-full focus:input-primary bg-slate-50">
                                        {{ userData.lastname }}</label>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username
                                            <span class="text-red-500">*</span></span></label>
                                    <label type="text" class="input input-bordered w-full focus:input-primary bg-slate-50">
                                        {{ userData.username }}
                                    </label>
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">
                                            Password {{ mode === 'add' ? '*' : '(รหัสผ่านปัจจุบัน)' }}
                                        </span>
                                    </label>
                                    <label type="password" class="input input-bordered w-full bg-slate-50 focus:input-primary">
                                        {{ userData.password }}
                                    </label>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">ร้านอาหาร
                                            <span class="text-red-500">*</span></span></label>
                                    <label class="input input-bordered w-full">
                                        {{ userData.restaurant }}
                                    </label>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span
                                            class="label-text font-medium text-slate-600">เบอร์โทรศัพท์ <span
                                                class="text-red-500">*</span></span></label>
                                    <label type="text" class="input input-bordered w-full focus:input-primary bg-slate-50" >
                                        {{ userData.phone }}
                                    </label>
                                </div>

                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่
                                            (Address) <span class="text-red-500">*</span></span></label>
                                    <textarea  rows="3" placeholder="ระบุที่อยู่ปัจจุบัน"
                                        class="textarea textarea-bordered w-full focus:textarea-primary bg-slate-50" readonly="">{{ userData.address }}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>