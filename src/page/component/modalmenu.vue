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

// State to securely map choices by group index
const selections = ref({}) // { [gIndex]: string | string[] }

watch(
  () => props.product,
  (product) => {
    if (!product) return

    const cartItem = cartStore.getItemById(product.id)
    selections.value = {}

    if (cartItem && cartItem.selections) {
      // Recover options if the cart already tracking them
      // This is complex to recover perfectly from 'note' text, typically carts store option IDs.
      // For simplicity based on current impl, we'll reset selections if changing product, or just use what cart has.
    }

    if (product.OptionGroups) {
      product.OptionGroups.forEach((g, i) => {
        if (g.maxChoices > 1) {
          selections.value[i] = []
        } else {
          selections.value[i] = null
        }
      })
    }

    if (cartItem) {
      quantity.value = cartItem.Quantity
      // Cart items would ideally store their selections structure, 
      // but currently the Note is what is stored. Let's keep note as the base.
      note.value = cartItem.baseNote || ''
      // If we are strictly following previous logic, 'note' was overwritten. 
      // For now we just reset custom notes or leave it.
    } else {
      quantity.value = 1
      note.value = ''
    }
  },
  { immediate: true }
)

const confirmAdd = () => {
  let finalNote = note.value ? `หมายเหตุ: ${note.value}` : ''
  let optionsNoteArr = []

  if (props.product && props.product.OptionGroups) {
    props.product.OptionGroups.forEach((g, i) => {
      const sel = selections.value[i]
      if (g.maxChoices > 1 && Array.isArray(sel) && sel.length > 0) {
        optionsNoteArr.push(`${g.name}: ${sel.join(', ')}`)
      } else if (g.maxChoices === 1 && sel) {
        optionsNoteArr.push(`${g.name}: ${sel}`)
      }
    })
  }

  if (optionsNoteArr.length > 0) {
    const combinedOptions = optionsNoteArr.join(' | ')
    finalNote = finalNote ? `${combinedOptions} \n${finalNote}` : combinedOptions
  }

  // Passing the Note which includes option selections
  cartStore.addOrUpdateItem(props.product, quantity.value, finalNote)
  emit('close')
}

// Helper to show accurate math to user on button
const totalPrice = () => {
  if (!props.product) return 0
  let base = props.product.Price
  let extra = 0

  if (props.product.OptionGroups) {
    props.product.OptionGroups.forEach((g, i) => {
      const sel = selections.value[i]
      if (g.maxChoices > 1 && Array.isArray(sel)) {
        sel.forEach(name => {
          const choice = g.choices.find(c => c.name === name)
          if (choice) extra += (Number(choice.price) || 0)
        })
      } else if (g.maxChoices === 1 && sel) {
        const choice = g.choices.find(c => c.name === sel)
        if (choice) extra += (Number(choice.price) || 0)
      }
    })
  }

  return (base + extra) * quantity.value
}
</script>

<template>
  <Teleport to="body">
    <transition name="slide-in">
      <div v-if="show" class="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">

        
        <div class="absolute top-0 w-full z-10 flex items-center justify-between p-3">
          <button @click="emit('close')"
            class="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-sm active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
            <span class="text-gray-300">|</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M22 12h-4M6 12H2m10-10v4m0 14v-4m8 0a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
          </div>
        </div>

        
        <div class="flex-1 overflow-y-auto no-scrollbar pb-36 bg-gray-50">
        
          <div class="w-full h-[280px] bg-gray-200 relative">
            <img v-if="product.ImageUrl" :src="product.ImageUrl" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="text-6xl">🍲</span>
            </div>

            <!-- Overlapping Mock Restaurant Details -->
          </div>

          <div class="bg-white px-5 pt-4 pb-3 mt-4 border-b border-gray-100">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-[17px] font-bold text-gray-900 leading-tight w-2/3">{{ product.Name }}</h2>
              <div class="text-[16px] font-black text-gray-900">฿{{ product.Price }}</div>
            </div>
          </div>

          <!-- Dynamic Option Groups -->
          <div v-if="product.OptionGroups && product.OptionGroups.length > 0">
            <div v-for="(group, gIndex) in product.OptionGroups" :key="'group-' + gIndex"
              class="bg-white px-5 py-4 border-b border-gray-100 mt-2">
              <div class="mb-3 flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-gray-800 text-[15px]">
                    {{ group.name }}
                    <span v-if="group.isRequired" class="text-red-500 ml-1">*</span>
                  </h3>
                  <p class="text-[12px] text-gray-400">
                    เลือกได้สูงสุด {{ group.maxChoices }} ข้อ
                  </p>
                </div>
                <div v-if="group.isRequired"
                  class="bg-gray-100 text-gray-700 text-[12px] px-2 py-0.5 rounded-md font-medium">
                  บังคับเลือก
                </div>
              </div>
              <div class="space-y-4">
                <label v-for="(choice, cIndex) in group.choices" :key="'choice-' + gIndex + '-' + cIndex"
                  class="flex items-center justify-between cursor-pointer group">
                  <div class="flex items-center gap-3">

                    <input v-if="group.maxChoices > 1" type="checkbox" :value="choice.name" v-model="selections[gIndex]"
                      :disabled="selections[gIndex].length >= group.maxChoices && !selections[gIndex].includes(choice.name)"
                      class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 bg-white checked:bg-blue-600 transition-all cursor-pointer disabled:opacity-50">

                    <input v-else type="radio" :checked="selections[gIndex] === choice.name" :name="'grp-' + gIndex"
                      @click="toggleRadio(gIndex, choice.name)"
                      class="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 bg-white transition-all cursor-pointer">

                    <span class="text-gray-700 text-[14px] font-medium">{{ choice.name }}</span>
                  </div>
                  <span v-if="choice.price > 0" class="text-[14px] text-gray-600">+฿{{ choice.price }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Notes section -->
          <div class="bg-white px-5 py-4 mt-2 mb-8 border-b border-gray-100">
            <h3 class="font-bold text-gray-800 text-[15px] mb-3">รายละเอียดเพิ่มเติม</h3>
            <textarea v-model="note"
              class="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400 resize-none h-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              placeholder="เช่น ไม่ใส่ผัก" />
          </div>

        </div>

        <!-- Sticky Bottom Bar -->
        <div
          class="absolute bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-4 pb-safe rounded-t-3xl z-20 flex flex-col items-center">
          <!-- Quantity Stepper Centered above button -->
          <div class="flex items-center justify-center gap-6 py-4">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium active:scale-95 transition-all focus:outline-none disabled:opacity-30 disabled:active:scale-100"
              @click="quantity > 1 && quantity--" :disabled="quantity <= 1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
              </svg>
            </button>

            <span class="w-4 text-center font-bold text-lg text-gray-800">{{ quantity }}</span>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium active:scale-95 transition-all focus:outline-none"
              @click="quantity++">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <!-- Add to cart button -->
          <button
            class="w-full bg-blue-600 text-white rounded-xl py-3.5 px-4 font-bold active:scale-[0.98] transition-all flex justify-between items-center mb-4 shadow-md"
            @click="confirmAdd">
            <span>เพิ่มไปยังตะกร้า</span>
            <span>฿{{ totalPrice() }}</span>
          </button>
        </div>

      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
</style>