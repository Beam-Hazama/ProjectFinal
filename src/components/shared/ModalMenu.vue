<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useNow } from '@/composables/useNow';
import { useCartStore } from '@/stores/customer/cart';
import { useRestaurant } from '@/stores/shared/restaurant';
import { checkShopClosed } from '@/utils/shopStatus';
import { getBasePrice, calculateOptionPrice, buildOptionsNote } from '@/utils/menuCalculator';
import { onUnmounted } from 'vue';

const props = defineProps({
  show: Boolean,
  menu: Object
});

const emit = defineEmits(['close']);
const cartStore = useCartStore();
const restaurantStore = useRestaurant();

const quantity = ref(1);
const note = ref('');
const selections = ref({});

const { now } = useNow();

onMounted(() => {
  if (restaurantStore.list.length === 0) {
    restaurantStore.loadListRestaurant();
  }
});

onUnmounted(() => {
});

const isShopClosed = computed(() => {
  if (!props.menu) return false;
  const shop = restaurantStore.list.find(r => r.Name === props.menu.Restaurant);
  return checkShopClosed(shop, now.value);
});

const isAvailable = computed(() => {
  return props.menu?.Status === 'open' && !isShopClosed.value;
});

watch(
  () => props.menu,
  (menu) => {
    if (!menu) return;
    const cartItem = cartStore.getItemById(menu.id);
    selections.value = {};
    if (menu.OptionGroups) {
      menu.OptionGroups.forEach((group, index) => {
        if (group.maxChoices > 1) {
          selections.value[index] = [];
        } else {
          selections.value[index] = null;
        }
      });
    }
    if (cartItem) {
      quantity.value = cartItem.Quantity;
      note.value = cartItem.baseNote || '';
    } else {
      quantity.value = 1;
      note.value = '';
    }
  },
  { immediate: true }
);

const isFormValid = computed(() => {
  if (!props.menu || !props.menu.OptionGroups) return true;
  for (let i = 0; i < props.menu.OptionGroups.length; i++) {
    const group = props.menu.OptionGroups[i];
    if (group.isRequired) {
      const sel = selections.value[i];
      if (group.maxChoices > 1) {
        if (!Array.isArray(sel) || sel.length === 0) return false;
      } else {
        if (!sel) return false;
      }
    }
  }
  return true;
});

const toggleRadio = (gIndex, choiceName) => {
  if (selections.value[gIndex] === choiceName) {
    selections.value[gIndex] = null;
  } else {
    selections.value[gIndex] = choiceName;
  }
};

const calculateTotalPrice = () => {
  if (!props.menu) return 0;
  const base = getBasePrice(props.menu);
  const extra = calculateOptionPrice(props.menu.OptionGroups, selections.value);
  return (base + extra) * quantity.value;
};

const confirmAdd = () => {
  if (!isFormValid.value || !isAvailable.value) return;

  const optionsNote = buildOptionsNote(props.menu.OptionGroups, selections.value);
  const userNote = note.value ? `หมายเหตุ: ${note.value}` : '';
  const finalNote = [optionsNote, userNote].filter(Boolean).join('\n');

  const unitPrice = getBasePrice(props.menu) + calculateOptionPrice(props.menu.OptionGroups, selections.value);
  
  cartStore.addOrUpdateItem(props.menu, quantity.value, finalNote, unitPrice);
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <transition name="slide-in">
      <div v-if="show" class="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
        <div class="absolute top-0 w-full z-10 flex items-center justify-between p-3">
          <button @click="emit('close')" class="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-sm active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-300">|</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 12h-4M6 12H2m10-10v4m0 14v-4m8 0a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar pb-36 bg-gray-50">
          <div class="w-full h-[280px] bg-gray-200 relative">
            <img v-if="menu.ImageUrl" :src="menu.ImageUrl" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="text-6xl">🍲</span>
            </div>
          </div>
          <div class="bg-white px-5 pt-4 pb-3 mt-4 border-b border-gray-100">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-[17px] font-bold text-gray-900 leading-tight w-2/3">{{ menu.Name }}</h2>
              <div class="flex flex-col items-end">
                <div v-if="menu.PromoPrice && Number(menu.PromoPrice) > 0" class="text-[18px] font-black text-red-500">
                  ฿{{ menu.PromoPrice }}
                </div>
                <div class="text-gray-900" :class="menu.PromoPrice && Number(menu.PromoPrice) > 0 ? 'text-[12px] line-through text-gray-400' : 'text-[16px] font-black'">
                  ฿{{ menu.Price }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="menu.OptionGroups && menu.OptionGroups.length > 0">
            <div v-for="(group, gIndex) in menu.OptionGroups" :key="'group-' + gIndex" class="bg-white px-5 py-4 border-b border-gray-100 mt-2">
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
                <div v-if="group.isRequired" class="bg-gray-100 text-gray-700 text-[12px] px-2 py-0.5 rounded-md font-medium">
                  บังคับเลือก
                </div>
              </div>
              <div class="space-y-4">
                <label v-for="(choice, cIndex) in group.choices" :key="'choice-' + gIndex + '-' + cIndex" class="flex items-center justify-between cursor-pointer group">
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
          <div class="bg-white px-5 py-4 mt-2 mb-8 border-b border-gray-100">
            <h3 class="font-bold text-gray-800 text-[15px] mb-3">รายละเอียดเพิ่มเติม</h3>
            <textarea v-model="note" class="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400 resize-none h-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
          </div>
        </div>
        <div class="absolute bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-4 pb-safe rounded-t-3xl z-20 flex flex-col items-center">
          <div class="flex items-center justify-center gap-6 py-4">
            <button class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium active:scale-95 transition-all focus:outline-none disabled:opacity-30 disabled:active:scale-100"
              @click="quantity > 1 && quantity--" :disabled="quantity <= 1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span class="w-4 text-center font-bold text-lg text-gray-800">{{ quantity }}</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium active:scale-95 transition-all focus:outline-none"
              @click="quantity++">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button class="w-full rounded-xl py-3.5 px-4 font-bold transition-all flex justify-between items-center mb-4 shadow-md"
            :class="isFormValid && isAvailable ? 'bg-blue-600 text-white active:scale-[0.98]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            :disabled="!isFormValid || !isAvailable" @click="confirmAdd">
            <span v-if="!isAvailable">{{ isShopClosed ? 'ร้านปิดอยู่' : 'สินค้าหมด' }}</span>
            <span v-else>เพิ่มไปยังตะกร้า</span>
            <span>฿{{ calculateTotalPrice() }}</span>
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

  scrollbar-width: none;

}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
</style>
