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

import ProductList from '@/page/component/blockmenu.vue';

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

const activeMenuTab = ref('เมนูทั้งหมด');


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

    items = items.filter(item => item.Restaurant === restaurantName);

    if (activeMenuTab.value !== 'เมนูทั้งหมด' && activeMenuTab.value !== 'โปรโมชั่น' && activeMenuTab.value !== 'รีวิว') {
        items = items.filter(item =>
            (item.Category && item.Category === activeMenuTab.value) ||
            (item.role && (Array.isArray(item.role) ? item.role.includes(activeMenuTab.value) : item.role === activeMenuTab.value)) ||
            (item.Name && item.Name.includes(activeMenuTab.value))
        );
    }

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


        <div class="relative w-full h-[220px]"
            :class="{ 'bg-red-800': posterStore.activePosters.length === 0 && !currentRestaurant?.PosterUrl }">

            <div v-if="posterStore.activePosters.length > 0" class="w-full h-full overflow-hidden relative"
                @mouseenter="stopCarousel" @mouseleave="startCarousel">


                <div class="flex transition-transform duration-500 ease-out h-full w-full"
                    :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                    <div v-for="poster in posterStore.activePosters" :key="poster.id"
                        class="w-full flex-shrink-0 h-full relative group">
                        <img :src="poster.ImageUrl" class="object-cover w-full h-full" alt="Poster" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                </div>


                <div v-if="posterStore.activePosters.length > 1"
                    class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity z-10">
                    <button @click="prevSlide"
                        class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❮</button>
                    <button @click="nextSlide"
                        class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❯</button>
                </div>


                <div v-if="posterStore.activePosters.length > 1"
                    class="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 z-10">
                    <button v-for="(_, index) in posterStore.activePosters" :key="'dot-' + index"
                        @click="goToSlide(index)"
                        :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentSlide === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80']">
                    </button>
                </div>
            </div>


            <div v-else class="w-full h-full">
                <img v-if="currentRestaurant?.PosterUrl" :src="currentRestaurant.PosterUrl"
                    class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>


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


        <div class="relative z-10 px-2 -mt-10 mb-2">
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

            </div>
        </div>


        <div class="sticky top-0 z-30 bg-white border-b border-gray-100 mt-2 shadow-sm">
            <div class="flex items-center">

                <div class="px-3 py-3 border-r border-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>

                <div class="px-3 py-3 border-r border-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>

                <div class="flex-grow overflow-x-auto no-scrollbar flex text-[14px] font-medium whitespace-nowrap">

                    <button @click="activeMenuTab = 'เมนูทั้งหมด'"
                        class="px-4 py-3 relative text-gray-600 transition-colors"
                        :class="{ 'text-blue-600 font-bold': activeMenuTab === 'เมนูทั้งหมด' }">
                        เมนูทั้งหมด
                        <div v-if="activeMenuTab === 'เมนูทั้งหมด'"
                            class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md"></div>
                    </button>


                    <button v-for="category in categoryStore.list" :key="category.id"
                        @click="activeMenuTab = category.name"
                        class="px-4 py-3 relative text-gray-600 transition-colors"
                        :class="{ 'text-blue-600 font-bold': activeMenuTab === category.name }">
                        {{ category.name }}

                        <div v-if="activeMenuTab === category.name"
                            class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md"></div>
                    </button>
                </div>
            </div>
        </div>


        <div id="menu-section" class="bg-white pt-5 pb-10 min-h-[500px]">
            <div class="px-4 mb-4">
                <h3 class="text-[18px] font-bold text-gray-800">{{ activeMenuTab }}</h3>
            </div>

            <div class="px-4">
                <div v-if="filteredMenu.length > 0" class="animate-fade-in">
                    <ProductList :selectionRole="filteredMenu" />
                </div>

                <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
                    <span class="text-4xl opacity-50 mb-2">🍽️</span>
                    <p class="text-[13px] font-medium">ไม่พบเมนูอาหารในหมวดหมู่ {{ activeMenuTab }}</p>
                </div>
            </div>
        </div>



        <div class="fixed bottom-6 right-6 z-50 animate-fade-in group">
            <button @click="router.push(`/user/cart/${building}/${floor}/${room}`)"
                class="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:bg-blue-700 hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span v-if="cartStore.summaryQuantity > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {{ cartStore.summaryQuantity }}
                </span>
            </button>
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
