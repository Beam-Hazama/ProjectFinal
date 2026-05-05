<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useNow } from '@/composables/useNow';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerData } from '@/composables/useCustomerData';
import MenuList from '@/components/shared/BlockMenu.vue';

const route = useRoute();
const router = useRouter();
const room = route.params.room || '-';
const { menuStore, restaurantStore, cartStore } = useCustomerData(room);

const isLoading = ref(true);
const { now } = useNow();

const promotionMenus = computed(() => {
    return (menuStore.list || []).filter(item => {
        const hasPromo = item.PromoPrice && Number(item.PromoPrice) > 0;
        const isMenuOpen = item.Status === 'open';
        return hasPromo && isMenuOpen && !restaurantStore.isShopClosedByName(item.Restaurant, now.value);
    });
});

onMounted(async () => {
    isLoading.value = true;
    try {
        // Wait for stores to be ready if needed, or just proceed with UI delay
        // Since useCustomerData handles the load calls, we just manage the loading state here
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error("Error loading promotions data:", error);
        isLoading.value = false;
    }
});

onUnmounted(() => {
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
            <div v-else-if="promotionMenus.length === 0" class="flex flex-col items-center justify-center pt-20 text-gray-400">
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
