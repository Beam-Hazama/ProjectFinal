<script setup>
import { computed } from 'vue';
import { useRestaurantDashboardStore } from '@/stores/restaurant/dashboard';
import { formatTimestamp } from '@/utils/format';

const dashboardStore = useRestaurantDashboardStore();

const reviews = computed(() => dashboardStore.reviews);
const averageRating = computed(() => dashboardStore.averageRating);
const totalRatingsCount = computed(() => dashboardStore.totalRatingsCount);

const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-emerald-500';
    if (rating >= 3) return 'text-amber-500';
    return 'text-rose-500';
};
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <!-- Average Rating Card -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-full">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ความพึงพอใจของลูกค้า</span>
            
            <div class="flex items-baseline gap-1 mb-2">
                <span class="text-7xl font-black text-slate-800 tracking-tighter">{{ totalRatingsCount > 0 ? averageRating.toFixed(1) : '0.0' }}</span>
                <span class="text-2xl font-bold text-slate-300">/5.0</span>
            </div>

            <div class="flex gap-1.5 mb-6">
                <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-all duration-500" 
                    :class="i <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-slate-100'" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </div>

            <p class="text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-widest">จากทั้งหมด {{ totalRatingsCount }} รีวิว</p>
        </div>

        <!-- Recent Reviews List -->
        <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div class="p-6 border-b border-slate-50 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h3 class="font-black text-slate-800 tracking-tight uppercase">ความคิดเห็นล่าสุดจากลูกค้า</h3>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-4 no-scrollbar">
                <div v-if="reviews.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p class="font-bold text-sm">ยังไม่มีความคิดเห็นในขณะนี้</p>
                </div>
                <div v-for="review in reviews" :key="review.id" 
                    class="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 transition-colors">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div class="flex gap-0.5">
                                <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" 
                                    :class="i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">ห้อง {{ review.room }}</span>
                            <span class="text-[10px] font-bold text-slate-400">#{{ review.orderNumber }}</span>
                        </div>
                        <span class="text-[10px] font-bold text-slate-400">{{ formatTimestamp(review.date) }}</span>
                    </div>
                    <p class="text-sm text-slate-700 leading-relaxed font-medium">"{{ review.feedback }}"</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
</style>
