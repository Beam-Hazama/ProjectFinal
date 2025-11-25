<script setup>
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore()

const checkToAddProduct = (product) =>{
  if(product.status === 'open'){
    cartStore.addToCart(product)
  }
}

defineProps({
  selectionRole: Array,
  //addToCart: Function,
});
</script>
<template>
  <section class="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
    <button
      v-for="product in selectionRole"
      class="card m-1 bg-base-100 shadow-xl transition duration-200 hover:bg-base-200 active:scale-95 cursor-pointer"
      @click="checkToAddProduct(product)"
    >
      <figure class="overflow-hidden w-full h-20 relative">
        <img
          class="object-cover w-full h-full"
          :src="product.ImageUrl"
        />
        <!--<div v-if="product.status === 'close' || product.remainQuantity === 0" class=" absolute inset-0 flex items-center justify-center ">
            <span class="text-6xl text-red-500 border-5 border-red-500 ">close</span>
          </div>-->
      </figure>
      <div class="card-body">
        <p class="card-title text-xs ">{{ product.Name }}</p>
        <!--<div class="card-action flex justify-between">
          <div class="text-xs">{{ product.Price }}</div>
          <div v-if="product.remainQuantity>0" :class="product.remainQuantity<10? 'text-amber-400':'text-green-600'">คงเหลือ {{ product.remainQuantity }}</div>
          <div v-else class="text-red-600">คงเหลือ {{ product.remainQuantity }}</div>
        </div>-->
      </div>
    </button>
  </section>
</template>
