<script setup>
import { formatTimestamp } from '@/utils/format';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useOrderlistStore } from '@/stores/shared/orderlist';
import { useAccountStore } from '@/stores/auth';
import LayoutRestaurant from '@/views/restaurant/RestaurantLayout.vue';
import { computeLocalStatus, getStatusColor, sortOrdersByDate } from '@/utils/orderHelpers';

const orderStore = useOrderlistStore();
const accountStore = useAccountStore();

const selectedOrder = ref(null);
const showModal = ref(false);

onMounted(async () => {
    if (accountStore.user && accountStore.user.Restaurant) {
        await orderStore.loadAllOrders(accountStore.user.Restaurant);
    } else {
        await orderStore.loadAllOrders();
    }
});

onUnmounted(() => {
    orderStore.clearListener();
});

const historyOrders = computed(() => {
    if (!accountStore.user?.Restaurant) return [];
    if (!orderStore.sortedOrders) return [];
    const myRestaurant = accountStore.user.Restaurant;

    // 1. ดึงเฉพาะ items ของร้านนี้ + คำนวณสถานะรวม
    const mapped = orderStore.sortedOrders.map(order => {
        const myItems = (order.Menu || []).filter(item => item.Restaurant === myRestaurant);
        const myTotal = myItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
        return {
            ...order,
            displayItems: myItems,
            displayTotal: myTotal,
            localStatus: computeLocalStatus(myItems)
        };
    });

    // 2. กรองเฉพาะออเดอร์ที่จบแล้ว (completed/cancelled/dispatched)
    const finishedStatuses = ['completed', 'cancelled', 'dispatched'];
    const filtered = mapped.filter(order =>
        order.displayItems.length > 0 &&
        (finishedStatuses.includes(order.OrderStatus) ||
         finishedStatuses.includes(order.localStatus))
    );

    // 3. เรียงจากใหม่ไปเก่า
    return sortOrdersByDate(filtered, 'desc');
});

const openModal = (order) => {
    selectedOrder.value = order;
    showModal.value = true;
};

// Removed getStatusColor local helper
// Removed formatTimestampStore usage
</script>

<template>
    <LayoutRestaurant>
        <div class="p-6">
            <div class="flex justify-between items-start mb-7">
                <div class="text-3xl font-bold text-slate-700">Order History</div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                            <tr>
                                <th class="py-4 pl-6">ORDER NUMBER</th>
                                <th class="text-center">ROOM</th>
                                <th class="text-center">STATUS</th>
                                <th class="text-center">DATE</th>
                                <th class="text-center">TOTAL PRICE</th>
                                <th class="text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-600">
                            <tr v-for="order in historyOrders" :key="order.id"
                                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td class="pl-6 font-bold text-indigo-600">
                                    #{{ order.OrderNumber }}
                                </td>
                                <td class="text-center font-medium text-slate-700">
                                    <span class="font-bold">{{ order.Roomnumber || order.room }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="badge gap-2 font-semibold" :class="getStatusColor(order.localStatus)">
                                        {{ order.localStatus?.toUpperCase() || '-' }}
                                    </span>
                                </td>
                                <td class="text-center text-sm whitespace-nowrap">
                                    {{ formatTimestamp(order.CreatedAt) }}
                                </td>
                                <td class="text-center font-bold text-emerald-600">
                                    {{ order.displayTotal?.toLocaleString() }} ฿</td>
                                <td class="text-center">
                                    <button @click="openModal(order)" class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Details
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="historyOrders.length === 0">
                                <td colspan="8" class="text-center py-12">
                                    <div class="flex flex-col items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p class="text-slate-400 font-medium italic">ไม่มีประวัติรายการสั่งซื้อที่เสร็จสิ้น</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showModal }">
                <div class="modal-box relative">
                    <button @click="showModal = false" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
                    <h3 class="font-bold text-lg mb-4 text-indigo-600">
                        Order Details #{{ selectedOrder?.OrderNumber }}
                    </h3>
                    <div v-if="selectedOrder" class="space-y-4">
                        <div class="flex justify-between items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span v-if="selectedOrder.room" class="flex gap-2">
                                <span>Room: <span class="font-bold text-slate-700">{{ selectedOrder.Roomnumber || selectedOrder.room }}</span></span>
                            </span>
                            <span v-else>
                                Room: {{ selectedOrder.roomId }}
                            </span>
                            <span>Date: {{ formatTimestamp(selectedOrder.CreatedAt) }}</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="table w-full table-compact">
                                <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                                    <tr class="text-slate-500">
                                        <th>MENU ITEM</th>
                                        <th class="text-center">QTY</th>
                                        <th class="text-right">PRICE</th>
                                        <th class="text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in selectedOrder.displayItems" :key="index" class="border-b border-slate-100 last:border-none">
                                        <td>
                                            <div class="font-bold text-slate-700">{{ item.Name }}</div>
                                            <div class="text-xs text-slate-400">{{ item.Restaurant }}</div>
                                            <div v-if="item.note" class="text-xs text-orange-500 italic mt-0.5">Note: {{ item.note }}</div>
                                        </td>
                                        <td class="text-center font-medium">{{ item.quantity || item.Quantity || 1 }}
                                        </td>
                                        <td class="text-right font-medium">{{ item.Price?.toLocaleString() }} ฿</td>
                                        <td class="text-center">
                                            <span class="badge badge-xs gap-1" :class="{
                                                'badge-info': item.MenuStatus === 'pending',
                                                'bg-orange-500 text-white border-none': item.MenuStatus === 'cooking',
                                                'badge-success text-white': item.MenuStatus === 'dispatched',
                                                'badge-error text-white bg-red-500': item.MenuStatus === 'cancelled'
                                            }">
                                                {{ (item.MenuStatus === 'pending') ? 'cooking' : (item.MenuStatus || 'pending') }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex justify-between items-end border-t border-slate-200 pt-4 mt-4">
                            <div class="flex items-center gap-2">
                                <span class="text-slate-500">Total Amount</span>
                                <span class="badge" :class="getStatusColor(selectedOrder?.localStatus)">
                                    {{ selectedOrder?.localStatus?.toUpperCase() || '-' }}</span>
                            </div>
                            <span class="text-2xl font-bold text-emerald-600">
                                {{selectedOrder.displayTotal?.toLocaleString()}} ฿
                            </span>
                        </div>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button @click="showModal = false">close</button>
                </form>
            </div>
        </div>
    </LayoutRestaurant>
</template>
