<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, storage } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';

const router = useRouter();

const isLoading = ref(false);
const restaurants = ref([]);
const imagePreview = ref(null);
const selectedFile = ref(null);

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
        if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.value);
        }
        selectedFile.value = file;
        const previewUrl = URL.createObjectURL(file);
        imagePreview.value = previewUrl;
        userData.value.ImageUrl = previewUrl;
    }
};

onUnmounted(() => {
    if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.value);
    }
});

const handleSave = async () => {
    const { Firstname, Lastname, Username, Restaurant, Phone, Address, Password, ImageUrl, Status, Email, Age } = userData.value;
    if (!Firstname || !Lastname || !Username || !Restaurant || !Phone || !Address || !Password || !Age) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
        return;
    }
    try {
        isLoading.value = true;
        let finalImageUrl = '';
        if (selectedFile.value) {
            try {
                const fileName = `users/${Username}_${Date.now()}`;
                const fileRef = storageRef(storage, fileName);
                const snapshot = await uploadBytes(fileRef, selectedFile.value);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            } catch (uploadError) {
                console.error("Error uploading user image:", uploadError);
                alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพประจำตัว");
                isLoading.value = false;
                return;
            }
        }
            // Validate if username already exists first
            const usersRef = collection(db, 'User');
            const q = query(usersRef, where('Username', '==', Username.trim()));
            const querySnapshot = await getDocs(q);            
            if (!querySnapshot.empty) {
                alert("Username นี้ถูกใช้งานไปแล้ว");
                isLoading.value = false;
                return;
            }
            await addDoc(collection(db, 'User'), {
                Firstname,
                Lastname,
                Username: Username.trim(),
                Password,
                Phone,
                Address,
                Restaurant,
                Email: Email,
                Age: Age,
                Status: Status || 'active',
                Role: 'restaurant',
                ImageUrl: finalImageUrl || '',
                CreatedAt: serverTimestamp(),
                UpdatedAt: serverTimestamp()
            });
            router.push('/Admin/Restaurantuser');
    } catch (error) {
        console.error("Error Detail:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        isLoading.value = false;
    }
};

const filterNumbers = (field) => {
    userData.value[field] = userData.value[field].replace(/[0-9]/g, '');
};

const filterNonNumbers = (field) => {
    let val = String(userData.value[field]).replace(/[^0-9]/g, '');
    if (field === 'Phone' && val.length > 10) {
        val = val.slice(0, 10);
    }
    if (field === 'Age' && val.length > 2) {
        val = val.slice(0, 2);
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
                    <button @click="goBack" class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl transition-all font-bold w-28">Cancel</button>
                    <button @click="handleSave" :disabled="!isFormValid || isLoading" class="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white w-28 rounded-xl shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 hover:shadow-lg disabled:hover:shadow-none font-bold">
                        <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
                        Save
                    </button>
                </div>
            </div>
            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2"> รูปภาพประจำตัว </h3>
                        <div class="flex flex-col items-center gap-5 w-full max-w-xs">
                            <div class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative">
                                <img v-if="imagePreview || userData.ImageUrl" :src="imagePreview || userData.ImageUrl" class="w-full h-full object-cover" />
                                <div v-else class="text-slate-400 flex flex-col items-center">
                                    <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-4 w-full">
                                <label class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-12 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    คลิกเพื่อเลือกไฟล์รูปภาพ
                                    <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                                </label>                                
                            </div>
                        </div>
                    </div>
                    <div class="p-8 lg:col-span-2 space-y-8">
                        <div>
                            <h3 class="font-bold text-slate-700 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                ข้อมูลรายละเอียดผู้ใช้งาน
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ชื่อ</span></label>
                                    <input type="text" v-model="userData.Firstname" @input="filterNumbers('Firstname')" class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">นามสกุล</span></label>
                                    <input type="text" v-model="userData.Lastname" @input="filterNumbers('Lastname')" class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">Username</span></label>
                                    <input type="text" v-model="userData.Username" class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">Password</span>
                                    </label>
                                    <input type="password" v-model="userData.Password" class="input input-bordered w-full bg-slate-50 focus:input-primary" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-bold text-slate-600">ร้านอาหาร</span></label>
                                    <select v-model="userData.Restaurant" class="select select-bordered w-full">
                                        <option value="" disabled>-- เลือกร้านอาหาร --</option>
                                        <option v-for="res in restaurants" :key="res.id" :value="res.Name">{{ res.Name }}</option>
                                    </select>
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">Email</span></label>
                                    <div class="relative">
                                        <input type="email" v-model="userData.Email" class="input input-bordered w-full bg-slate-50 focus:input-primary text-left" />
                                    </div>
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">เบอร์โทรศัพท์</span></label>
                                    <input type="text" v-model="userData.Phone" maxlength="10" @input="filterNonNumbers('Phone')" class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
                                <div class="form-control">
                                    <label class="label"><span class="label-text font-medium text-slate-600">อายุ</span></label>
                                    <input type="text" v-model="userData.Age" maxlength="2"
                                        @input="filterNonNumbers('Age')"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50" />
                                </div>
                                <div class="form-control md:col-span-2">
                                    <label class="label"><span class="label-text font-medium text-slate-600">ที่อยู่
                                            (Address)</span></label>
                                    <textarea v-model="userData.Address" rows="3" class="textarea textarea-bordered w-full focus:textarea-primary bg-slate-50"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
