<script setup>
import { onMounted, computed, ref } from 'vue';
import { useOrderlistStore } from '@/stores/orderlistStore';
import { useAccountStore } from '@/stores/accountStore';
import { useMenuStore } from '@/stores/menuStore';
import LayoutRestaurant from './restaurant.vue';

const orderStore = useOrderlistStore();
const accountStore = useAccountStore();
const menuStore = useMenuStore();

const loading = ref(true);
const selections = ref({});

onMounted(async () => {
    await accountStore.checkAuthState();
    await orderStore.loadOrderinadmin();
    loading.value = false;
});

const restaurantOrders = computed(() => {
    if (!accountStore.user || !accountStore.user.Restaurant) return [];

    const myRestaurant = accountStore.user.Restaurant;
    if (!orderStore.sortedOrders) return [];

    return orderStore.sortedOrders.map(order => {
        let dIdx = 0;
        const myItems = (order.Menu || []).filter(item => item.Restaurant === myRestaurant).map(item => ({
            ...item,
            uniqueKey: item.cartItemId || (item.id + '-' + dIdx++)
        }));
        
        const myTotal = myItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
        let localStatus = 'pending';
        
        if (myItems.length > 0) {
            const allServed = myItems.every(i => i.itemStatus === 'dispatched');
            const allCancelled = myItems.every(i => i.itemStatus === 'cancelled');

            const isFinished = myItems.every(i =>
                i.itemStatus === 'dispatched' ||
                i.itemStatus === 'received' ||
                i.itemStatus === 'cancelled'
            );

            const anyCooking = myItems.some(i => i.itemStatus === 'cooking');
            const anyServed = myItems.some(i => i.itemStatus === 'dispatched');

            if (allCancelled) localStatus = 'cancelled';
            else if (isFinished) localStatus = 'dispatched';
            else if (anyCooking || anyServed) localStatus = 'cooking';
            else localStatus = 'pending';
        }

        return {
            ...order,
            displayItems: myItems,
            displayTotal: myTotal,
            localStatus: localStatus
        };
    }).filter(order =>
        order.displayItems.length > 0 &&
        order.statusOrder !== 'cancelled' &&
        order.localStatus !== 'dispatched' &&
        order.localStatus !== 'cancelled'
    );
});

const toggleSelection = (orderId, itemId, type) => {
    if (!selections.value[orderId]) {
        selections.value[orderId] = {};
    }

    if (selections.value[orderId][itemId] === type) {
        delete selections.value[orderId][itemId];
    } else {
        selections.value[orderId][itemId] = type;
    }
};

const getSelectionType = (orderId, itemId) => {
    return selections.value[orderId]?.[itemId];
};

const hasSelections = (orderId) => {
    const orderSelections = selections.value[orderId];
    return orderSelections && Object.keys(orderSelections).length > 0;
};

const areAllItemsSelected = (order) => {
    const activeItems = order.displayItems.filter(i => i.itemStatus !== 'dispatched' && i.itemStatus !== 'cancelled');
    if (activeItems.length === 0) return false;

    const orderSelections = selections.value[order.id] || {};
    return activeItems.every(item => orderSelections[item.uniqueKey]);
};

const hasWaitingItems = (order) => {
    return order.displayItems.some(i => !i.itemStatus || i.itemStatus === 'waiting');
};

const saveChanges = async (order) => {
    try {
        const orderSelections = selections.value[order.id];
        if (!orderSelections || Object.keys(orderSelections).length === 0) return;

        const myRestaurant = accountStore.user?.Restaurant;
        if (!myRestaurant) return;

        const latestOrder = orderStore.list.find(o => o.id === order.id);
        if (!latestOrder) return;

        const itemUpdates = [];
        const menusToClose = new Set();
        let dIdx = 0;

        let menuIndex = 0;
        for (const item of latestOrder.Menu || []) {
            const currentItemIndex = menuIndex++;
            if (item.Restaurant !== myRestaurant) continue;

            const itemKey = item.cartItemId || (item.id + '-' + dIdx++);
            const action = orderSelections[itemKey];
            if (!action) continue;

            let newStatus = item.itemStatus;
            if (action === 'advance') {
                if (!item.itemStatus || item.itemStatus === 'waiting') {
                    newStatus = 'cooking';
                }
            } else if (action === 'cancel') {
                newStatus = 'cancelled';
                if (item.id) {
                    menusToClose.add(item.id);
                }
            }

            if (newStatus !== item.itemStatus) {
                itemUpdates.push({ itemId: item.cartItemId, itemIndex: currentItemIndex, newStatus });
            }
        }

        if (itemUpdates.length > 0) {
            await orderStore.updateMultipleItemsStatus(order.id, itemUpdates);
            
            for (const menuId of menusToClose) {
                try {
                    await menuStore.menuUpdate(menuId, { Status: 'close' });
                } catch (err) {
                    console.error("Error closing menu item automatically:", err);
                }
            }
        }

        selections.value[order.id] = {};
    } catch (error) {
        alert("Error updating items: " + error.message);
    }
};

const deliverOrder = async (order) => {
    if (!areOtherRestaurantsReady(order)) {
        alert("กรุณารอร้านอื่นดำเนินการให้เสร็จสิ้น (Please wait for other restaurants)");
        return;
    }

    try {
        const myRestaurant = accountStore.user?.Restaurant;
        if (!myRestaurant) return;

        await orderStore.updateOrderStatus(order.id, 'dispatched', myRestaurant);
    } catch (error) {
        alert("Error processing order: " + error.message);
    }
};

const areOtherRestaurantsReady = (order) => {
    const myRestaurant = accountStore.user?.Restaurant;
    if (!myRestaurant) return true;

    const otherItems = (order.Menu || []).filter(item => item.Restaurant !== myRestaurant);
    if (otherItems.length === 0) return true;

    const anyWaiting = otherItems.some(item => !item.itemStatus || item.itemStatus === 'waiting');
    return !anyWaiting;
};

const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '-';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'badge-info text-white';
        case 'cooking': return 'bg-orange-500 text-white border-none';
        case 'dispatched': return 'bg-amber-500 text-white border-none';
        case 'cancelled': return 'badge-error text-white';
        default: return 'badge-ghost';
    }
};

const getRowStatusColor = (status) => {
    switch (status) {
        case 'waiting': return 'badge-ghost text-slate-400';
        case 'pending': return 'badge-info text-white';
        case 'cooking': return 'bg-orange-500 text-white border-none';
        case 'dispatched': return 'bg-amber-500 text-white border-none';
        case 'cancelled': return 'badge-error text-white';
        default: return 'badge-ghost text-slate-500';
    }
};
</script>

<template>
    <LayoutRestaurant>
        <div class="p-6 font-sans">
            
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Order List</h1>

                </div>

            </div>

            <div v-if="restaurantOrders.length === 0"
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

                    <div class="bg-slate-50/80 p-4 border-b border-slate-100 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div
                                class="bg-white p-2 rounded-xl shadow-sm font-bold text-indigo-600 border border-indigo-50">
                                #{{ order.OrderNumber }}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Building / Floor / Room</span>
                                <span v-if="order.building && order.room" class="font-bold text-slate-700 text-sm">
                                    {{ order.building }} / {{ order.floor }} / {{ order.room }}
                                </span>
                                <span v-else class="font-bold text-slate-700">{{ order.roomId || 'N/A' }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</div>
                            <span class="text-xs font-semibold text-slate-600">
                                {{ formatTime(order.CreatedAt) }}
                            </span>
                        </div>
                    </div>

                    <div class="p-4 flex-grow space-y-4">
                        <div v-for="(item, index) in order.displayItems" :key="index"
                            class="flex flex-row gap-4 items-center border-b border-slate-50 last:border-0 pb-4 last:pb-0">

                            <div class="flex flex-col gap-2 flex-shrink-0"
                                v-if="!item.itemStatus || item.itemStatus === 'waiting'">

                                <label class="cursor-pointer flex items-center gap-1">
                                    <input type="checkbox" class="checkbox checkbox-success checkbox-xs"
                                        :checked="getSelectionType(order.id, item.uniqueKey) === 'advance'"
                                        @change="toggleSelection(order.id, item.uniqueKey, 'advance')" />
                                </label>

                                <label class="cursor-pointer flex items-center gap-1">
                                    <input type="checkbox" class="checkbox checkbox-error checkbox-xs"
                                        :checked="getSelectionType(order.id, item.uniqueKey) === 'cancel'"
                                        @change="toggleSelection(order.id, item.uniqueKey, 'cancel')" />
                                </label>
                            </div>

                            <div class="flex gap-3 flex-grow">
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
                                        <span class="font-bold text-slate-700 text-sm line-clamp-2" :class="{
                                            'text-emerald-600': getSelectionType(order.id, item.uniqueKey) === 'advance',
                                            'text-red-500 line-through': getSelectionType(order.id, item.uniqueKey) === 'cancel',
                                        }">{{ item.Name }}</span>
                                        <span class="text-xs font-bold text-slate-500 whitespace-nowrap">x {{
                                            item.Quantity
                                        }}</span>
                                    </div>
                                    <p v-if="item.note"
                                        class="text-xs text-amber-500 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded-md border border-amber-100">
                                        Note: {{ item.note }}
                                    </p>
                                    <div class="mt-1 flex gap-2 items-center">
                                        <div v-if="item.itemStatus && item.itemStatus !== 'waiting'"
                                            :class="getRowStatusColor(item.itemStatus)"
                                            class="badge badge-xs font-semibold px-2 py-2">
                                            {{ (item.itemStatus || 'waiting').toUpperCase() }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-slate-400 uppercase">Total</span>
                            <span class="font-bold text-lg text-indigo-600">{{ order.displayTotal.toLocaleString()
                            }}
                                ฿</span>
                        </div>

                        <div class="flex gap-2 items-center justify-end">
                            <button v-if="hasWaitingItems(order)" @click="saveChanges(order)"
                                class="btn btn-sm w-full bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-lg disabled:bg-slate-200 transition-all duration-300"
                                :disabled="!areAllItemsSelected(order)">
                                บันทึก
                            </button>
                            <div v-else class="w-full">
                                <button v-if="!areOtherRestaurantsReady(order)" disabled
                                    class="btn btn-sm w-full bg-slate-200 text-slate-500 border-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 animate-spin"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    รออีกร้าน
                                </button>
                                <button v-else @click="deliverOrder(order)"
                                    class="btn btn-sm w-full bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-md shadow-emerald-200 rounded-lg transition-all duration-300">
                                    จัดส่งออเดอร์
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutRestaurant>
</template>
