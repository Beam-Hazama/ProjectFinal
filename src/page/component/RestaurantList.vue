<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRestaurant } from '@/stores/Restaurant';
import { useMenuStore } from '@/stores/menuStore';

// --- Initialization ---
const props = defineProps({
    building: String,
    floor: String,
    room: String,
    searchQuery: {
        type: String,
        default: ''
    },
    categoryFilter: {
        type: Array,
        default: () => []
    },
    openOnly: {
        type: Boolean,
        default: false
    },
    promoOnly: {
        type: Boolean,
        default: false
    }
});

const restaurantStore = useRestaurant();
const menuStore = useMenuStore();
const router = useRouter();

// --- State ---
const now = ref(new Date());
let timer = null;

// --- Lifecycle ---
onMounted(() => {
    // Update current time every second for shop status calculation
    timer = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

// --- Computed ---
const sortedRestaurants = computed(() => {
    if (!restaurantStore.list) return [];

    let list = [...restaurantStore.list];

    // Filter by Category if specified (Multi-select)
    if (props.categoryFilter && props.categoryFilter.length > 0) {
        list = list.filter(shop => {
            return menuStore.list.some(m => 
                m.Restaurant === shop.Name && 
                props.categoryFilter.includes(m.Category)
            );
        });
    }

    // Filter by Open Only
    if (props.openOnly) {
        list = list.filter(shop => !isShopClosed(shop));
    }

    // Filter by Promotions Only
    if (props.promoOnly) {
        list = list.filter(shop => {
            // Check if this restaurant has any menu items with a PromoPrice > 0
            return menuStore.list.some(m => 
                m.Restaurant === shop.Name && 
                m.PromoPrice && Number(m.PromoPrice) > 0
            );
        });
    }

    // Sort restaurants: open ones first, closed ones last
    return list.sort((a, b) => {
        const aClosed = isShopClosed(a);
        const bClosed = isShopClosed(b);

        if (aClosed && !bClosed) return 1;
        if (!aClosed && bClosed) return -1;
        return 0;
    });
});

// --- Methods ---
/**
 * Checks if a shop is currently closed based on its status or opening hours.
 */
const isShopClosed = (shop) => {
    // If status is set manually to close
    if (shop.ManualStatus === 'manual') return shop.Status === 'close';
    
    // Check if time information is missing
    if (!shop.OpenTime || !shop.CloseTime) return true;

    try {
        const currentTime = now.value.getHours() * 60 + now.value.getMinutes();
        const [openH, openM] = shop.OpenTime.split(':').map(Number);
        const [closeH, closeM] = shop.CloseTime.split(':').map(Number);
        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;

        // Handle case where closing time is on the next day (e.g., 10:00 - 02:00)
        if (closeMin > openMin) {
            return !(currentTime >= openMin && currentTime < closeMin);
        } else {
            return !(currentTime >= openMin || currentTime < closeMin);
        }
    } catch (e) {
        return true;
    }
};

const goToRestaurantMenu = (restaurantName) => {
    router.push(`/user/restaurant/${encodeURIComponent(restaurantName)}/${props.building}/${props.floor}/${props.room}`);
};

/**
 * Derives unique food categories for a restaurant from the global menu list.
 */
const getRestaurantCategories = (restaurantName) => {
    if (!menuStore.list) return '';
    const categories = menuStore.list
        .filter(m => m.Restaurant === restaurantName && m.Category)
        .map(m => m.Category);
    
    const unique = [...new Set(categories)];
    if (unique.length === 0) return '';
    
    // Show up to 3 categories then truncate
    const displayList = unique.slice(0, 3);
    return displayList.join(', ') + (unique.length > 3 ? '...' : '');
};
</script>

<template>
    <section class="flex flex-col gap-3 pb-4 px-2">
        <button v-for="shop in sortedRestaurants" :key="shop.id"
            class="w-full flex text-left bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden transition-all duration-300 h-[100px]"
            :class="isShopClosed(shop) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'"
            :disabled="isShopClosed(shop)" @click="!isShopClosed(shop) && goToRestaurantMenu(shop.Name)">

          
            <!-- Shop Image and Status Overlay -->
            <figure
                class="w-[100px] h-full flex-shrink-0 relative bg-gray-100 flex items-center justify-center border-r border-gray-50">
                
                <img v-if="shop.ImageUrl" :src="shop.ImageUrl" class="object-cover w-full h-full"
                    :class="{ 'grayscale': isShopClosed(shop) }" />
                <div v-else class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>

                <div v-if="isShopClosed(shop)" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span
                        class="text-white font-bold text-[10px] bg-gray-800/80 px-2 py-1 rounded-md shadow-sm">ร้านปิด</span>
                </div>
            </figure>

          
            <!-- Restaurant Information Section -->
            <div class="py-2 px-3 w-full flex flex-col justify-center flex-grow bg-white min-w-0">
                <h3 class="font-bold text-[15px] text-gray-800 leading-tight truncate w-full mb-0.5">{{ shop.Name }}</h3>
                
                <!-- Food Categories Display -->
                <p v-if="getRestaurantCategories(shop.Name)" 
                   class="text-[11px] text-gray-500 font-medium truncate mb-1 opacity-80">
                    {{ getRestaurantCategories(shop.Name) }}
                </p>
                
                <!-- ระยะทางใต้ชื่อร้าน -->
                <div v-if="shop.Distance" class="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ shop.Distance }} กม.</span>
                </div>


            </div>

        </button>
    </section>
</template>
