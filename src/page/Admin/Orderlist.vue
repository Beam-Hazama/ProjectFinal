<script setup>
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { onMounted, ref } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const orderStore = useOderlistStore();
const selectedOrder = ref(null);
const showModal = ref(false);

onMounted(() => {
  orderStore.loadOrder();
});



const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
};

const openModal = (order) => {
  selectedOrder.value = order;
  showModal.value = true;
};
 
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'badge-info text-white';
    case 'cooking': return 'bg-orange-500 text-white border-none';
    case 'dispatched':
    case 'completed': return 'badge-success text-white';
    case 'cancelled': return 'badge-error text-white';
    case 'returned': return 'badge-error text-white bg-orange-500';
    default: return 'badge-ghost text-slate-500';
  }
}
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="flex justify-between items-start mb-7">
        <div class="text-3xl font-bold text-slate-700">Order List</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th class="py-4 pl-6">ORDER NUMBER</th>
                <th>BUILDING</th>
                <th>FLOOR</th>
                <th>ROOM</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>TOTAL PRICE</th>
                <th class="text-center">ACTION</th>
              </tr>
            </thead>
            <tbody class="text-slate-600">
              <tr v-for="orders in orderStore.sortedOrders" :key="orders.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6 font-bold text-indigo-600">
                  #{{ orders.OrderNumber }}
                </td>

                <td class="font-medium text-slate-700">
                  {{ orders.building || '-' }}
                </td>
                <td class="font-medium text-slate-700">
                  {{ orders.floor || '-' }}
                </td>
                <td class="font-medium text-slate-700">
                  <span v-if="orders.room" class="font-bold text-indigo-600">{{ orders.room }}</span>
                  <span v-else>{{ orders.tableId || '-' }}</span>
                </td>

                <td>
                  <span class="badge gap-2 font-semibold" :class="getStatusColor(orders.statusOrder)">
                    {{ orders.statusOrder?.toUpperCase() || '-' }}
                  </span>
                </td>
                <td class="text-sm">{{ formatDate(orders.CreatedAt) }}</td>
                <td class="font-bold text-emerald-600">{{ orders.TotalPrice?.toLocaleString() }} ฿</td>
                <td class="text-center">
                  <button @click="openModal(orders)"
                    class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                      stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Details
                  </button>
                </td>
              </tr>
              <tr v-if="orderStore.sortedOrders.length === 0">
                <td colspan="6" class="text-center py-8 text-slate-400 italic">ไม่มีรายการสั่งซื้อ</td>
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
            <div class="flex justify-between items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
              <span v-if="selectedOrder.building && selectedOrder.room">
                Location: {{ selectedOrder.room }} ({{ selectedOrder.building }} FL.{{ selectedOrder.floor }})
              </span>
              <span v-else>
                Room: {{ selectedOrder.tableId }}
              </span>
              <span>Date: {{ formatDate(selectedOrder.CreatedAt) }}</span>
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
                  <tr v-for="(item, index) in selectedOrder.Menu" :key="index"
                    class="border-b border-slate-100 last:border-none">
                    <td>
                      <div class="font-bold text-slate-700">{{ item.Name }}</div>
                      <div class="text-xs text-slate-400">{{ item.Restaurant }}</div>
                      <div v-if="item.note" class="text-xs text-orange-500 italic mt-0.5">Note: {{ item.note }}</div>
                    </td>
                    <td class="text-center font-medium">{{ item.quantity || 1 }}</td>
                    <td class="text-right font-medium">{{ item.Price?.toLocaleString() }} ฿</td>
                    <td class="text-center">
                      <span class="badge badge-xs gap-1" :class="{
                        'badge-info': item.itemStatus === 'pending',
                        'bg-orange-500 text-white border-none': item.itemStatus === 'cooking',
                        'badge-success text-white': item.itemStatus === 'dispatched',
                        'badge-error text-white': item.itemStatus === 'cancelled'
                      }">
                        {{ item.itemStatus === 'pending' ? 'cooking' : (item.itemStatus || 'pending') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-between items-end border-t border-slate-200 pt-4 mt-4">
              <span class="text-2xl font-bold text-emerald-600">{{ selectedOrder.TotalPrice?.toLocaleString() }}
                ฿</span>
            </div>
          </div> 
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showModal = false">close</button>
      </form>
    </div>

  </LayoutAdmin>
</template>