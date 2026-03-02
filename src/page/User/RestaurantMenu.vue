```
<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useCartStore } from '@/stores/cartStore';
import { useQRCodeStore } from '@/stores/qrcode';
import { usePosterStore } from '@/stores/posterStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import product from '@/page/component/blockmenu.vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const menuStore = useMenuStore();
const qrStore = useQRCodeStore();
const posterStore = usePosterStore();
const categoryStore = useCategoryStore();


const currentSlide = ref(0);
let carouselTimeout = null;

const isValidLocation = ref(false);
const isLoading = ref(true);
const currentRestaurant = ref(null);

const restaurantName = decodeURIComponent(route.params.restaurantName || '');
const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

const activeMenuTab = ref('เมนูดัง คนสั่งเยอะ');


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

const startCarousel = () => {
    stopCarousel();
    if (posterStore.activePosters?.length > 1) {
        const currentPoster = posterStore.activePosters[currentSlide.value];
        const durationMs = (currentPoster?.displayDuration || 5) * 1000;

        carouselTimeout = setTimeout(() => {
            nextSlide();
        }, durationMs);
    }
};

const stopCarousel = () => {
    if (carouselTimeout) {
        clearTimeout(carouselTimeout);
        carouselTimeout = null;
    }
};

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % posterStore.activePosters.length;
    startCarousel();
};

const prevSlide = () => {
    currentSlide.value = currentSlide.value === 0
        ? posterStore.activePosters.length - 1
        : currentSlide.value - 1;
    startCarousel();
};

const goToSlide = (index) => {
    currentSlide.value = index;
    startCarousel();
};

watch(() => posterStore.activePosters, (newVal) => {
    if (newVal && newVal.length > 0 && !carouselTimeout) {
        startCarousel();
    }
}, { deep: true });

onMounted(async () => {
    const isValid = await qrStore.validateRoom(building, floor, room);
    isValidLocation.value = isValid;
    isLoading.value = false;

    if (isValid) {
        menuStore.loadMenu();
        cartStore.loadcart(building, floor, room);
        posterStore.loadPosters(restaurantName);
        categoryStore.loadCategories(restaurantName);
        fetchRestaurantDetails();
        startCarousel();
    }
});

onUnmounted(() => {
    stopCarousel();
});

const goBack = () => {
    router.push(`/user/${building}/${floor}/${room}`);
};

const filteredMenu = computed(() => {
    let items = menuStore.list || [];

    // 1. Filter by Restaurant first!
    items = items.filter(item => item.Restaurant === restaurantName);

    // 2. Filter by Category Tab
    if (activeMenuTab.value !== 'เมนูดัง คนสั่งเยอะ' && activeMenuTab.value !== 'โปรโมชั่น' && activeMenuTab.value !== 'รีวิว') {
        items = items.filter(item =>
            (item.Category && item.Category === activeMenuTab.value) ||
            (item.role && (Array.isArray(item.role) ? item.role.includes(activeMenuTab.value) : item.role === activeMenuTab.value)) ||
            (item.Name && item.Name.includes(activeMenuTab.value))
        );
    }
    // If 'เมนูดัง คนสั่งเยอะ', just show everything for now or subset
    return items;
});

</script>

<template>
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="loading loading-spinner loading-lg text-blue-600"></div>
    </div>

    <div v-else-if="!isValidLocation"
        class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
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

        <!-- Hero Banner Area (Dynamic Poster Carousel) -->
        <div class="relative w-full h-[220px]"
            :class="{ 'bg-red-800': posterStore.activePosters.length === 0 && !currentRestaurant?.PosterUrl }">

            <div v-if="posterStore.activePosters.length > 0" class="w-full h-full overflow-hidden relative"
                @mouseenter="stopCarousel" @mouseleave="startCarousel">

                <!-- Slides container -->
                <div class="flex transition-transform duration-500 ease-out h-full w-full"
                    :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                    <div v-for="poster in posterStore.activePosters" :key="poster.id"
                        class="w-full flex-shrink-0 h-full relative group">
                        <img :src="poster.ImageUrl" class="object-cover w-full h-full" alt="Poster" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                </div>

                <!-- Controls (only show if > 1 poster) -->
                <div v-if="posterStore.activePosters.length > 1"
                    class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity z-10">
                    <button @click="prevSlide"
                        class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❮</button>
                    <button @click="nextSlide"
                        class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❯</button>
                </div>

                <!-- Pagination dots -->
                <div v-if="posterStore.activePosters.length > 1"
                    class="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 z-10">
                    <button v-for="(_, index) in posterStore.activePosters" :key="'dot-' + index"
                        @click="goToSlide(index)"
                        :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentSlide === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80']">
                    </button>
                </div>
            </div>

            <!-- Fallback to single poster or default red background if no active posters -->
            <div v-else class="w-full h-full">
                <img v-if="currentRestaurant?.PosterUrl" :src="currentRestaurant.PosterUrl"
                    class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            <!-- Top Actions Overlay -->
            <div class="absolute top-0 w-full px-4 pt-4 pb-2 flex justify-between items-center z-40">
                <button @click="goBack"
                    class="btn btn-circle btn-sm bg-white/90 border-0 text-gray-800 shadow-sm hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>


            </div>
        </div>

        <!-- Overlapping Restaurant Info Card -->
        <div class="relative z-10 px-4 -mt-10 mb-2">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div class="flex justify-between items-start mb-2">
                    <h1 class="font-bold text-xl text-gray-800 truncate pr-2">{{ restaurantName }}</h1>
                    <button class="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>
                </div>

                <!-- Mock Stats Row -->
                <div class="flex items-center text-[12px] text-gray-600 mb-3 gap-2 flex-wrap">
                    <div class="flex items-center text-amber-500 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                            class="w-3.5 h-3.5 mr-0.5">
                            <path fill-rule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clip-rule="evenodd" />
                        </svg>
                        <span>4.6 <span class="text-gray-400 font-normal">(362)</span></span>
                    </div>
                    <span class="text-gray-300">›</span>
                    <div class="flex items-center gap-1">
                        <span class="text-[10px]">🛵</span>
                        <span>จัดส่ง ▾</span>
                    </div>
                    <span class="text-gray-300">•</span>
                    <span>฿0 <span class="line-through text-gray-400">฿13</span></span>
                    <span class="text-gray-300">•</span>
                    <span>2.1 กม. (32 นาที)</span>
                </div>

                <!-- Action Buttons Row -->
                <div class="flex gap-2 mb-3 max-w-full overflow-x-auto no-scrollbar pb-1">
                    <button
                        class="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 whitespace-nowrap text-[13px] font-medium text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        สร้างกลุ่ม
                    </button>
                    <button
                        class="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 whitespace-nowrap text-[13px] font-medium text-gray-700">
                        <span
                            class="text-green-600 bg-green-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">2</span>
                        สั่งสองร้านได้
                    </button>
                    <button
                        class="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 whitespace-nowrap text-[13px] font-medium text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                        </svg>
                        เปลี่ยนภาษาเมนู
                    </button>
                </div>

                <!-- Promo Banner -->
                <div
                    class="bg-green-50/50 rounded-xl px-3 py-2 flex items-center justify-between border border-green-100/50">
                    <p class="text-[12px] font-medium text-gray-800 leading-tight">
                        ลดสูงสุด ฿300 เมื่อสั่งกับเพื่อน<br>
                        <span class="text-gray-500 font-normal">เริ่มสร้างกลุ่มเลย ›</span>
                    </p>
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                        🍲
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Navigation Tabs -->
        <div class="sticky top-0 z-30 bg-white border-b border-gray-100 mt-2 shadow-sm">
            <div class="flex items-center">
                <!-- Search Icon Left -->
                <div class="px-3 py-3 border-r border-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <!-- Menu Icon -->
                <div class="px-3 py-3 border-r border-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
                <!-- Scrollable Tabs -->
                <div class="flex-grow overflow-x-auto no-scrollbar flex text-[14px] font-medium whitespace-nowrap">
                    <!-- Default Top Tabs -->
                    <button @click="activeMenuTab = 'เมนูดัง คนสั่งเยอะ'"
                        class="px-4 py-3 relative text-gray-600 transition-colors"
                        :class="{ 'text-green-600 font-bold': activeMenuTab === 'เมนูดัง คนสั่งเยอะ' }">
                        เมนูดัง คนสั่งเยอะ
                        <div v-if="activeMenuTab === 'เมนูดัง คนสั่งเยอะ'"
                            class="absolute bottom-0 left-0 w-full h-[3px] bg-green-500 rounded-t-md"></div>
                    </button>
                    <!-- Dynamic Categories -->
                    <button v-for="category in categoryStore.list" :key="category.id"
                        @click="activeMenuTab = category.name"
                        class="px-4 py-3 relative text-gray-600 transition-colors"
                        :class="{ 'text-green-600 font-bold': activeMenuTab === category.name }">
                        {{ category.name }}
                        <!-- Active line indicator underneath -->
                        <div v-if="activeMenuTab === category.name"
                            class="absolute bottom-0 left-0 w-full h-[3px] bg-green-500 rounded-t-md"></div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Menu List -->
        <div id="menu-section" class="bg-white pt-5 pb-10 min-h-[500px]">
            <div class="px-4 mb-4">
                <h3 class="text-[18px] font-bold text-gray-800">{{ activeMenuTab }}</h3>
            </div>
            <!-- Menu Grid -->
            <div class="px-4">
                <div v-if="filteredMenu.length > 0" class="animate-fade-in">
                    <product :selectionRole="filteredMenu"></product>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
                    <span class="text-4xl opacity-50 mb-2">🍽️</span>
                    <p class="text-[13px] font-medium">ไม่พบเมนูอาหารในหมวดหมู่ {{ activeMenuTab }}</p>
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
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
