<script setup>
import bill from '@/Icon/Bill.vue';
</script>

<template>
  <div class="bg-sky-600 p-3 flex items-center justify-between">
    <div class="ml-3 badge badge-md bg-blue-200">ห้องที่</div>
    <div class="avatar w-8">
      <div class="rounded-full"><bill></bill></div>
    </div>
  </div>
  <div class="overflow-hidden h-30">
    <img
      class="object-cover h-full w-full"
      src="https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg"
    />
  </div>
  <div class="text-center font-bold text-blue-600">Food Delivery</div>

  
  <legend class="mt-3 ml-3 text-gray-500">ร้านค้า</legend>
  <div class="tabs tabs-box bg-blue-300">
    <input type="radio" name="my_tabs_6" class="tab" aria-label="ร้านค้า" checked/>
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 0</div>

    <input type="radio" name="my_tabs_6" class="tab" aria-label="ตามสั่ง" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

    <input type="radio" name="my_tabs_6" class="tab" aria-label="ก๊วยเตี๋ยว" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

    <input type="radio" name="my_tabs_6" class="tab" aria-label="น้ำ" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
  </div>
  
  <legend class="mt-3 ml-3 text-gray-500">เมนู</legend>
  <div class="tabs tabs-box bg-blue-300">
    <input type="radio" name="my_tabs_7" class="tab" aria-label="แนะนำ" checked/>
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 0</div>

    <input type="radio" name="my_tabs_7" class="tab" aria-label="ข้าว" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>

    <input type="radio" name="my_tabs_7" class="tab" aria-label="ก๊วยเตี๋ยว" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

    <input type="radio" name="my_tabs_7" class="tab" aria-label="น้ำ" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
  </div>
</template>
