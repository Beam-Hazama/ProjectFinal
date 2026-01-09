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

const formatLocation = (tableId) => {
  if (!tableId) return '-';
  return tableId;
};

const openModal = (order) => {
  selectedOrder.value = order;
  showModal.value = true;
};
</script>

<template>
  <LayoutAdmin>
    <div class="p-6">
      <div class="text-3xl font-bold mb-6 text-slate-700">Order List</div>
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-100">
        <table class="table w-full">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="py-4">Order Number</th>
              <th>Room Number</th>
              <th>Status</th>
              <th>Date</th>
              <th>Total Price</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="orders in orderStore.sortedOrders" :key="orders.id"
              class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="font-bold text-blue-600">
                #{{ orders.OrderNumber }}
              </td>

              <td class="font-medium text-slate-700">
                <div class="flex flex-col">
                  <span>{{ orders.tableId || '-' }}</span>

                </div>
              </td>

              <td>
                <span class="badge badge-warning gap-2" v-if="orders.statusOrder === 'pending'">
                  {{ orders.statusOrder }}
                </span>
                <span class="badge badge-success gap-2 text-white" v-else>
                  {{ orders.statusOrder }}
                </span>
              </td>
              <td class="text-sm">{{ orders.CreatedAt?.toDate().toLocaleString('th-TH') }}</td>
              <td class="font-bold text-emerald-600">{{ orders.TotalPrice?.toLocaleString() }} ฿</td>
              <td class="text-center">
                <button @click="openModal(orders)"
                  class="btn btn-sm btn-ghost text-blue-500 hover:bg-blue-50">details</button>
              </td>
            </tr>
            <tr v-if="orderStore.sortedOrders.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400 italic">ไม่มีรายการสั่งซื้อ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Details Modal -->
    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showModal }">
      <div class="modal-box relative">
        <button @click="showModal = false" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>

        <h3 class="font-bold text-lg mb-4 text-blue-600">
          Order Details #{{ selectedOrder?.OrderNumber }}
        </h3>

        <div v-if="selectedOrder" class="space-y-4">
          <div class="flex justify-between items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
            <span>Room: {{ selectedOrder.tableId }}</span>
            <span>Date: {{ selectedOrder.CreatedAt?.toDate().toLocaleString('th-TH') }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="table w-full table-compact">
              <thead>
                <tr class="text-slate-500">
                  <th>Menu Item</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-center">Status</th>
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
            <span class="text-slate-500">Total Amount</span>
            <span class="text-2xl font-bold text-emerald-600">{{ selectedOrder.TotalPrice?.toLocaleString() }} ฿</span>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showModal = false">close</button>
      </form>
    </dialog>

  </LayoutAdmin>
</template>