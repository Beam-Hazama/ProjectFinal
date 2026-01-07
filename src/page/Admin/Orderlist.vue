<script setup>
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const orderStore = useOderlistStore();

onMounted(() => {
  orderStore.loadOrder(); 
});

// ฟังก์ชันสำหรับแยกข้อมูล tableId (สมมติว่าคุณเก็บรูปแบบ "ตึก-ชั้น-ห้อง" เช่น "A-3-301")
// หรือถ้าเก็บแยกฟิลด์อยู่แล้ว สามารถเรียกใช้ orders.RoomNumber ได้เลย
const formatLocation = (tableId) => {
  if (!tableId) return '-';
  return tableId; // แสดงค่า tableId ตรงๆ หรือปรับแต่ง logic การแสดงผลที่นี่
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
            <tr v-for="orders in orderStore.sortedOrders" :key="orders.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                <button class="btn btn-sm btn-ghost text-blue-500 hover:bg-blue-50">details</button>
              </td>
            </tr>
            <tr v-if="orderStore.sortedOrders.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400 italic">ไม่มีรายการสั่งซื้อ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </LayoutAdmin>
</template>