<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { usePosterStore } from '@/stores/posterStore';

const posterStore = usePosterStore();
const currentSlide = ref(0);
let carouselTimeout = null;

const startCarousel = () => {
  stopCarousel();
  if (posterStore.activePosters?.length > 1) {
    const currentPoster = posterStore.activePosters[currentSlide.value];
    const durationMs = (currentPoster?.DisplayDuration || currentPoster?.displayDuration || 5) * 1000;

    carouselTimeout = setTimeout(() => {
      nextSlide();
    }, durationMs);
  }
};

const stopCarousel = () => {
  if (carouselTimeout) {
    clearTimeout(carouselTimeout);
    carouselTimeout = null;
  }
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % posterStore.activePosters.length;
  startCarousel();
};

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0
    ? posterStore.activePosters.length - 1
    : currentSlide.value - 1;
  startCarousel();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  startCarousel();
};

onMounted(() => {
  if (posterStore.activePosters?.length > 0) {
    startCarousel();
  }
});

onUnmounted(() => {
  stopCarousel();
});

watch(() => posterStore.activePosters, (newVal) => {
  if (newVal && newVal.length > 0 && !carouselTimeout) {
    startCarousel();
  }
}, { deep: true });
</script>

<template>
  <div class="px-4 mt-2">
    <div v-if="posterStore.activePosters.length > 0" class="relative w-full rounded-xl shadow-sm overflow-hidden"
      @mouseenter="stopCarousel" @mouseleave="startCarousel">

      <!-- Slides -->
      <div class="flex transition-transform duration-500 ease-out h-36"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="poster in posterStore.activePosters" :key="poster.id"
          class="w-full flex-shrink-0 h-full relative group">
          <img :src="poster.ImageUrl" class="object-cover w-full h-full" alt="Poster" />
        </div>
      </div>

      <!-- Navigation Arrows -->
      <div v-if="posterStore.activePosters.length > 1"
        class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
        <button @click="prevSlide"
          class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❮</button>
        <button @click="nextSlide"
          class="btn btn-circle btn-sm bg-black/30 border-none text-white backdrop-blur-sm">❯</button>
      </div>

      <!-- Indicators -->
      <div v-if="posterStore.activePosters.length > 1"
        class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
        <button v-for="(_, index) in posterStore.activePosters" :key="'dot-' + index" @click="goToSlide(index)"
          :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentSlide === index ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80']">
        </button>
      </div>
    </div>
  </div>
</template>
