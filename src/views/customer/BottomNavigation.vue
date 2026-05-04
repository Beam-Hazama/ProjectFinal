<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useCartStore } from '@/stores/customer/cart';

const route = useRoute();
const cartStore = useCartStore();

const room = computed(() => cartStore.room);

const menuItems = computed(() => [
    {
        name: 'UserWithParams',
        label: 'หน้าแรก',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#3b82f6" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`,
        path: `/user/${room.value}`
    },
    {
        name: 'Cart',
        label: 'ตะกร้า',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>`,
        path: `/user/cart/${room.value}`,
        badge: computed(() => cartStore.totalQuantity > 0 ? cartStore.totalQuantity : null)
    },
    {
        name: 'Status',
        label: 'สถานะ',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
        path: `/user/status/${room.value}`
    },
    {
        name: 'user-bill',
        label: 'บิล',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`,
        path: `/user/bill/${room.value}`
    }
]);

const isActive = (name) => {
    return route.name === name;
};
</script>

<template>
    
    <div
        class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[55] pb-safe">
        <div class="flex justify-around items-center h-16">
            <RouterLink v-for="item in menuItems" :key="item.name" :to="item.path"
                class="relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200 group"
                :class="isActive(item.name) ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'">
                <div class="relative">
                    <span v-html="item.icon"></span>
                    <span v-if="item.badge && item.badge.value > 0"
                        class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                        {{ item.badge.value }}
                    </span>
                </div>
                <span class="text-[10px] font-medium mt-0.5">{{ item.label }}</span>

                <span v-if="isActive(item.name)" class="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-b-full"></span>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>

