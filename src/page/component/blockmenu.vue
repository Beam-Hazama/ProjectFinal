<script setup>
  import { ref } from 'vue'
  import MenuOrderModal from './modalmenu.vue'
  
  const selectedProduct = ref(null)
  const showModal = ref(false)
  
  const openModal = (product) => {
    if (product.Status === 'open') {
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
      <button
        v-for="product in selectionRole"
        :key="product.id"
        class="card m-1 bg-base-100 shadow-xl cursor-pointer"
        @click="openModal(product)"
      >
        <figure class="w-full h-20">
          <img :src="product.ImageUrl" class="object-cover w-full h-full" />
        </figure>
        <div class="card-body">
          <p class="card-title text-xs">{{ product.Name }}</p>
        </div>
      </button>
    </section>
  
    <MenuOrderModal
      v-if="selectedProduct"
      :show="showModal"
      :product="selectedProduct"
      @close="showModal = false"
    />
  </template>
  