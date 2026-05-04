<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/shared/menu';
import { useRestaurant } from '@/stores/shared/restaurant';
import { useCartStore } from '@/stores/customer/cart';
import MenuList from '@/components/shared/BlockMenu.vue';
import { checkShopClosed } from '@/utils/shopStatus';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const restaurantStore = useRestaurant();
const cartStore = useCartStore();

const room = route.params.room || '-';

const isLoading = ref(true);
const now = ref(new Date());
let timer;

function isShopClosed(restaurantName) {
    if (restaurantStore.list.length === 0) return false; // Default to open while loading to prevent flash of empty
    const shop = restaurantStore.list.find(r => r.Name === restaurantName);
    return checkShopClosed(shop, now.value);
}

const promotionMenus = computed(() => {
    return (menuStore.list || []).filter(item => {
        const hasPromo = item.PromoPrice && Number(item.PromoPrice) > 0;
        const isMenuOpen = item.Status === 'open';
        return hasPromo && isMenuOpen && !isShopClosed(item.Restaurant);
    });
});

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            menuStore.loadMenu(),
            restaurantStore.loadListRestaurant()
        ]);
        cartStore.loadCart(room);
        // Give it a small delay to ensure listeners are active and data is flowing
        setTimeout(() => {
            isLoading.value = false;
        }, 500);

        timer = setInterval(() => {
            now.value = new Date();
        }, 60000);
    } catch (error) {
        console.error("Error loading promotions data:", error);
        isLoading.value = false;
    }
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

const goBack = () => {
    router.push(`/user/${room}`);
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans flex flex-col">

        <div class="bg-white px-4 py-3 sticky top-0 z-40 border-b border-gray-100 shadow-sm flex items-center gap-3">
            <button @click="goBack" class="p-2 -ml-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <h1 class="font-bold text-gray-800 text-lg flex-1 text-center pr-8">โปรโมชั่นทั้งหมด</h1>
        </div>


        <div class="flex-1 px-4 pt-6">
            <div v-if="isLoading" class="flex flex-col items-center justify-center pt-20 text-gray-400">
                <span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
                <p class="text-sm font-medium animate-pulse">กำลังโหลดโปรโมชั่น...</p>
            </div>

            <div v-else-if="promotionMenus.length === 0"
                class="flex flex-col items-center justify-center pt-20 text-gray-400">
                <span class="text-4xl opacity-50 mb-2">🏷️</span>
                <p class="text-[13px] font-medium">ยังไม่มีรายการโปรโมชั่นในขณะนี้</p>
            </div>

            <div v-else class="animate-fade-in">
                <MenuList :selectionRole="promotionMenus" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
