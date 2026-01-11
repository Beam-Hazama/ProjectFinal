<script setup>
import restaurant from './restaurant.vue';
import { onMounted, computed, ref } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';
import { useAccountStore } from '@/stores/account';

const orderStore = useOderlistStore();
const accountStore = useAccountStore();
const loading = ref(true);

onMounted(async () => {
    // Ensure we have user data for filtering
    if (!accountStore.isLoggedIn) {
        await accountStore.checkAuthState();
    }
    // Load all orders (admin view or specific restaurant view logic might reside in store, 
    // but for now we filter client side as requested)
    await orderStore.loadOrderinadmin();
    loading.value = false;
});

// Filter orders to only show those having items from this restaurant
const restaurantOrders = computed(() => {
    if (!accountStore.user || !accountStore.user.restaurant) return [];

    const myRestaurant = accountStore.user.restaurant;

    return orderStore.sortedOrders.map(order => {
        // Filter menu items for this restaurant
        const myItems = (order.Menu || []).filter(item => item.Restaurant === myRestaurant);

        // Calculate total for only these items
        const myTotal = myItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);

        // Compute local status based on items
        let localStatus = 'pending';
        if (myItems.length > 0) {
            const allServed = myItems.every(i => i.itemStatus === 'served');
            const anyCooking = myItems.some(i => i.itemStatus === 'cooking');
            const anyServed = myItems.some(i => i.itemStatus === 'served');

            if (allServed) localStatus = 'served';
            else if (anyCooking || anyServed) localStatus = 'cooking';
            else localStatus = 'pending';
        }

        return {
            ...order,
            displayItems: myItems,
            displayTotal: myTotal,
            localStatus: localStatus
        };
    }).filter(order => order.displayItems.length > 0 && order.localStatus !== 'served');
});

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'badge-warning text-white';
        case 'cooking': return 'badge-info text-white';
        case 'served': return 'badge-success text-white';
        case 'cancelled': return 'badge-error text-white';
        default: return 'badge-ghost';
    }
};

const handleStatusChange = async (orderId, newStatus) => {
    if (confirm(`Are you sure you want to change status to ${newStatus.toUpperCase()}?`)) {
        const restaurantName = accountStore.user?.restaurant;
        if (restaurantName) {
            await orderStore.updateOrderStatus(orderId, newStatus, restaurantName);
        } else {
            alert("Restaurant name not found!");
        }
    } else {
        // Reset the select if cancelled (optional, but would require binding to local state which is tricky with v-for)
        // For now, simpler to just let it be or force update. 
        // Since we bind :value, it should revert on next tick if store didn't update.
        const order = restaurantOrders.value.find(o => o.id === orderId);
        if (order) {
            // Force UI refresh if needed, but Vue reactivity usually handles this when the prop doesn't change
        }
    }
};
</script>

<template>
    <restaurant>
        <div class="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Order List</h1>
                    <p class="text-sm text-slate-500 mt-1">จัดการออเดอร์สำหรับร้าน: {{ accountStore.user?.restaurant ||
                        'Loading...' }}</p>
                </div>

                <div class="flex gap-2">
                    <div class="stats shadow bg-white">
                        <div class="stat py-2 px-4">
                            <div class="stat-title text-xs">Pending</div>
                            <div class="stat-value text-amber-500 text-2xl">{{restaurantOrders.filter(o =>
                                o.localStatus === 'pending').length}}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
                <span class="loading loading-spinner loading-lg text-indigo-600"></span>
            </div>

            <div v-else-if="restaurantOrders.length === 0"
                class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div class="bg-indigo-50 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-700">No Orders Found</h3>
                <p class="text-slate-400 mt-1">ยังไม่มีรายการสั่งซื้อสำหรับร้านของคุณในขณะนี้</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="order in restaurantOrders" :key="order.id"
                    class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">

                    <!-- Header -->
                    <div class="bg-slate-50/80 p-4 border-b border-slate-100 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div
                                class="bg-white p-2 rounded-xl shadow-sm font-bold text-indigo-600 border border-indigo-50">
                                #{{ order.OrderNumber }}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                                <span v-if="order.building && order.room" class="font-bold text-slate-700">
                                    Building {{ order.building }} Floor {{ order.floor }} Room {{ order.room }}
                                </span>
                                <span v-else class="font-bold text-slate-700">{{ order.tableId || 'N/A' }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</div>
                            <span class="text-xs font-semibold text-slate-600">
                                {{ order.CreatedAt?.toDate().toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) }}
                            </span>
                        </div>
                    </div>

                    <!-- Body (Menu Items) -->
                    <div class="p-4 flex-grow space-y-3">
                        <div v-for="(item, index) in order.displayItems" :key="index" class="flex gap-3 items-start">
                            <div
                                class="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                <img v-if="item.ImageUrl" :src="item.ImageUrl" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <div class="flex justify-between items-start">
                                    <span class="font-bold text-slate-700 text-sm line-clamp-2">{{ item.Name }}</span>
                                    <span class="text-xs font-bold text-slate-500 whitespace-nowrap">x {{ item.Quantity
                                    }}</span>
                                </div>
                                <p v-if="item.note"
                                    class="text-xs text-amber-500 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded-md border border-amber-100">
                                    Note: {{ item.note }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-slate-400 uppercase">Total (My Items)</span>
                            <span class="font-bold text-lg text-indigo-600">{{ order.displayTotal.toLocaleString() }}
                                ฿</span>
                        </div>

                        <div class="flex gap-2 items-center justify-between">
                            <div class="flex items-center gap-2">
                                <form @submit.prevent>
                                    <select :value="order.localStatus"
                                        @change="handleStatusChange(order.id, $event.target.value)"
                                        class="select select-bordered select-sm w-full max-w-xs font-bold" :class="{
                                            'select-warning': order.localStatus === 'pending',
                                            'select-info': order.localStatus === 'cooking',
                                            'select-success': order.localStatus === 'served'
                                        }" :disabled="order.localStatus === 'served'">
                                        <option value="pending">🟡 รอ (Pending)</option>
                                        <option value="cooking">🔵 ทำอาหาร (Cooking)</option>
                                        <option value="served">🟢 จัดส่ง (Served)</option>
                                    </select>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </restaurant>
</template>