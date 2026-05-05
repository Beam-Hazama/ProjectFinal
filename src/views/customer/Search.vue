<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerData } from '@/composables/useCustomerData';

import MenuList from '@/components/shared/BlockMenu.vue';

const route = useRoute();
const router = useRouter();
const room = route.params.room;
const { menuStore, cartStore } = useCustomerData(room);
const searchQuery = ref('');

const vFocus = {
    mounted(el) {
        el.focus();
    }
};

const filteredMenus = computed(() => {
    if (!searchQuery.value) return [];

    return menuStore.list.filter(item =>
        item.Name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.Restaurant?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});


const goBack = () => {
    router.push(`/user/${room}`);
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 pb-24 font-sans flex flex-col">
        <div class="bg-white px-4 py-3 sticky top-0 z-40 border-b border-gray-100 shadow-sm flex items-center gap-3">
            <button @click="goBack" class="p-2 -ml-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <div class="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <input type="text" placeholder="ค้นหาร้าน หรือ ชื่อเมนู" v-focus
                    class="w-full bg-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                    v-model="searchQuery" />
                <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="flex-1 px-4 pt-5 pb-10">
            <div v-if="!searchQuery"
                class="flex flex-col items-center justify-center pt-20 text-gray-400 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-30" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="text-sm font-medium">พิมพ์เพื่อค้นหาเมนู หรือ ร้านอาหาร</p>
            </div>
            <div v-else-if="filteredMenus.length === 0" class="flex flex-col items-center justify-center pt-20 text-gray-400 animate-fade-in">
                <span class="text-4xl opacity-50 mb-2">🍽️</span>
                <p class="text-[13px] font-medium">ไม่พบผลการค้นหาสำหรับ "{{ searchQuery }}"</p>
            </div>
            <div v-else class="animate-fade-in">
                <div class="mb-4">
                    <h3 class="text-[14px] font-bold text-gray-800">ผลการค้นหา ({{ filteredMenus.length }})</h3>
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
