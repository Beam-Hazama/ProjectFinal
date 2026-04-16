<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOderlistStore } from '@/stores/OrderList';
import { useMenuStore } from '@/stores/menuStore';

// --- Initialization ---
const route = useRoute();
const router = useRouter();
const orderListStore = useOderlistStore();
const menuStore = useMenuStore();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';
const tableId = `${building}-${floor}-${room}`;

// --- Computed ---
const displayLocation = computed(() => {
    return `ห้อง ${room} ชั้น ${floor} ตึก ${building}`;
});

const userOrders = computed(() => {
    return orderListStore.list
        .filter(order => String(order.tableId).trim() === String(tableId).trim())
        .sort((a, b) => (b.CreatedAt?.seconds || 0) - (a.CreatedAt?.seconds || 0)); // Newest first
});

const myOrders = computed(() => {
    return userOrders.value.map(order => {
        const receivedItems = (order.Menu || []).filter(item => 
            ['received', 'dispatched', 'cooking', 'pending', 'waiting'].includes(item.itemStatus) || !item.itemStatus
        );
        const subtotal = receivedItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
        const grandTotal = Math.max(0, subtotal - (order.discount || 0));

        return {
            ...order,
            receivedItems,
            subtotal,
            grandTotal
        };
    }).filter(order => order.receivedItems.length > 0);
});

const totalAmount = computed(() => {
    return myOrders.value.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
});

// --- Lifecycle ---
onMounted(async () => {
    if (tableId) {
        await orderListStore.loadOrderUser(tableId);
    }
    menuStore.loadMenu();
});

// --- Methods ---

// Formatting
const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    try {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000 || timestamp);
        return date.toLocaleString('th-TH', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' น.';
    } catch (e) {
        return 'ไม่ทราบวันที่';
    }
};

const getMenuName = (id) => {
    const menu = menuStore.list.find(m => m.id === id);
    return menu ? menu.Name : 'เมนู (ไม่ทราบชื่อ)';
};
</script>

<template>
    <div class="w-full min-h-screen p-4 space-y-5 bg-slate-50 font-sans pb-24">
        
        <!-- Billing Header Section -->
        <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
                <div class="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-3xl font-black tracking-tight text-slate-800 uppercase">Bill</h1>
                    <p class="text-[10px] font-bold text-blue-500 tracking-widest uppercase mt-0.5">Payment Summary</p>
                </div>
            </div>
            <router-link :to="`/User/${building}/${floor}/${room}`"
                class="btn btn-sm btn-circle bg-white border-slate-200 text-slate-400 hover:text-blue-600 shadow-sm transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                    stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </router-link>
        </div>

        <!-- Location Badge Section -->
        <div class="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100/50">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span class="text-xs font-bold text-blue-700 tracking-tight">{{ displayLocation }}</span>
        </div>

        <!-- Receipt History Section -->
        <div v-if="myOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="font-bold text-sm">ไม่มีข้อมูลใบเสร็จสำหรับห้องนี้</p>
        </div>

        <div v-else class="space-y-8 pb-10">
            <div v-for="order in myOrders" :key="order.id"
                class="bg-white/90 backdrop-blur-md shadow-2xl border border-white/60 rounded-[32px] overflow-hidden">

                <!-- Receipt Header Decor -->
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
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ formatTimestamp(order.CreatedAt) }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Receipt Body: Order Items -->
                <div class="p-5 space-y-4">
                    <div v-for="(item, index) in order.receivedItems" :key="index"
                        class="flex justify-between items-center group">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-9 h-9 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 font-black text-sm shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                x{{ item.Quantity }}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 text-sm tracking-tight leading-tight">{{ item.Name || getMenuName(item.id || item.menuId) }}</span>
                                <span class="text-[10px] text-slate-400 font-medium">฿{{ item.Price.toLocaleString() }} ต่อหน่วย</span>
                            </div>
                        </div>
                        <div class="text-right font-black text-slate-700">฿{{ (item.Price * item.Quantity).toLocaleString() }}</div>
                    </div>
                </div>

                <!-- Receipt Footer: Totals -->
                <div class="p-5 bg-gradient-to-b from-slate-50/50 to-white/50 border-t border-dashed border-slate-200">
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-xs text-slate-500 font-bold">
                            <span>ยอดรวมออเดอร์</span>
                            <span>฿{{ order.subtotal.toLocaleString() }}</span>
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
            </div>

            <!-- Grand Summary Layer -->
            <div class="mt-8 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                
                <div class="relative z-10">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Grand Total Summary</span>
                        <div class="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                            <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            <span class="text-[10px] font-black text-blue-400 uppercase tracking-wider">Ready to Pay</span>
                        </div>
                    </div>
                    
                    <div class="flex items-baseline gap-2">
                        <span class="text-[14px] font-bold text-slate-500">฿</span>
                        <span class="text-6xl font-black font-mono tracking-tighter">{{ totalAmount.toLocaleString() }}</span>
                    </div>
                    
                    <p class="text-[11px] text-slate-500 font-bold mt-4 leading-relaxed">
                        ยอดรวมชำระทั้งหมดสำหรับตำแหน่ง <span class="text-white">"{{ displayLocation }}"</span> <br/>
                        กรุณาตรวจสอบรายการอาหารก่อนทำการชำระที่เคาน์เตอร์
                    </p>
                </div>
            </div>
        </div>
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