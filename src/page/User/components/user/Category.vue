<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/menuStore';
import { useRestaurant } from '@/stores/Restaurant';
import MenuList from '@/page/component/blockmenu.vue';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const restaurantStore = useRestaurant();

const safeDecode = (val, fallback) => {
    if (!val) return fallback;
    try {
        return decodeURIComponent(val);
    } catch (e) {
        return val;
    }
};

const building = computed(() => safeDecode(route.params.building, '-'));
const floor = computed(() => safeDecode(route.params.floor, '-'));
const room = computed(() => safeDecode(route.params.room, '-'));
const categoryId = computed(() => safeDecode(route.params.category, ''));

function isShopClosed(restaurantName) {
    const shop = restaurantStore.list.find(r => r.Name === restaurantName);
    if (!shop) return true;
    if (shop.Status === 'close') return true;
    if (shop.Status === 'open') return false;

    if (!shop.OpenTime || !shop.CloseTime) return true;

    try {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDayName = now.toLocaleString('en-US', { weekday: 'long' });

        if (shop.OpenDays && !shop.OpenDays.includes(currentDayName)) {
            return true;
        }

        const [openH, openM] = shop.OpenTime.split(':').map(Number);
        const [closeH, closeM] = shop.CloseTime.split(':').map(Number);
        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;

        if (closeMin > openMin) {
            return !(currentTime >= openMin && currentTime < closeMin);
        } else {
            return !(currentTime >= openMin || currentTime < closeMin);
        }
    } catch (e) {
        return true;
    }
}

const filteredMenus = computed(() => {
    if (!categoryId.value) return [];

    return menuStore.list.filter(item => {
        const matchesCategory = (item.Category && item.Category === categoryId.value) ||
            (item.role && (Array.isArray(item.role) ? item.role.includes(categoryId.value) : item.role === categoryId.value)) ||
            (item.Name && item.Name.includes(categoryId.value));

        return matchesCategory;
    });
});

onMounted(() => {
    if (menuStore.list.length === 0) {
        menuStore.loadMenu();
    }
    if (restaurantStore.list.length === 0) {
        restaurantStore.loadListRestaurant();
    }
});

const goBack = () => {
    router.push(`/User/${building.value}/${floor.value}/${room.value}`);
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 pb-24 font-sans flex flex-col">

        <div class="bg-white px-4 py-3 sticky top-0 z-40 border-b border-gray-100 shadow-sm flex items-center gap-3">
            <button @click="goBack" class="p-2 -ml-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <h1 class="font-bold text-gray-800 text-lg flex-1 text-center pr-8">{{ categoryId }}</h1>
        </div>


        <div class="flex-1 px-4 pt-5 pb-10">
            <div v-if="filteredMenus.length === 0"
                class="flex flex-col items-center justify-center pt-20 text-gray-400">
                <span class="text-4xl opacity-50 mb-2">🍽️</span>
                <p class="text-[13px] font-medium">ไม่มีเมนูในหมวดหมู่ "{{ categoryId }}" ณ ตอนนี้</p>
            </div>

            <div v-else>
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-[14px] font-bold text-gray-800">เมนูทั้งหมดในหมวดหมู่นี้</h3>
                </div>

                <MenuList :selectionRole="filteredMenus"></MenuList>
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
    }

    100% {
        opacity: 1;
    }
}
</style>
