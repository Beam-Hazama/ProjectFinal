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
  <section class="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
    <button v-for="product in selectionRole" :key="product.id"
      class="card m-1 bg-base-100 shadow-xl relative overflow-hidden transition-all duration-300"
      :class="(product.Status !== 'open' || isShopClosed(product.Restaurant)) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'"
      :disabled="product.Status !== 'open' || isShopClosed(product.Restaurant)" @click="openModal(product)">
      <figure class="w-full h-24 relative">
        <img :src="product.ImageUrl" class="object-cover w-full h-full"
          :class="{ 'grayscale': product.Status !== 'open' || isShopClosed(product.Restaurant) }" />

        <!-- Case 1: Restaurant Closed -->
        <div v-if="isShopClosed(product.Restaurant)"
          class="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span class="text-white font-bold text-xs bg-gray-600/90 px-2 py-1 rounded-full shadow-sm">ร้านปิด</span>
        </div>

        <!-- Case 2: Menu Out of Stock (Only show if shop is OPEN) -->
        <div v-else-if="product.Status !== 'open'"
          class="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span class="text-white font-bold text-xs bg-red-500/90 px-2 py-1 rounded-full shadow-sm">สินค้าหมด</span>
        </div>

        <div v-if="product.Status === 'open' && !isShopClosed(product.Restaurant)"
          class="absolute bottom-1 right-1 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 shadow-sm">
          ฿{{ product.Price }}
        </div>
      </figure>
      <div class="p-2 space-y-1 relative">
        <h3 class="font-bold text-xs text-slate-700 leading-tight line-clamp-2 h-8 flex items-center">{{ product.Name }}
        </h3>
      </div>
    </button>
  </section>

  <MenuOrderModal v-if="selectedProduct" :show="showModal" :product="selectedProduct" @close="showModal = false" />
</template>