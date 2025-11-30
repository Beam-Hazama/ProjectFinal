<script setup>
import LayoutAdmin from '@/page/Admin/LayoutAdmin.vue';
import { onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const orderStore = useOderlistStore();

onMounted(() => {
  orderStore.loadOrderinadmin();
});
</script>
<template>
  <LayoutAdmin>
    <div class="text text-3xl text-center">Order List</div>
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Order Status</th>
            <th>Order Date</th>
            <th>Order Totalprice</th>
          </tr>
        </thead>
        <tbody v-for="orders in orderStore.sortedOrders">
          <tr>
            <td>
              <div class="font-bold">{{ orders.orderNumber }}</div>
            </td>
            <td>{{ orders.statusOrder }}</td>
            <td>{{ orders.createdAt.toDate() }}</td>
            <td>{{ orders.totalPrice }}</td>
            <th>
              <button class="btn btn-ghost btn-xs">details</button>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </LayoutAdmin>
</template>
