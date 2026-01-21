<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';

import { useMenuStore } from '@/stores/menu';
import { useRestaurant } from '@/stores/Restaurant';


import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, } from '@/firebase';

import LayoutAdmin from '@/page/Restaurant/restaurant.vue';

const route = useRoute();
const router = useRouter();

const mode = ref('');

const MenuStore = useMenuStore()
const Restaurant = useRestaurant()

const productId = route.params.id
const selectedFile = ref(null);
const imagePreview = ref('');
const imageInputMethod = ref('file');

const categories = ['อาหารตามสั่ง', 'เครื่องดื่ม', 'ของทานเล่น', 'ก๋วยเตี๋ยว', 'ของหวาน', 'อาหารอิตาลี'];

const MenuData = reactive({
    Name: '',
    ImageUrl: '',
    Price: '',
    Restaurant: '',
    Description: '',
    Category: '',
    Status: '',
});


watch(() => MenuData.ImageUrl, (newVal) => {
    if (imageInputMethod.value === 'url') {
        imagePreview.value = newVal;
    }
});

const checkAddProduct = async (data) => {
    try {
        let MenuId
        let ImageUrl = data.ImageUrl || ''


        const saveData = {
            Name: data.Name,
            ImageUrl: ImageUrl,
            Price: Number(data.Price),
            Restaurant: data.Restaurant,
            Description: data.Description,
            Category: data.Category,
            Status: data.Status,
            UpdatedAt: serverTimestamp()
        }

        if (mode.value === 'Add Product') {
            const docRef = await addDoc(collection(db, 'Menu'), {
                ...saveData,
                CreatedAt: serverTimestamp()
            })
            MenuId = docRef.id
        } else if (mode.value === 'Update Product') {
            MenuId = route.params.id
            await updateDoc(doc(db, 'Menu', MenuId), saveData)
        }

        if (['Restaurant Add Menu', 'Restaurant Edit Menu'].includes(route.name)) {
            router.push({
                name: 'Restaurants Menulist',
                params: { restaurantName: MenuData.Restaurant }
            })
        } else {
            router.push({ name: 'Admin Menu List' })
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error)
    }
}

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0];
    if (selectedFile.value) {
        const previewUrl = URL.createObjectURL(selectedFile.value)
        imagePreview.value = previewUrl
        MenuData.ImageUrl = previewUrl
        MenuStore.imageList[productId] = previewUrl
    }
};

const goBack = () => {
    router.go(-1);
}




const formatDate = (timestamp) => {
    if (!timestamp) return '-';
   
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString('th-TH');
    }
    
    if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('th-TH');
    }
    
    return new Date(timestamp).toLocaleString('th-TH');
};

onMounted(async () => {
    if (route.params.id) {
        mode.value = 'Update Product';
        const productSnap = await getDoc(doc(db, 'Menu', route.params.id));

        if (productSnap.exists()) {
            const res = productSnap.data();
            Object.assign(MenuData, res);

            imagePreview.value = res.ImageUrl;
            if (res.ImageUrl && res.ImageUrl.startsWith('http')) {
                imageInputMethod.value = 'url';
            }
        }
    } else {
        mode.value = 'Add Product';
        if (route.params.restaurantName) {
            
            MenuData.Restaurant = route.params.restaurantName;
        }
    }

    Restaurant.loadListRestaurant()
});
</script>

<template>
    <LayoutAdmin>
        <div class="min-h-screen  p-6 md:p-8 font-sans">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div class="flex items-center gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
                            {{ mode === 'Add Product' ? 'เพิ่มเมนูอาหารใหม่' : 'แก้ไขเมนูอาหาร' }}
                        </h1>
                        <p class="text-sm text-slate-500">จัดการรายละเอียด ข้อมูลราคา และสต็อกสินค้า</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">ยกเลิก</button>
                    <button @click="checkAddProduct(MenuData)"
                        class="btn bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 px-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-5 h-5 mr-1">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">

                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            รูปภาพเมนู
                        </h3>

                        <div class="flex flex-col items-center gap-5 w-full max-w-xs">
                            <div
                                class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative group">
                                <img v-if="imagePreview || MenuData.ImageUrl" :src="imagePreview || MenuData.ImageUrl"
                                    class="w-full h-full object-cover" />
                                <div v-else class="text-slate-400 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-50"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
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
                                        v-model="MenuData.ImageUrl" />
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
                            <div v-if="mode === 'Update Product'"
                                class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                                <div class="flex flex-col">
                                    <span
                                        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">วันที่สร้าง</span>
                                    <span class="text-sm font-semibold text-slate-700">{{ formatDate(MenuData.CreatedAt)
                                    }}</span>
                                </div>
                                <div class="flex flex-col">
                                    <span
                                        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">แก้ไขล่าสุด</span>
                                    <span class="text-sm font-semibold text-slate-700">{{ formatDate(MenuData.UpdatedAt)
                                    }}</span>
                                </div>
                            </div>

                            <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูลทั่วไป</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="form-control md:col-span-1">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">ชื่อเมนูอาหาร <span
                                                class="text-red-500">*</span></span>
                                    </label>
                                    <input type="text" placeholder="เช่น ข้าวกะเพราไก่ไข่ดาว"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                                        v-model="MenuData.Name" />
                                </div>
                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">ราคา<span
                                                class="text-red-500">*</span></span>
                                    </label>
                                    <div class="relative">
                                        <input type="number" placeholder="0"
                                            class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200"
                                            v-model="MenuData.Price" />
                                        <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                                    </div>
                                </div>

                                <div class="form-control md:col-span-3">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">รายละเอียด</span>
                                    </label>
                                    <input type="text"
                                        class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                                        v-model="MenuData.Description" />
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">ร้านอาหาร</span>
                                    </label>
                                    <select
                                        class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                        v-model="MenuData.Restaurant"
                                        :disabled="mode === 'Update Product' || route.params.restaurantName">
                                        <option disabled value="">เลือกร้านอาหาร</option>
                                        <option v-for="RestaurantName in Restaurant.list" :key="RestaurantName.id"
                                            :value="RestaurantName.Name">
                                            {{ RestaurantName.Name }}
                                        </option>
                                    </select>
                                    <p v-if="mode === 'Update Product' || route.params.restaurantName"
                                        class="text-[10px] text-slate-400 mt-1 italic">
                                        * ไม่สามารถเปลี่ยนร้านค้าได้
                                    </p>
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">หมวดหมู่อาหาร</span>
                                    </label>
                                    <select
                                        class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                                        v-model="MenuData.Category">
                                        <option disabled value="">เลือกหมวดหมู่</option>
                                        <option v-for="cat in categories" :key="cat" :value="cat">
                                            {{ cat }}
                                        </option>
                                    </select>
                                </div>

                                <div class="form-control">
                                    <label class="label">
                                        <span class="label-text font-medium text-slate-600">สถานะการขาย</span>
                                    </label>
                                    <select
                                        class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                                        v-model="MenuData.Status">
                                        <option disabled value="">เลือกสถานะ</option>
                                        <option value="open">🟢 เปิดขาย (Open)</option>
                                        <option value="close">🔴 ปิดชั่วคราว (Close)</option>
                                    </select>
                                </div>


                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>

    </LayoutAdmin>
</template>