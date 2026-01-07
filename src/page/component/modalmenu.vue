<script setup>
    import { ref, watch } from 'vue'
    import { useCartStore } from '@/stores/cartStore'
    
    const props = defineProps({
      show: Boolean,
      product: Object
    })
    
    const emit = defineEmits(['close'])
    
    const cartStore = useCartStore()
    
    const quantity = ref(1)
    const note = ref('')
    
    watch(
      () => props.product,
      (product) => {
        if (!product) return
    
        const cartItem = cartStore.getItemById(product.id)
    
        if (cartItem) {
          quantity.value = cartItem.Quantity
          note.value = cartItem.note || ''
        } else {
          quantity.value = 1
          note.value = ''
        }
      },
      { immediate: true }
    )
    
    const confirmAdd = () => {
      cartStore.addOrUpdateItem(props.product, quantity.value, note.value)
      emit('close')
    }
    </script>
    
    <template>
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <!-- Modal -->
        <div class="bg-white rounded-xl w-80 shadow-lg overflow-hidden">
    
          <!-- Image -->
          <img
            :src="product.ImageUrl"
            class="w-full h-40 object-cover"
          />
    
          <!-- Content -->
          <div class="p-4 space-y-3">
            <h2 class="text-lg font-bold">{{ product.Name }}</h2>
            <p class="text-sm text-gray-500">ราคา {{ product.Price }} บาท</p>
    
            <!-- Quantity -->
            <div class="flex items-center justify-between">
              <span>จำนวน</span>
              <div class="flex items-center gap-3">
                <button class="btn btn-sm" @click="quantity > 1 && quantity--">-</button>
                <span>{{ quantity }}</span>
                <button class="btn btn-sm" @click="quantity++">+</button>
              </div>
            </div>
    
            <!-- Note -->
            <textarea
              v-model="note"
              class="textarea textarea-bordered w-full"
              placeholder="หมายเหตุ"
            />
          </div>
    
          <!-- Actions -->
          <div class="flex border-t">
            <button
              class="w-1/2 py-3 text-gray-500 hover:bg-gray-100"
              @click="emit('close')"
            >
              ยกเลิก
            </button>
            <button
              class="w-1/2 py-3 bg-green-500 text-white hover:bg-green-600"
              @click="confirmAdd"
            >
              ยืนยัน
            </button>
          </div>
    
        </div>
      </div>
    </template>
    