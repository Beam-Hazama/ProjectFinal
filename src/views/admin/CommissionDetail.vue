<script setup>
import { formatTimestamp } from '@/utils/format';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import { useOrderlistStore } from '@/stores/shared/orderList';
import { getStatusColor } from '@/utils/orderHelpers';

const orderStore = useOrderlistStore();
const route = useRoute();
const router = useRouter();

const selectedOrder = ref(null);
const showModal = ref(false);

const restaurantName = computed(() => route.params.name);
const selectedMonth = computed(() => Number(route.query.month));
const selectedYear = computed(() => Number(route.query.year));

const months = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const historyOrders = computed(() => {
    let orders = orderStore.sortedOrders || [];
    
    // Filter by restaurant
    if (restaurantName.value) {
        orders = orders.filter(order => 
            order.Menu && order.Menu.some(m => (m.RestaurantName || m.Restaurant) === restaurantName.value)
        );
    }
    
    // Filter by month/year if provided
    if (!isNaN(selectedMonth.value) && !isNaN(selectedYear.value)) {
        const start = new Date(selectedYear.value, selectedMonth.value, 1);
        const end = new Date(selectedYear.value, selectedMonth.value + 1, 0, 23, 59, 59, 999);
        
        orders = orders.filter(order => {
            const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
            return d >= start && d <= end;
        });
    }

    // Map each order to calculate restaurant-specific total
    return orders.map(order => {
        let restTotal = 0;
        if (order.OrderStatus !== 'cancelled') {
            order.Menu.forEach(m => {
                if ((m.RestaurantName || m.Restaurant) === restaurantName.value && m.MenuStatus !== 'cancelled') {
                    restTotal += (Number(m.Price || 0) * Number(m.Quantity || 1));
                }
            });
        }
        return {
            ...order,
            RestaurantTotal: restTotal
        };
    });
});

onMounted(() => {
    orderStore.loadAllOrders();
});

const openModal = (order) => {
    selectedOrder.value = order;
    showModal.value = true;
};

const goBack = () => {
    router.go(-1);
};
</script>

<template>
    <LayoutAdmin>
        <div class="p-6">
            <div class="flex justify-between items-start mb-7">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">Order History</h1>
                    <p class="text-slate-500 mt-1">
                        {{ restaurantName }} 
                        <span v-if="!isNaN(selectedMonth) && !isNaN(selectedYear)">
                            ({{ months[selectedMonth] }} {{ selectedYear }})
                        </span>
                    </p>
                </div>
                <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200 w-28 rounded-xl font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th class="py-4 pl-6 text-left">Order Number</th>
                                <th class="py-4 text-center">Room</th>
                                <th class="py-4 text-center">Status</th>
                                <th class="py-4 text-center">Date</th>
                                <th class="py-4 text-right pr-6">Revenue</th>
                                <th class="py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-600">
                            <tr v-for="order in historyOrders" :key="order.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td class="pl-6 font-bold text-indigo-600">#{{ order.OrderNumber }}</td>
                                <td class="py-4 text-center font-medium text-slate-700">
                                    <span class="font-bold text-indigo-600">{{ order.RoomNumber }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="badge gap-2 font-semibold" :class="getStatusColor(order.OrderStatus)">
                                        {{ order.OrderStatus?.toUpperCase()}}
                                    </span>
                                </td>
                                <td class="text-center text-sm whitespace-nowrap">{{ formatTimestamp(order.CreatedAt) }}</td>
                                <td class="text-right font-bold text-emerald-600 pr-6">{{ order.RestaurantTotal?.toLocaleString() }} ฿</td>                   
                                <td class="text-center">
                                    <button @click="openModal(order)" class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Details
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="historyOrders.length === 0">
                                <td colspan="6" class="text-center py-10 text-slate-400">
                                    No orders found for this month.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showModal }">
                <div class="modal-box relative">
                    <button @click="showModal = false" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
                    <h3 class="font-bold text-lg mb-4 text-indigo-600"> Order Details #{{ selectedOrder?.OrderNumber }} </h3>
                    <div v-if="selectedOrder" class="space-y-4">
                        <div class="flex justify-between items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span>Room: <span class="font-bold text-slate-700">{{ selectedOrder.RoomNumber }}</span></span>
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
                                    <tr v-for="(menu, index) in selectedOrder.Menu.filter(m => (m.RestaurantName || m.Restaurant) === restaurantName)" :key="index" class="border-b border-slate-100 last:border-none">
                                        <td>
                                            <div class="font-bold text-slate-700">{{ menu.MenuName }}</div>
                                            <div class="text-xs" :class="(menu.RestaurantName || menu.Restaurant) === restaurantName ? 'text-indigo-500 font-semibold' : 'text-slate-400'">
                                                {{ menu.RestaurantName || menu.Restaurant }}
                                            </div>
                                            <div v-if="menu.Note" class="text-xs text-orange-500 italic mt-0.5 whitespace-pre-wrap">Note: {{ menu.Note }}</div>
                                        </td>
                                        <td class="text-center font-medium">{{menu.Quantity}} </td>
                                        <td class="text-right font-medium">{{ menu.Price?.toLocaleString() }} ฿</td>
                                        <td class="text-center">
                                            <span class="badge badge-xs gap-1" :class="{
                                                'badge-info': menu.MenuStatus === 'pending',
                                                'bg-orange-500 text-white border-none': menu.MenuStatus === 'cooking',
                                                'badge-success text-white': menu.MenuStatus === 'dispatched',
                                                'badge-error text-white bg-red-500': menu.MenuStatus === 'cancelled'
                                            }">
                                                {{ menu.MenuStatus }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex justify-between items-end border-t border-slate-200 pt-4 mt-4">
                            <div class="flex items-center gap-2">
                                <span class="text-slate-500">Total Amount</span>
                                <span class="badge" :class="getStatusColor(selectedOrder?.OrderStatus)">{{ selectedOrder?.OrderStatus?.toUpperCase() }}</span>
                            </div>
                            <span class="text-xl font-bold text-emerald-600">{{ selectedOrder.RestaurantTotal?.toLocaleString() }} ฿</span>
                        </div>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button @click="showModal = false">close</button>
                </form>
            </div>
        </div>
    </LayoutAdmin>
</template>
