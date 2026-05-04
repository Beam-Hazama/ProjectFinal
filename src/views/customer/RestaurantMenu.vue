<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useMenuStore } from '@/stores/shared/menu';
import { useCartStore } from '@/stores/customer/cart';
import { useQrcodeStore } from '@/stores/admin/qrcode';
import { useCategoryStore } from '@/stores/shared/category';
import { formatOpenDays } from '@/utils/format';

import MenuList from '@/components/shared/BlockMenu.vue';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const cartStore = useCartStore();
const qrStore = useQrcodeStore();
const categoryStore = useCategoryStore();

const restaurantName = decodeURIComponent(route.params.restaurantName || '');
const room = (route.params.room && route.params.room !== 'undefined') ? route.params.room : '-';

const isValidLocation = ref(false);
const isLoading = ref(true);
const currentRestaurant = ref(null);
const activeMenuTab = ref('');
const searchQuery = ref('');
const isSearchActive = ref(false);
const searchInput = ref(null);
const isCategoryModalOpen = ref(false);

const displayCategories = computed(() => {
    const categories = new Set();
    const allItems = (menuStore.list || []).filter(item => item.Restaurant === restaurantName);
    const hasPromo = allItems.some(item => item.PromoPrice && Number(item.PromoPrice) > 0);
    if (hasPromo) {
        categories.add("โปรโมชั่น");
    }
    categoryStore.list.forEach(c => {
        if (c.Name) categories.add(c.Name);
    });
    allItems.forEach(item => {
        if (item.Category) categories.add(item.Category);
    });
    return Array.from(categories);
});

const groupedMenu = computed(() => {
    const allItems = (menuStore.list || []).filter(item => item.Restaurant === restaurantName);
    const groups = {};
    displayCategories.value.forEach(cat => {
        let catItems;
        if (cat === "โปรโมชั่น") {
            catItems = allItems.filter(item => item.PromoPrice && Number(item.PromoPrice) > 0);
        } else {
            catItems = allItems.filter(item => item.Category === cat);
        }
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            groups[cat] = catItems.filter(item =>
                (item.Name && item.Name.toLowerCase().includes(query)) ||
                (item.Description && item.Description.toLowerCase().includes(query))
            );
        } else {
            groups[cat] = catItems;
        }
    });
    return groups;
});

const totalVisibleItems = computed(() => {
    return Object.values(groupedMenu.value).reduce((total, items) => total + items.length, 0);
});

onMounted(async () => {
    const isValid = await qrStore.validateRoom(room);
    isValidLocation.value = isValid;
    isLoading.value = false;
    if (isValid) {
        await menuStore.loadMenu();
        cartStore.loadCart(room);
        fetchRestaurantDetails();
    }
});

const toggleSearch = () => {
    isSearchActive.value = !isSearchActive.value;
    if (!isSearchActive.value) {
        searchQuery.value = '';
    } else {
        nextTick(() => {
            searchInput.value?.focus();
        });
    }
};

const toggleCategoryModal = () => {
    isCategoryModalOpen.value = !isCategoryModalOpen.value;
};

const fetchRestaurantDetails = async () => {
    try {
        const q = query(collection(db, "Restaurant"), where("Name", "==", restaurantName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            currentRestaurant.value = querySnapshot.docs[0].data();
        }
    } catch (error) {
        console.error("Error fetching restaurant details for poster:", error);
    }
}

const goBack = () => {
    router.push(`/user/${room}`);
};

const scrollToCategory = (categoryName) => {
    activeMenuTab.value = categoryName;
    isCategoryModalOpen.value = false;
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
        const headerOffset = 60;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    } else if (categoryName === 'เมนูทั้งหมด') {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
};
</script>
<template>    
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center bg-white">
        <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
        <p class="text-slate-500 font-medium animate-pulse">กำลังโหลดเมนู...</p>
    </div>
    <div v-else-if="!isValidLocation" class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-12 h-12 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">ไม่พบห้องนี้ในระบบ</h2>
        <p class="text-gray-500">กรุณาสแกน QR Code ใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ</p>
    </div>

    <div v-else class="min-h-screen bg-gray-50 pb-24 font-sans relative">
        <div class="relative w-full h-[220px] bg-slate-200 overflow-hidden">
            <img v-if="currentRestaurant?.BgUrl || currentRestaurant?.PosterUrl" 
                :src="currentRestaurant?.BgUrl || currentRestaurant?.PosterUrl"
                class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700"></div>            
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>            
            <div class="absolute top-0 w-full px-4 pt-4 flex justify-between items-center z-40">
                <button @click="goBack" class="btn btn-circle btn-sm bg-black/20 backdrop-blur-md border-0 text-white shadow-sm hover:bg-black/40">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>
            <div class="absolute bottom-12 left-5 right-5 z-10">
                <h1 class="font-black text-2xl text-white drop-shadow-md truncate"> {{ restaurantName }} </h1>
                <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold border border-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ currentRestaurant?.OpenTime }} - {{ currentRestaurant?.CloseTime }}
                    </div>
                </div>
            </div>
        </div>
        <div class="relative z-20 px-4 -mt-8">
            <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 border border-slate-100">
                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs font-black">{{ formatOpenDays(currentRestaurant?.OpenDays) }}</span>
                    </div>
                    <div v-if="currentRestaurant?.Distance" class="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span class="text-xs font-black">📍 {{ currentRestaurant.Distance }} กม.</span>
                    </div>
                    <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 ml-auto">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span class="text-xs font-black">เปิดอยู่</span>
                    </div>
                </div>
            </div>
        </div>        
        <div class="sticky top-0 z-30 bg-white border-b border-gray-100 mt-2 shadow-sm">
            <div class="flex items-center min-h-[50px]">                
                <div v-if="isSearchActive" class="flex-1 flex items-center px-3 gap-2 animate-fade-in">
                    <div class="relative flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <input type="text" placeholder="ค้นหาเมนูในร้านนี้..." ref="searchInput"
                            class="w-full bg-gray-100 rounded-xl py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                            v-model="searchQuery" />
                        <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <button @click="toggleSearch" class="text-xs font-bold text-gray-400 px-2 hover:text-red-500">
                        ยกเลิก
                    </button>
                </div>                
                <template v-else>
                    <button @click="toggleSearch" class="px-3 py-3 border-r border-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>
                    <button @click="toggleCategoryModal" class="px-3 py-3 border-r border-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </button>
                    <div class="flex-grow overflow-x-auto no-scrollbar flex text-[14px] font-medium whitespace-nowrap">
                        <button v-for="categoryName in displayCategories" :key="categoryName"
                            @click="scrollToCategory(categoryName)" class="px-4 py-3 relative text-gray-600 transition-colors"
                            :id="`tab-${categoryName}`" :class="{ 'text-blue-600 font-bold': activeMenuTab === categoryName }">
                            {{ categoryName }}
                            <div v-if="activeMenuTab === categoryName"
                                class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md"></div>
                        </button>
                    </div>
                </template>
            </div>
        </div>        
        <div id="menu-section" class="bg-white pt-2 pb-10 min-h-screen">            
            <template v-if="totalVisibleItems > 0">
                <div v-for="categoryName in displayCategories" :key="categoryName" :id="`category-${categoryName}`"
                    v-show="groupedMenu[categoryName]?.length > 0" class="scroll-mt-16">                    
                    <div
                        class="px-4 py-4 bg-gray-50/50 flex items-center justify-between border-y border-gray-100/50 mb-4">
                        <h3 class="text-[17px] font-black text-gray-800 tracking-tight">{{ categoryName }}</h3>
                    </div>
                    <div class="px-4">
                        <div class="animate-fade-in mb-8">
                            <MenuList :selectionRole="groupedMenu[categoryName]" :hideRestaurantName="true" />
                        </div>
                    </div>
                </div>
            </template>            
            <div v-else class="flex flex-col items-center justify-center pt-20 text-gray-400 px-6 text-center">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg v-if="searchQuery" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <template v-if="searchQuery">
                    <p class="text-[15px] font-bold text-gray-500">ไม่พบเมนูที่ตรงกับการค้นหา</p>
                    <p class="text-[13px]">ลองใช้คำค้นหาอื่น หรือตรวจดูตัวสะกดให้ถูกต้อง</p>
                </template>
                <template v-else>
                    <p class="text-[15px] font-bold text-gray-500">ยังไม่มีเมนูในขณะนี้</p>
                    <p class="text-[13px]">ร้านอาหารยังไม่ได้เพิ่มรายการเมนู กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
                </template>
                <button v-if="searchQuery" @click="searchQuery = ''" class="mt-4 text-blue-600 font-bold text-sm">
                    แสดงเมนูทั้งหมด
                </button>
            </div>
        </div>        
        <div class="fixed bottom-6 right-6 z-50 animate-fade-in group">
            <button @click="router.push(`/user/cart/${room}`)"
                class="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:bg-blue-700 hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" />
                </svg>
                <span v-if="cartStore.totalQuantity > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {{ cartStore.totalQuantity }}
                </span>
            </button>
        </div>        
        <div v-if="isCategoryModalOpen" class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:p-4">            
            <div @click="toggleCategoryModal" class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"></div>            
            <div class="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">                
                <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>
                <div class="overflow-y-auto custom-scrollbar">
                    <div class="flex flex-col">
                        <button v-for="(categoryName, index) in displayCategories" :key="'modal-' + categoryName"
                            @click="scrollToCategory(categoryName)" class="flex items-center justify-between px-6 py-4 transition-all duration-200"
                            :class="[index < displayCategories.length - 1 ? 'border-b border-gray-100' : '',activeMenuTab === categoryName ? 'bg-gray-50/50' : '']">
                            <span class="text-[16px] font-medium transition-colors"
                                :class="activeMenuTab === categoryName ? 'text-emerald-500 font-bold' : 'text-gray-600'">
                                {{ categoryName }}
                            </span>                            
                            <svg v-if="activeMenuTab === categoryName" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5 text-emerald-500">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out forwards;
}
@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}
@keyframes slideUp {
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>
