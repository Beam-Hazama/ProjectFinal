<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '@/stores/categoryStore';

// --- Initialization ---
const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';

// --- Lifecycle ---
onMounted(() => {
    if (categoryStore.list.length === 0) {
        categoryStore.loadCategories();
    }
});

// --- Methods ---
const goBack = () => {
    router.push(`/User/${building}/${floor}/${room}`);
};

const goToCategory = (catName) => {
    router.push(`/user/category/${catName}/${building}/${floor}/${room}`);
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24 font-sans flex flex-col">
        <!-- Header Section -->
        <div class="bg-white px-4 py-3 sticky top-0 z-40 border-b border-gray-100 shadow-sm flex items-center gap-3">
            <button @click="goBack" class="p-2 -ml-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <h1 class="font-bold text-gray-800 text-lg flex-1 text-center pr-8">หมวดหมู่ทั้งหมด</h1>
        </div>

        <!-- Category Grid Section -->
        <div class="flex-1 px-4 pt-6">
            <div v-if="categoryStore.list.length === 0" class="flex flex-col items-center justify-center pt-20 text-gray-400">
                <div class="loading loading-spinner loading-md mb-2"></div>
                <p class="text-xs">กำลังโหลดหมวดหมู่...</p>
            </div>

            <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-4 animate-fade-in">
                <div v-for="cat in categoryStore.list" :key="cat.id" 
                    @click="goToCategory(cat.name)"
                    class="flex flex-col items-center cursor-pointer group">
                    <div class="w-full aspect-square rounded-2xl bg-white p-1 shadow-sm border border-slate-100 overflow-hidden relative group-hover:shadow-md transition-all duration-300">
                        <img :src="cat.ImageUrl" :alt="cat.name" class="w-full h-full object-cover rounded-xl" />
                        <div class="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <span class="mt-2 text-[11px] font-bold text-gray-700 text-center leading-tight group-hover:text-blue-600 transition-colors">
                        {{ cat.name }}
                    </span>
                </div>
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
