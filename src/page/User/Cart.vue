<script setup>
import { useCartStore } from '@/stores/cartStore';
import { onMounted } from 'vue';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.loadcart()
})


</script>
<template>
  <div class="p-3">
    <h2 class="text-xl font-extrabold">MY CART</h2>
    <div class="flex justify-between">
      <div>รายการอาหารที่สั่ง</div>
      <div>สั่งอาหารเพิ่ม</div>
    </div>
    <div class="flex">
      <div class="flex-auto w-1/2 bg-slate-300 p-4">
        <div v-if="cartStore.item.length === 0">Cart you Empty</div>
        <div v-else v-for="(cart, index) in cartStore.item" class="flex mb-3">
          <div class="flex-1">
            <div class="flex flex-col h-full justify-between">
              <div class="flex justify-between">
                <div>{{ cart.Name }}</div>
                <div>฿{{ cart.Price }}</div>
              </div>
              <div>แก้ไข</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-auto w-full bg-slate-400 p-1">
      <div class="m-3">
        <div class="flex justify-between">
          <div>ค่าอาหาร</div>
          <div>฿20000000</div>
        </div>
        <div class="flex justify-between">
          <div>ค่าส่ง</div>
          <div>฿20000000</div>
        </div>
        <div class="flex justify-between">
          <div>ส่วนลดร้านที่ร่วมรายการ</div>
          <div>฿20000000</div>
        </div>
        <hr class="border-t-2 border-black my-3" />
        <div class="flex justify-between">
          <div>ทั้งหมด</div>
          <div class="">฿{{ cartStore.summaryPrice }}</div>
        </div>
        <!--<RouterLink to="/checkout" class="btn btn-neutral my-3 w-full"
            >Buy now</RouterLink
          >-->
      </div>
    </div>
    <div class="fixed bottom-0 left-0 w-full bg-gradient-to-r from-blue-400 to-blue-600 
           text-white  p-4 text-2xl font-bold shadow-2xl rounded-t-2xl 
          active:scale-95 transition-all cursor-pointer">
      <div class="flex justify-between">
        <div>สั่งเลย</div>
        <div>฿500</div>
      </div>
    </div>
  </div>
</template>
