<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';
import { useRoute } from 'vue-router';

const route = useRoute();
const Order = useOderlistStore();

// รับค่า tableId จาก URL (ตรวจสอบชื่อ param ใน router/index.js ของคุณด้วย)
// แก้ไขบรรทัดนี้ใน bill.vue
const tableId = route.params.tableId || 'ทั่วไป';

const discount = ref(50.00);

onMounted(async () => {
    // เรียกใช้ฟังก์ชันที่กรองตามโต๊ะ
    await Order.loadOrderUser(tableId);
});

// กรองเพื่อความชัวร์ในฝั่ง UI
const userOrders = computed(() => {
    return Order.list.filter(order => order.TableID === tableId);
});

// --- ฟังก์ชันคำนวณราคา ---
const calculateSubtotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
};

const calculateGrandTotal = (subtotal) => {
    return subtotal - discount.value;
};

const calculateVat = (grandTotal) => {
    return grandTotal - (grandTotal / 1.07);
};

const calculateExclVat = (grandTotal) => {
    return grandTotal / 1.07;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col gap-3 py-4 px-4 text-gray-700">
    
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-3">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-black text-blue-600 tracking-tight uppercase">Bill: {{ tableId }}</h1>
          <p class="text-xs text-blue-400 font-medium tracking-widest">ใบเสร็จรับเงิน</p>
        </div>
      </div>

      <router-link :to="`/User/${tableId}`" class="group flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl shadow-sm text-blue-600 border border-white/50 transition-all">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </router-link>
    </div>

    <div v-if="userOrders.length === 0" class="text-center py-20 text-gray-400 font-medium">
      ไม่มีข้อมูลใบเสร็จสำหรับห้องนี้
    </div>

    <div v-for="order in userOrders" :key="order.id" class="bg-white w-full rounded-3xl shadow-xl relative flex flex-col mb-4 overflow-hidden">
      <div class="bg-white p-4 pb-2">
        <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex justify-between items-center">
          <div>
            <div class="text-sm text-blue-400 font-bold uppercase tracking-wider">Order No.</div>
            <div class="text-3xl font-bold text-blue-800 mt-1">#{{ order.OrderNumber }}</div>
          </div>
          <div class="text-right">
            <div class="inline-block bg-white text-blue-600 text-sm font-bold px-4 py-1.5 rounded-lg shadow-sm">
              {{ order.statusOrder === 'pending' ? 'รอดำเนินการ' : 'ชำระแล้ว' }}
            </div>
            <div class="text-[10px] text-gray-500 mt-2">
              {{ order.CreatedAt?.toDate().toLocaleString('th-TH') }}
            </div>
          </div>
        </div>
      </div>

      <div class="px-3 py-2">
        <div v-for="(item, index) in order.Menu" :key="index" class="flex items-center py-3 border-b border-gray-50 last:border-0 px-2">
          <div class="w-12 text-center font-bold text-gray-400">x{{ item.Quantity }}</div>
          <div class="flex-1 font-bold text-gray-800 text-sm">{{ item.Name }}</div>
          <div class="text-right font-bold text-blue-600">฿{{ item.Price * item.Quantity }}</div>
        </div>
      </div>

      <hr class="border-dashed border-gray-200 mx-6" />

      <div class="p-7 space-y-3">
        <div class="flex justify-between text-xl font-bold">
          <span>รวมเป็นเงิน</span>
          <span class="text-indigo-600">฿{{ calculateSubtotal(order.Menu) }}</span>
        </div>
        <div class="flex justify-between items-center bg-red-50 p-2 rounded-lg text-red-500 text-sm font-bold">
          <span>ส่วนลด</span>
          <span>- ฿{{ discount }}</span>
        </div>
        
        <div class="pt-2 text-[10px] text-gray-400 space-y-1">
          <div class="flex justify-between">
            <span>VAT 7%</span>
            <span>฿{{ calculateVat(calculateGrandTotal(calculateSubtotal(order.Menu))).toFixed(2) }}</span>
          </div>
        </div>

        <div class="border-t border-gray-100 my-4"></div>

        <div class="flex flex-col items-center py-2">
          <p class="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Scan to Pay</p>
          <div class="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENT-${order.OrderNumber}`" alt="QR Code" class="w-24 h-24" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>