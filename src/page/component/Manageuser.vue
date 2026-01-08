<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

// Watch รูปภาพกรณีใส่เป็น URL
watch(() => userData.value.ImageUrl, (newVal) => {
    if (imageInputMethod.value === 'url') {
        imagePreview.value = newVal;
    }
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
            userData.value.ImageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const handleSave = async () => {
    // 1. Validation: เช็คค่าว่าง
    const { firstname, lastname, username, restaurant, phone, address, password, ImageUrl, status } = userData.value;

    if (!firstname || !lastname || !username || !restaurant || !phone || !address || !password) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รวมถึงรหัสผ่าน)");
        return;
    }

    try {
        isLoading.value = true;

        // สร้าง Email ปลอมจาก Username
        const fakeEmail = `${username.toLowerCase().trim()}@system.local`;

        if (mode.value === 'add') {
            // --- โหมดเพิ่มผู้ใช้ใหม่ (Auth + Firestore) ---
            const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'User', uid), {
                firstname,
                lastname,
                username,
                password,
                email: fakeEmail,
                phone,
                address,
                restaurant,
                status: status || 'active', // บันทึกสเตตัส active ลง Firestore
                role: 'restaurant',
                ImageUrl: ImageUrl || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            alert("เพิ่มผู้ใช้สำเร็จ!");
        } else {
            // --- โหมดแก้ไข (เฉพาะ Firestore) ---
            const userRef = doc(db, 'User', userId);

            const updateData = {
                firstname,
                lastname,
                username,
                password,
                email: fakeEmail,
                phone,
                address,
                restaurant,
                status: status || 'active', // บันทึกสเตตัส active ลง Firestore
                ImageUrl: ImageUrl || '',
                updatedAt: serverTimestamp()
            };

            await updateDoc(userRef, updateData);
            alert("อัปเดตข้อมูลสำเร็จ!");
        }

        router.push('/Admin/Restaurantuser');
    } catch (error) {
        console.error("Error Detail:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert("Username นี้ถูกใช้งานไปแล้ว");
        } else {
            alert("เกิดข้อผิดพลาด: " + error.message);
        }
    } finally {
        isLoading.value = false;
    }
};

const goBack = () => router.go(-1);
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans bg-slate-50/50">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">
                        {{ mode === 'add' ? 'เพิ่มผู้ใช้งานร้านค้า' : 'แก้ไขข้อมูลผู้ใช้งาน' }}
                    </h1>
                    <p class="text-slate-500 mt-1">จัดการรายละเอียดบัญชี ข้อมูลติดต่อ และร้านอาหารที่สังกัด</p>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">ยกเลิก</button>
                    <button @click="handleSave" :disabled="isLoading"
                        class="btn bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white px-8 rounded-xl shadow-md hover:shadow-lg transition-all">
                        <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
                        {{ mode === 'add' ? 'บันทึกข้อมูล' : 'อัปเดตข้อมูล' }}
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
                            รูปภาพหน้าร้าน
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

                            <div role="tablist" class="tabs tabs-boxed  bg-white border border-slate-200 p-1 ">
                                <a role="tab" class="tab text-xs h-8 transition-all"
                                    :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'file' }"
                                    @click="imageInputMethod = 'file'">
                                    อัปโหลดไฟล์
                                </a>
                                <a role="tab" class="tab text-xs h-8 transition-all"
                                    :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'url' }"
                                    @click="imageInputMethod = 'url'">
                                    ใช้ URL
                                </a>
                            </div>

                            <div v-if="imageInputMethod === 'file'" class="w-full text-center animate-fade-in">
                                <label
                                    class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    เลือกรูปภาพจากเครื่อง
                                    <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                                </label>
                                <div class="text-[10px] text-slate-400 mt-2">รองรับไฟล์ .jpg, .png ขนาดไม่เกิน 5MB</div>
                            </div>


                            <div v-else class="w-full animate-fade-in">
                                <div class="relative">
                                    <input type="text" placeholder="วางลิงก์รูปภาพ (https://...)"
                                        class="input input-bordered input-sm w-full pl-9 focus:input-primary bg-white h-10"
                                        v-model="userData.ImageUrl" />
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 absolute left-3 top-3 text-slate-400" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div class="text-[10px] text-slate-400 mt-2 text-center">รูปภาพจะแสดงตัวอย่างด้านบนทันที
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
                                    <input type="text" v-model="userData.firstname"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="กรอกชื่อจริง" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล
                                            <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.lastname"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="กรอกนามสกุล" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username
                                            <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.username"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="สำหรับใช้ Login" />
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">
                                            Password {{ mode === 'add' ? '*' : '(รหัสผ่านปัจจุบัน)' }}
                                        </span>
                                    </label>
                                    <input type="password" v-model="userData.password"
                                        class="input input-bordered w-full bg-slate-50 focus:input-primary"
                                        placeholder="กรอกรหัสผ่าน" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">ร้านอาหาร
                                            <span class="text-red-500">*</span></span></label>
                                    <select v-model="userData.restaurant" class="select select-bordered w-full">
                                        <option value="" disabled>-- เลือกร้านอาหาร --</option>
                                        <option v-for="res in restaurants" :key="res.id" :value="res.Name">{{ res.Name
                                            }}</option>
                                    </select>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span
                                            class="label-text font-medium text-slate-600">เบอร์โทรศัพท์ <span
                                                class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.phone" placeholder="0xx-xxx-xxxx"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>

                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่
                                            (Address) <span class="text-red-500">*</span></span></label>
                                    <textarea v-model="userData.address" rows="3" placeholder="ระบุที่อยู่ปัจจุบัน"
                                        class="textarea textarea-bordered w-full focus:textarea-primary bg-slate-50"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>