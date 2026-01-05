<script setup>
import QrcodeVue from 'qrcode.vue'
import { ref } from 'vue'

const tableNumber = ref('101')
const baseUrl = window.location.origin // ดึงโดเมนปัจจุบัน
</script>

<template>
  <div class="p-10 text-center">
    <input v-model="tableNumber" placeholder="ใส่เลขโต๊ะ" class="input input-bordered mb-4" />
    <div class="flex justify-center">
      <qrcode-vue :value="`${baseUrl}/User/${tableNumber}`" :size="200" level="H" />
    </div>
    <p class="mt-2">สแกนเพื่อสั่งอาหารโต๊ะ {{ tableNumber }}</p>
  </div>
</template>