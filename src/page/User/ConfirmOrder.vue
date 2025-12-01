<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { RouterLink, useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();


defineProps({
  user:Array
})

//const userFromData = reactive({
  //name: '',
  //number:''
//});

const payment = () => {
  
  const placeorder = cartStore.placeorder();
  const dlg = document.getElementById('my_modal_1')
  cartStore.clearcart()
  if(dlg?.close)dlg.close()
  console.log('userdata',placeorder)
};

const editOrder = ()=>{
  const dlg = document.getElementById('my_modal_1')
  if(dlg?.close)dlg.close()
}


</script>

<template>
  <div class="modal-box">
    <h1 class="text-3xl font-bold m4">CheckOut Cart</h1>
    <div class="flex">
      <section class="flex-auto w-64 bg-slate-400">
        <div>
          <hr class="border-blue-950" />
          <div class="py-4 px-7">
            <div>
              <b class="text-lg font-bold">Order Summary</b>
              <hr class="border-t-2 border-black my-3"/>
              <div v-for="cart in cartStore.item" class="columns-3">
                <div>{{ cart.Name }}</div>
                <div class="flex justify-end">{{ cart.Quantity }}</div>
                <div class="flex justify-end">{{ cart.Price * cart.Quantity }}</div>
              </div>
              <hr class="border-t-2 border-black my-3" />
              <div class="flex justify-between">
                <div>ราคารวมทั้งหมด</div>
                <div>{{ cartStore.summaryPrice }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full">
            <button class="btn items-center" @click="payment()">ยืนยันการสั่งซื้อ</button>
        </div>
      </section>
    </div>
  </div>
</template>
