<script setup>
import { formatTimestamp } from '@/utils/format';
import { onMounted, computed, reactive } from 'vue';
import { useOrderlistStore } from '@/stores/shared/orderList';
import { useMenuStore } from '@/stores/shared/menu';
import { useCartStore } from '@/stores/customer/cart';
import { filterRecentOrders, sortOrdersByDate } from '@/utils/orderHelpers';
import BottomNavigation from '@/views/customer/BottomNavigation.vue';

const orderListStore = useOrderlistStore();
const menuStore = useMenuStore();

const cartStore = useCartStore();
const room = computed(() => cartStore.room);

// Temporary state for ratings before submission
const reviewsState = reactive({});

const displayLocation = computed(() => {
    return `ห้อง ${room.value}`;
});

const userOrders = computed(() => {
    const recent = filterRecentOrders(orderListStore.list, room.value, 12);
    return sortOrdersByDate(recent, 'desc'); 
});

const myOrders = computed(() => {
    return userOrders.value.map(order => {
        const receivedItems = (order.Menu || []).filter(item => 
            ['received', 'dispatched', 'cooking', 'pending'].includes(item.MenuStatus) || !item.MenuStatus
        );
        const subtotal = receivedItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
        const grandTotal = Math.max(0, subtotal - (order.discount || 0));
        const totalQuantity = receivedItems.reduce((sum, item) => sum + item.Quantity, 0);

        // Initialize review state if not exists
        if (!reviewsState[order.id]) {
            reviewsState[order.id] = {
                rating: 0,
                feedback: ''
            };
        }

        return {
            ...order,
            receivedItems,
            subtotal,
            grandTotal,
            totalQuantity
        };
    }).filter(order => order.receivedItems.length > 0);
});


onMounted(async () => {
    if (room.value && room.value !== '-') {
        await orderListStore.loadOrderUser(room.value);
    }
    menuStore.loadMenu();
});

const submitReview = async (orderId) => {
    const review = reviewsState[orderId];
    if (!review.rating) return;
    
    try {
        await orderListStore.submitOrderReview(orderId, review.rating, review.feedback);
    } catch (e) {
        alert('ไม่สามารถส่งคำติชมได้');
    }
};

</script>

<template>
    <div class="w-full min-h-screen p-4 space-y-5 bg-gradient-to-br from-blue-50 to-purple-50 font-sans pb-24">        
        <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
                <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md uppercase">Bill</h1>
                    <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ displayLocation }}
                    </p>
                </div>
            </div>
        </div>        
        <div v-if="myOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="font-bold text-sm">ไม่มีข้อมูลใบเสร็จสำหรับห้องนี้</p>
        </div>
        <div v-else class="space-y-8 pb-10">
            <div v-for="order in myOrders" :key="order.id" class="bg-white/90 backdrop-blur-md shadow-2xl border border-white/60 rounded-[32px] overflow-hidden">                
                <div class="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <div class="flex justify-between items-center">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Order Receipt</span>
                            <span class="text-xl font-black text-blue-700 font-mono">#{{ order.OrderNumber }}</span>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-400 font-black uppercase mb-1 flex items-center justify-end gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ formatTimestamp(order.CreatedAt) }}
                            </div>
                        </div>
                    </div>
                </div>                
                <div class="p-5 space-y-4">
                    <div v-for="(item, index) in order.receivedItems" :key="index" class="flex justify-between items-center group">
                        <div class="flex items-center gap-4">
                            <div class="w-9 h-9 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 font-black text-sm shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                x{{ item.Quantity }}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 text-sm tracking-tight leading-tight">{{ item.MenuName }}</span>
                                <span class="text-[10px] text-slate-400 font-medium">฿{{ item.Price.toLocaleString() }} ต่อหน่วย</span>
                            </div>
                        </div>
                        <div class="text-right font-black text-slate-700">฿{{ (item.Price * item.Quantity).toLocaleString() }}</div>
                    </div>
                </div>                
                <div class="p-5 bg-gradient-to-b from-slate-50/50 to-white/50 border-t border-dashed border-slate-200">
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-xs text-slate-500 font-bold">
                            <span>ค่าอาหาร</span>
                            <span>฿{{ order.subtotal.toLocaleString() }}</span>
                        </div>
                        <div class="flex justify-between text-xs text-slate-500 font-bold">
                            <span>จำนวนรวม</span>
                            <span>{{ order.totalQuantity }} รายการ</span>
                        </div>
                        <div v-if="order.discount" class="flex justify-between text-xs text-red-500 font-bold">
                            <span>ส่วนลดพิเศษ</span>
                            <span>-฿{{ order.discount.toLocaleString() }}</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-end border-t border-indigo-100 pt-4">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                        </div>
                        <div class="text-right">
                            <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-700 to-indigo-600 font-mono">
                                ฿{{ order.grandTotal.toLocaleString() }}
                            </span>
                        </div>
                    </div>
                </div>
                <!-- Rating Section -->
                <div class="p-5 border-t border-slate-50 bg-slate-50/30">
                    <div v-if="order.Rating" class="flex flex-col items-center py-2 animate-fade-in">
                        <div class="flex gap-1 mb-1">
                            <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="i <= order.Rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <p v-if="order.Feedback" class="text-xs text-slate-500 italic text-center px-4">"{{ order.Feedback }}"</p>
                        <span class="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">ขอบคุณสำหรับคำติชมครับ!</span>
                    </div>
                    <div v-else class="flex flex-col gap-3">
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">คุณพอใจกับอาหารมื้อนี้ไหม?</span>
                            <div class="flex gap-2">
                                <button v-for="i in 5" :key="i" 
                                    @click="reviewsState[order.id].rating = i"
                                    class="transition-all transform hover:scale-110 active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" 
                                        :class="(reviewsState[order.id]?.rating || 0) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'" 
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div v-if="reviewsState[order.id]?.rating" class="flex flex-col gap-2 animate-fade-in">
                            <textarea 
                                v-model="reviewsState[order.id].feedback" 
                                placeholder="อยากติชมอะไรเพิ่มเติมไหมครับ?"
                                class="w-full text-xs p-3 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all resize-none h-20"
                            ></textarea>
                            <button 
                                @click="submitReview(order.id)"
                                class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
                            >
                                ส่งคำติชม
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BottomNavigation />
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
