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

// ตรวจสอบโหมด (ถ้ามี ID คือโหมดแก้ไข)
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
    // Validation: ถ้าเพิ่มใหม่ต้องมีรหัสผ่าน ถ้าแก้ไขไม่ต้องกรอกรหัสผ่านก็ได้
    const isBasicValid = userData.value.firstname && userData.value.lastname && userData.value.username && userData.value.restaurant;
    const isPassValid = mode.value === 'add' ? userData.value.password : true;

    if (!isBasicValid || !isPassValid) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
        return;
    }

    try {
        isLoading.value = true;
        
        if (mode.value === 'add') {
            // --- โหมดเพิ่มผู้ใช้ใหม่ ---
            const fakeEmail = `${userData.value.username.toLowerCase()}@system.local`;
            const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, userData.value.password);
            
            await setDoc(doc(db, 'User', userCredential.user.uid), {
                ...userData.value,
                email: fakeEmail,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            alert("เพิ่มผู้ใช้สำเร็จ!");
        } else {
            // --- โหมดแก้ไข ---
            const userRef = doc(db, 'User', userId);
            const updateData = { ...userData.value, updatedAt: serverTimestamp() };
            
            // ลบ password ออกจากการอัปเดต Firestore เพื่อไม่ให้ทับข้อมูลเดิมที่เป็นค่าว่าง
            delete updateData.password; 

            await updateDoc(userRef, updateData);
            alert("อัปเดตข้อมูลสำเร็จ!");
        }
        
        router.push('/Admin/Restaurantuser'); 
    } catch (error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        isLoading.value = false;
    }
};

const goBack = () => router.go(-1);
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
                        {{ mode === 'add' ? 'เพิ่มผู้ใช้งานร้านค้า' : 'แก้ไขข้อมูลผู้ใช้งาน' }}
                    </h1>
                    <p class="text-sm text-slate-500">จัดการรายละเอียดบัญชี ข้อมูลติดต่อ และร้านอาหารที่สังกัด</p>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">ยกเลิก</button>
                    <button @click="handleSave" :disabled="isLoading"
                        class="btn bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white px-6 shadow-md hover:shadow-lg transition-all">
                        <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
                        {{ mode === 'add' ? 'บันทึกข้อมูล' : 'อัปเดตข้อมูล' }}
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center text-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            รูปโปรไฟล์ผู้ใช้
                        </h3>

                        <div class="flex flex-col items-center gap-5 w-full max-w-xs">
                            <div class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative group">
                                <img v-if="imagePreview || userData.ImageUrl" :src="imagePreview || userData.ImageUrl" class="w-full h-full object-cover" />
                                <div v-else class="text-slate-400 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
                                </div>
                            </div>

                            <div role="tablist" class="tabs tabs-boxed bg-white border border-slate-200 p-1">
                                <a role="tab" class="tab text-xs h-8" :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'file' }" @click="imageInputMethod = 'file'">อัปโหลดไฟล์</a>
                                <a role="tab" class="tab text-xs h-8" :class="{ 'tab-active bg-blue-100 text-blue-600 font-bold': imageInputMethod === 'url' }" @click="imageInputMethod = 'url'">ใช้ URL</a>
                            </div>

                            <div v-if="imageInputMethod === 'file'" class="w-full">
                                <label class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 w-full h-10 gap-2 normal-case font-medium">
                                    เลือกรูปภาพจากเครื่อง
                                    <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                                </label>
                            </div>
                            <div v-else class="w-full animate-fade-in">
                                <input type="text" v-model="userData.ImageUrl" placeholder="วางลิงก์รูปภาพ (https://...)" class="input input-bordered input-sm w-full focus:input-primary h-10 bg-white" />
                            </div>
                        </div>
                    </div>

                    <div class="p-8 lg:col-span-2 space-y-8">
                        <div>
                            <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                ข้อมูลรายละเอียดผู้ใช้งาน
                            </h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ชื่อ <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.firstname" class="input input-bordered w-full focus:input-primary bg-slate-50" placeholder="กรอกชื่อจริง" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.lastname" class="input input-bordered w-full focus:input-primary bg-slate-50" placeholder="กรอกนามสกุล" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.username" :disabled="mode === 'edit'" :class="mode === 'edit' ? 'bg-slate-200 cursor-not-allowed opacity-70' : 'bg-blue-50/20'" class="input input-bordered w-full" placeholder="สำหรับใช้ Login" />
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">Password {{ mode === 'add' ? '*' : '(ว่างไว้หากไม่เปลี่ยน)' }}</span>
                                    </label>
                                    <input type="password" v-model="userData.password" :disabled="mode === 'edit'" :placeholder="mode === 'edit' ? 'แก้ไขที่หน้าเปลี่ยนรหัสผ่าน' : 'อย่างน้อย 6 ตัวอักษร'" class="input input-bordered w-full bg-slate-50 focus:input-primary" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-emerald-600">ร้านอาหารที่รับผิดชอบ <span class="text-red-500">*</span></span></label>
                                    <select v-model="userData.restaurant" class="select select-bordered w-full border-emerald-200 bg-emerald-50/10">
                                        <option value="" disabled>-- เลือกร้านอาหาร --</option>
                                        <option v-for="res in restaurants" :key="res.id" :value="res.Name">{{ res.Name }}</option>
                                    </select>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span></label>
                                    <input type="text" v-model="userData.phone" placeholder="0xx-xxx-xxxx" class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>

                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่ (Address)</span></label>
                                    <textarea v-model="userData.address" rows="3" placeholder="ระบุที่อยู่ปัจจุบัน" class="textarea textarea-bordered w-full focus:textarea-primary bg-slate-50"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>