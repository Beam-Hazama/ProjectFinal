<script setup>
import { useRestaurant } from '@/stores/Restaurant'
import { useRouter } from 'vue-router'

const props = defineProps({
    building: String,
    floor: String,
    room: String,
    searchQuery: {
        type: String,
        default: ''
    }
})

const restaurantStore = useRestaurant()
const router = useRouter()

const isShopClosed = (shop) => {
    return shop.Status === 'close'
}

const goToRestaurantMenu = (restaurantName) => {
    router.push(`/user/restaurant/${encodeURIComponent(restaurantName)}/${props.building}/${props.floor}/${props.room}`)
}
</script>

<template>
    <section class="flex flex-col gap-3 pb-4 px-2">
        <button v-for="shop in restaurantStore.list" :key="shop.id"
            class="w-full flex text-left bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden transition-all duration-300 h-[100px]"
            :class="isShopClosed(shop) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'"
            :disabled="isShopClosed(shop)" @click="!isShopClosed(shop) && goToRestaurantMenu(shop.Name)">

            <!-- Left Image -->
            <figure
                class="w-[100px] h-full flex-shrink-0 relative bg-gray-100 flex items-center justify-center border-r border-gray-50">
                <!-- We can use a default image placeholder for shops if none exists -->
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

            <!-- Right Details -->
            <div class="py-2 px-3 w-full flex flex-col justify-center flex-grow bg-white min-w-0">
                <h3 class="font-bold text-[15px] text-gray-800 leading-tight truncate w-full mb-1">{{ shop.Name }}</h3>
                <p class="font-medium text-[12px] text-gray-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    เปิดรับออเดอร์
                </p>
            </div>

        </button>
    </section>
</template>
