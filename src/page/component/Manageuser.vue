<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, query, where, setDoc, serverTimestamp } from 'firebase/firestore';
import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const restaurants = ref([]);
const imageInputMethod = ref('file');
const imagePreview = ref(null);

const userData = ref({
    Firstname: '',
    Lastname: '',
    Username: '',
    Password: '',
    Email: '',
    Phone: '',
    Address: '',
    Status: 'active',
    Role: 'restaurant',
    ImageUrl: '',
    Restaurant: '',
    Age: ''
});

onMounted(() => {
    fetchRestaurants();
});

watch(() => userData.value.ImageUrl, (newVal) => {
    if (imageInputMethod.value === 'url') {
        imagePreview.value = newVal;
    }
});

const isFormValid = computed(() => {
    const { Firstname, Lastname, Username, Restaurant, Phone, Address, Email, ImageUrl, Age, Password } = userData.value;

    if (!Firstname || !Lastname || !Username || !Restaurant || !Phone || !Address || !Email || !ImageUrl || !Age || !Password) return false;

    if (Phone.length !== 10) return false;
    return true;
});

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
    const { Firstname, Lastname, Username, Restaurant, Phone, Address, Password, ImageUrl, Status, Email, Age } = userData.value;

    if (!Firstname || !Lastname || !Username || !Restaurant || !Phone || !Address || !Password || !Age) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
        return;
    }

    try {
        isLoading.value = true;

        const q = query(collection(db, 'User'), where('Username', '==', Username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert(`Username "${Username}" ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น`);
            isLoading.value = false;
            return;
        }

        const fakeEmail = `${Username.toLowerCase().trim()}@system.local`;
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, Password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, 'User', uid), {
            Firstname,
            Lastname,
            Username,
            Password,
            Phone,
            Address,
            Restaurant,
            Email: Email,
            Age: Age,
            Status: Status || 'active',
            Role: 'restaurant',
            ImageUrl: ImageUrl || '',
            CreatedAt: serverTimestamp(),
            UpdatedAt: serverTimestamp()
        });
        
        alert("เพิ่มผู้ใช้สำเร็จ!");
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

const filterNumbers = (field) => {
    userData.value[field] = userData.value[field].replace(/[0-9]/g, '');
};

const filterNonNumbers = (field) => {
    let val = userData.value[field].replace(/[^0-9]/g, '');
    if (field === 'Phone' && val.length > 10) {
        val = val.slice(0, 10);
    }
    userData.value[field] = val;
};

const goBack = () => router.go(-1);
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen p-6 md:p-8 font-sans bg-slate-50/50">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">
                        Add New User
                    </h1>
                 
                </div>

                <div class="flex gap-3">
                    <button @click="goBack"
                        class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl transition-all font-bold w-28">Cancel</button>
                    <button @click="handleSave" :disabled="!isFormValid || isLoading"
                        class="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white w-28 rounded-xl shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 hover:shadow-lg disabled:hover:shadow-none font-bold">
                        <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
                        Save
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

                    
                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
                            รูปภาพหน้าร้าน <span class="text-red-500">*</span>
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
                                    <input type="text" v-model="userData.Firstname" @input="filterNumbers('Firstname')"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="กรอกชื่อจริง" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล
                                            <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.Lastname" @input="filterNumbers('Lastname')"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="กรอกนามสกุล" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username
                                            <span class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.Username"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50"
                                        placeholder="สำหรับใช้ Login" />
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">
                                            Password *
                                        </span>
                                    </label>
                                    <input type="password" v-model="userData.Password"
                                        class="input input-bordered w-full bg-slate-50 focus:input-primary"
                                        placeholder="กรอกรหัสผ่าน" />
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">ร้านอาหาร
                                            <span class="text-red-500">*</span></span></label>
                                    <select v-model="userData.Restaurant" class="select select-bordered w-full">
                                        <option value="" disabled>-- เลือกร้านอาหาร --</option>
                                        <option v-for="res in restaurants" :key="res.id" :value="res.Name">{{ res.Name
                                        }}</option>
                                    </select>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">Email
                                            <span class="text-red-500">*</span></span></label>
                                    <div class="relative">
                                        <input type="email" v-model="userData.Email"
                                            placeholder="example@email.com"
                                            class="input input-bordered w-full bg-slate-50 focus:input-primary text-left" />
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label"><span
                                            class="label-text font-medium text-slate-600">เบอร์โทรศัพท์ <span
                                                class="text-red-500">*</span></span></label>
                                    <input type="text" v-model="userData.Phone" placeholder="0xx-xxx-xxxx"
                                        maxlength="10" @input="filterNonNumbers('Phone')"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
 
                                <div class="form-control">
                                    <label class="label"><span
                                            class="label-text font-medium text-slate-600">อายุ <span
                                                class="text-red-500">*</span></span></label>
                                    <input type="number" v-model="userData.Age" placeholder="กรอกอายุ"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>

                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่
                                            (Address) <span class="text-red-500">*</span></span></label>
                                    <textarea v-model="userData.Address" rows="3" placeholder="ระบุที่อยู่ปัจจุบัน"
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
