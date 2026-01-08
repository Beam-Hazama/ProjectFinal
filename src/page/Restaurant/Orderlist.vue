<script setup>
import restaurant from './Restaurant.vue';
import { onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const orderStore = useOderlistStore();

onMounted(() => {
  
  orderStore.loadOrder(); 
});
</script>

<template>
  <restaurant>
    <div class="p-6"> <div class="text-3xl font-bold  mb-6 text-slate-700">Order List</div>
        <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-100">
        <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500">
            <tr>
                <th class="py-4">Order Number</th>
                <th>Status</th>
                <th>Date</th>
                <th>Total Price</th>
                <th>Action</th> </tr>
            </thead>
            <tbody class="text-slate-600">
            <tr v-for="orders in orderStore.sortedOrders" :key="orders.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="font-bold text-blue-600">
                #{{ orders.OrderNumber }} </td>
                <td>
                    <span class="badge badge-warning gap-2" v-if="orders.statusOrder === 'pending'">
                        {{ orders.statusOrder }}
                    </span>
                    <span class="badge badge-success gap-2 text-white" v-else>
                        {{ orders.statusOrder }}
                    </span>
                </td>
                <td>{{ orders.CreatedAt?.toDate().toLocaleString() }}</td> <td class="font-bold">{{ orders.TotalPrice?.toLocaleString() }} ฿</td>
                <td>
                <button class="btn btn-sm btn-ghost text-blue-500">details</button>
                </td>
            </tr>
            <tr v-if="orderStore.sortedOrders.length === 0">
                <td colspan="5" class="text-center py-8 text-slate-400">ไม่มีรายการสั่งซื้อ</td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
  </restaurant>
</template>