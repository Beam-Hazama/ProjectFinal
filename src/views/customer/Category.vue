<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerData } from '@/composables/useCustomerData';
import MenuList from '@/components/shared/BlockMenu.vue';

const route = useRoute();
const router = useRouter();
const categoryName = computed(() => route.params.category || '');
const { menuStore } = useCustomerData();

const filteredMenus = computed(() => {
    if (!categoryName.value) return [];
    return menuStore.list.filter(item => item.Category === categoryName.value);
});

const goBack = () => {
    router.push(`/user/all-categories/${route.params.qrId}`);
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
            <h1 class="font-bold text-gray-800 text-lg flex-1 text-center pr-8">{{ categoryName }}</h1>
        </div>
        <div class="flex-1 px-4 pt-5 pb-10">
            <div v-if="filteredMenus.length === 0"
                class="flex flex-col items-center justify-center pt-20 text-gray-400">
                <span class="text-4xl opacity-50 mb-2">🍽️</span>
                <p class="text-[13px] font-medium">ไม่มีเมนูในหมวดหมู่ "{{ categoryName }}" ณ ตอนนี้</p>
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
