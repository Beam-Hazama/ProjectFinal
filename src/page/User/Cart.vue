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
    <div class="flex">
      <div class="flex-auto w-1/2 bg-slate-300 p-4">
        <div v-if="cartStore.item.length === 0">Cart you Empty</div>
        <div v-else v-for="(cart, index) in cartStore.item" class="flex mb-3">
          <div class="flex-1">
            <img class="w-full px-4" :src="cart.ImageUrl" />
          </div>
          <div class="flex-1">
            <div class="flex flex-col h-full justify-between">
              <div class="relative grid grid-cols-2">
                <div>
                  <div>{{ cart.Name }}</div>
                  <div>{{ cart.Price }}</div>
                </div>
                <div>
                  <select @change="changQuantity($event, index)" class="select w-20" v-model="cart.Quantity">
                    <option v-for="quantity in [1, 2, 3, 4, 5]">
                      {{ quantity }}
                    </option>
                  </select>
                </div>
                <div
                  @click="cartStore.removeItemInCart(index)"
                  class="btn absolute top-0 right-0"
                >
                </div>
              </div>
              <div>in stocke</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-auto w-1/2 bg-slate-400 p-1">
        <div class="text-2xl font-bold ml-2">Order Summary</div>
        <div class="m-3">
          <div
            v-for="(cart, index) in cartStore.item"
            class="flex justify-between"
          >
            <div>{{ cart.Name }}</div>
            <div>{{ cart.Price * cart.Quantity }}</div>
          </div>
          <div class="flex justify-between">
            <div>ค่าส่ง</div>
            <div>0</div>
          </div>
          <hr class="border-t-2 border-black my-3" />
          <div class="flex justify-between">
            <div>ราคารวมทั้งหมด</div>
            <div>{{ cartStore.summaryPrice }}</div>
          </div>
          <!--<RouterLink to="/checkout" class="btn btn-neutral my-3 w-full"
            >Buy now</RouterLink
          >-->
        </div>
      </div>
    </div>
  </div>
</template>
