<script setup>
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { onMounted, ref } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const orderStore = useOderlistStore();
const selectedOrder = ref(null);
const showModal = ref(false);

onMounted(() => {
  orderStore.loadOrderinadmin();
});

const formatLocation = (tableId) => {
  if (!tableId) return '-';
  return tableId;
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('th-TH');
};

const openModal = (order) => {
  selectedOrder.value = order;
  showModal.value = true;
};
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
                <td class="pl-6 font-bold text-blue-600">
                  #{{ orders.OrderNumber }}
                </td>

                <td class="font-medium text-slate-700">
                  {{ orders.building || '-' }}
                </td>
                <td class="font-medium text-slate-700">
                  {{ orders.floor || '-' }}
                </td>
                <td class="font-medium text-slate-700">
                  <span v-if="orders.room" class="font-bold text-blue-600">{{ orders.room }}</span>
                  <span v-else>{{ orders.tableId || '-' }}</span>
                </td>

                <td>
                  <span class="badge badge-warning gap-2" v-if="orders.statusOrder === 'pending'">
                    {{ orders.statusOrder }}
                  </span>
                  <span class="badge badge-success gap-2 text-white" v-else>
                    {{ orders.statusOrder?.toUpperCase() || '-' }}
                  </span>
                </td>
                <td class="text-sm">{{ formatDate(orders.CreatedAt) }}</td>
                <td class="font-bold text-emerald-600">{{ orders.TotalPrice?.toLocaleString() }} ฿</td>
                <td class="text-center">
                  <button @click="openModal(orders)"
                    class="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50 font-bold transition-colors">Details</button>
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

          <h3 class="font-bold text-lg mb-4 text-blue-600">
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
            <!-- </div> v-if moved down to cover table -->

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
                        'badge-warning': item.itemStatus === 'pending',
                        'badge-info': item.itemStatus === 'cooking',
                        'badge-success text-white': item.itemStatus === 'served',
                        'badge-error text-white': item.itemStatus === 'cancelled'
                      }">
                        {{ item.itemStatus || 'pending' }}
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
          </div> <!-- End of v-if="selectedOrder" scope -->
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showModal = false">close</button>
      </form>
    </div>

  </LayoutAdmin>
</template>