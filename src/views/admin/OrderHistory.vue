<script setup>
import { formatTimestamp } from '@/utils/format';
import { ref, computed, onMounted, watch } from 'vue';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import { useOrderlistStore } from '@/stores/shared/orderList';
import { getStatusColor } from '@/utils/orderHelpers';

const orderStore = useOrderlistStore();

const selectedOrder = ref(null);
const showModal = ref(false);

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const selectedMonth = ref('all');
const selectedYear = ref(currentYear);

const allMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const availableYears = computed(() => {
  if (!orderStore.sortedOrders || orderStore.sortedOrders.length === 0) {
    return [currentYear];
  }
  const yearSet = new Set();
  orderStore.sortedOrders.forEach(order => {
    const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
    if (d && !isNaN(d)) yearSet.add(d.getFullYear());
  });
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
  return sortedYears.length > 0 ? sortedYears : [currentYear];
});

const availableMonths = computed(() => {
  const options = [{ value: 'all', label: 'ทั้งหมด' }];
  if (!orderStore.sortedOrders || orderStore.sortedOrders.length === 0) {
    return options;
  }
  const monthSet = new Set();
  orderStore.sortedOrders.forEach(order => {
    const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
    if (d && !isNaN(d) && d.getFullYear() === selectedYear.value) {
      monthSet.add(d.getMonth());
    }
  });
  const sortedMonths = Array.from(monthSet).sort((a, b) => a - b).map(m => ({ value: m, label: allMonths[m] }));
  return options.concat(sortedMonths);
});

watch(availableYears, (newYears) => {
  if (newYears.length > 0 && !newYears.includes(selectedYear.value)) {
    selectedYear.value = newYears[0];
  }
});

watch(availableMonths, (newMonths) => {
  if (newMonths.length > 0 && !newMonths.find(m => m.value === selectedMonth.value)) {
    selectedMonth.value = 'all';
  }
});

const historyOrders = computed(() => {
    const orders = orderStore.sortedOrders || [];
    return orders.filter(order => {
        const d = order.CreatedAt?.toDate?.() || new Date(order.CreatedAt);
        if (!d || isNaN(d)) return false;
        
        const yearMatch = d.getFullYear() === selectedYear.value;
        const monthMatch = selectedMonth.value === 'all' || d.getMonth() === selectedMonth.value;
        
        return yearMatch && monthMatch;
    });
});

onMounted(() => {
    orderStore.loadAllOrders();
});

const openModal = (order) => {
    selectedOrder.value = order;
    showModal.value = true;
};
</script>

<template>
    <LayoutAdmin>
        <div class="p-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
                <div class="text-3xl font-bold text-slate-700">Order History</div>
                
                <!-- Filters -->
                <div class="flex items-center gap-3">
                    <select class="select select-bordered select-sm md:select-md min-w-[140px]" v-model="selectedMonth">
                        <option v-for="m in availableMonths" :key="m.value" :value="m.value">
                            {{ m.label }}
                        </option>
                    </select>

                    <select class="select select-bordered select-sm md:select-md" v-model="selectedYear">
                        <option v-for="y in availableYears" :key="y" :value="y">
                            {{ y }}
                        </option>
                    </select>
                </div>
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
                                <th class="py-4 text-center">Total Price</th>
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
                                                                                        <!-- แปลงค่า 1000 to 1,000 -->
                                <td class="text-center font-bold text-emerald-600">{{ (order.OrderStatus === 'cancelled' ? 0 : order.TotalPrice)?.toLocaleString() }} ฿</td>                   
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
                                    <tr v-for="(menu, index) in selectedOrder.Menu" :key="index" class="border-b border-slate-100 last:border-none">
                                        <td>
                                            <div class="font-bold text-slate-700">{{ menu.MenuName }}</div>
                                            <div class="text-xs text-slate-400">{{ menu.RestaurantName}}</div>
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
                            <span class="text-2xl font-bold text-emerald-600">{{ (selectedOrder.OrderStatus === 'cancelled' ? 0 : selectedOrder.TotalPrice)?.toLocaleString() }} ฿</span>
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
