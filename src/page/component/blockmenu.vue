<script setup>
import { ref, onMounted } from 'vue'
import MenuOrderModal from './modalmenu.vue'
import { useRestaurant } from '@/stores/Restaurant'

const RestaurantStore = useRestaurant()
const selectedProduct = ref(null)
const showModal = ref(false)

onMounted(() => {
  RestaurantStore.loadListRestaurant()
})

const isShopClosed = (restaurantName) => {
  const shop = RestaurantStore.list.find(r => r.Name === restaurantName)
  return shop?.Status === 'close'
}

const openModal = (product) => {
  if (product.Status === 'open' && !isShopClosed(product.Restaurant)) {
    selectedProduct.value = product
    showModal.value = true
  }
}

defineProps({
  selectionRole: Array
})
</script>

<template>
  <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    <button v-for="(product, index) in selectionRole" :key="product.id"
      class="flex flex-col text-left bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300"
      :class="(product.Status !== 'open' || isShopClosed(product.Restaurant)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'"
      :disabled="product.Status !== 'open' || isShopClosed(product.Restaurant)" @click="openModal(product)">

      <!-- Top Image (Half-height) -->
      <figure class="w-full aspect-square relative bg-gray-100 p-0.5">


        <div class="w-full h-full rounded-t-lg overflow-hidden relative">
          <img v-if="product.ImageUrl" :src="product.ImageUrl" class="object-cover w-full h-full"
            :class="{ 'grayscale': product.Status !== 'open' || isShopClosed(product.Restaurant) }" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div v-if="isShopClosed(product.Restaurant)"
            class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white font-bold text-[10px] bg-gray-800/80 px-2 py-1 rounded-md shadow-sm">ร้านปิด</span>
          </div>

          <div v-else-if="product.Status !== 'open'"
            class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span class="text-white font-bold text-[10px] bg-red-500/90 px-2 py-1 rounded-md shadow-sm">หมด</span>
          </div>
        </div>
      </figure>

      <!-- Bottom Details -->
      <div class="px-2.5 py-2 w-full flex flex-col justify-between flex-grow">
        <h3 class="font-bold text-[13px] text-gray-800 leading-tight line-clamp-2 h-[2.5em] mb-1">{{ product.Name }}
        </h3>
        <div class="flex justify-between items-end mt-auto">
          <p class="font-bold text-[14px] text-gray-800">฿{{ product.Price }}</p>
          <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path
                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </div>
        </div>
      </div>

    </button>
  </section>

  <MenuOrderModal v-if="selectedProduct" :show="showModal" :product="selectedProduct" @close="showModal = false" />
</template>