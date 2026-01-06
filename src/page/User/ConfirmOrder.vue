<script setup>
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

// รับ props tableId มาจากหน้า Cart.vue
const props = defineProps({
  tableId: String
})

const payment = () => {
  // 1. บันทึกออเดอร์ลงระบบ
  cartStore.placeorder(props.tableId);
  
  // 2. ปิด Modal
  const dlg = document.getElementById('my_modal_1')
  if (dlg?.close) dlg.close()
  
  // 3. ล้างตะกร้าสินค้า
  cartStore.clearcart()
  
  // 4. เปลี่ยนหน้าไปยังหน้า Status ทันที
  router.push({ name: 'Status', params: { tableId: props.tableId } });
};

const editOrder = () => {
  const dlg = document.getElementById('my_modal_1')
  if (dlg?.close) dlg.close()
}
</script>

<template>
  <div class="modal-box p-0 w-11/12 max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden font-sans border border-slate-100 relative">
    <div class="px-8 pt-7 pb-4 bg-white/80 backdrop-blur-sm z-10 relative">
      <h2 class="text-xs font-bold text-blue-400 tracking-widest uppercase mb-1">ยืนยันออเดอร์</h2>
      <h1 class="text-3xl font-extrabold text-blue-600">Confirm Order</h1>
      <p class="text-red-700 text-sm mt-1">**ไม่สามารถยกเลิกออเดอร์ได้**</p>
    </div>

    <div class="px-6 max-h-[40vh] overflow-y-auto custom-scrollbar relative z-10">
      <div v-if="cartStore.item.length > 0" class="space-y-0.5">
        <div v-for="(cart, index) in cartStore.item" :key="index" class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
          <div class="flex items-center gap-4">
            <div>
              <div class="font-bold text-slate-700 text-base leading-tight">{{ cart.Name }}</div>
              <p class="text-xs text-slate-400 font-medium mt-1">จำนวน: x{{ cart.Quantity }} (฿{{ cart.Price }})</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-blue-600 text-lg">{{ (cart.Price * cart.Quantity).toLocaleString() }}</span>
            <span class="text-xs text-slate-400 block">บาท</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pb-6 px-6 bg-slate-50 mt-4 rounded-t-[2.5rem] relative z-20">
      <hr class="border-dashed border-gray-300 my-4" />
      <div class="flex justify-between items-end mb-6 px-2">
        <span class="text-xl font-medium">ยอดรวมทั้งสิ้น</span>
        <div class="text-right">
          <span class="text-4xl font-black text-blue-600">{{ cartStore.summaryPrice.toLocaleString() }}</span>
          <span class="text-sm text-slate-500 font-bold ml-1">บาท</span>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="editOrder()" class="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-white border border-red-100 transition-all">ยกเลิก</button>
        <button @click="payment()" class="flex-[2] py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all flex justify-center items-center gap-2">
          ยืนยันออเดอร์
        </button>
      </div>
    </div>
  </div>
</template>