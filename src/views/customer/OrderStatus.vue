<script setup>
import { onMounted, ref, computed } from 'vue';
import { formatFullDateTime } from '@/utils/format';
import { useRoute, useRouter } from 'vue-router';
import { useUserStatusStore } from '@/stores/user/status';
import { useCartStore } from '@/stores/customer/cart';
import { isStandalone, enableCustomerNotification } from '@/utils/notification';
import BottomNavigation from '@/views/customer/BottomNavigation.vue';

const route = useRoute();
const router = useRouter();
const statusStore = useUserStatusStore();
const cartStore = useCartStore();
const room = computed(() => cartStore.room);

const notificationPermission = ref(
  ('Notification' in window) ? Notification.permission : 'unsupported'
);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const showIOSGuide = ref(false);

const handleRequestPermission = async () => {
  // iOS ต้อง install เป็น PWA ก่อน
  if (isIOS && !isStandalone()) {
    showIOSGuide.value = true;
    return;
  }

  // ดึง orderId ปัจจุบันทั้งหมดของห้องนี้
  const orderIds = statusStore.roomOrders.map(o => o.id);
  
  const result = await enableCustomerNotification(orderIds);
  
  if (result.ok) {
    notificationPermission.value = 'granted';
    alert('เปิดแจ้งเตือนสำเร็จ! ระบบจะแจ้งเตือนเมื่อสถานะออเดอร์เปลี่ยน แม้ปิดจอ');
  } else if (result.reason === 'permission_denied') {
    alert('คุณปฏิเสธการแจ้งเตือน หากต้องการเปิด ไปที่การตั้งค่าเบราว์เซอร์');
  } else {
    alert('ไม่สามารถเปิดแจ้งเตือนได้ กรุณาลองใหม่');
  }
};

onMounted(() => {
  statusStore.initUserSession(room.value);
});
</script>

<template>
  <div class="w-full min-h-screen p-4 space-y-5 bg-gradient-to-br from-blue-50 to-purple-50 font-sans">

    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-blue-600 drop-shadow-md uppercase">Order Status</h1>
          <p class="text-xs text-blue-500 font-bold mx-0.5 mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ statusStore.displayLocation }}
          </p>
        </div>
      </div>
    </div>

    <!-- Notification Alert -->
    <div v-if="notificationPermission !== 'granted'"
      class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-xl">🔔</span>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-yellow-800">เปิดรับการแจ้งเตือน</span>
            <span class="text-[10px] text-yellow-600">เพื่อไม่พลาดสถานะออเดอร์ของคุณ</span>
          </div>
        </div>
        <button @click="handleRequestPermission"
          class="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm rounded-lg px-4">
          เปิดเลย
        </button>
      </div>

      <!-- iOS PWA Guide -->
      <div v-if="showIOSGuide" class="mt-2 p-3 bg-white/60 rounded-lg border border-yellow-100 text-xs text-yellow-800">
        <p class="font-bold mb-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          สำหรับผู้ใช้ iOS (iPhone/iPad)
        </p>
        <p>คุณต้องติดตั้งแอปนี้ลงบนหน้าจอก่อนถึงจะรับการแจ้งเตือนได้:</p>
        <ol class="list-decimal pl-5 mt-1 space-y-1">
          <li>แตะที่ปุ่ม <span class="inline-flex items-center justify-center p-1 bg-gray-100 rounded text-blue-500 border"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span> Share ด้านล่างของ Safari</li>
          <li>เลือก <strong>"Add to Home Screen"</strong> (เพิ่มไปยังหน้าจอโฮม)</li>
          <li>เปิดแอปจากหน้าจอโฮมเพื่อเปิดรับการแจ้งเตือน</li>
        </ol>
      </div>
    </div>

    <!-- Orders List -->
    <div class="space-y-6">
      <div v-if="statusStore.roomOrders.length === 0"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30 mb-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="font-medium">ยังไม่มีรายการสั่งซื้อ</p>
        <router-link :to="`/user/${room}`"
          class="mt-4 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 text-sm">ไปที่เมนูอาหาร</router-link>
      </div>

      <div v-for="(order, index) in statusStore.roomOrders" :key="index"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl overflow-hidden">
        <!-- Order Card Header -->
        <div class="p-4 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Order Number</span>
            <span class="text-sm font-black text-blue-700">#{{ order.OrderNumber }}</span>
          </div>
          <div class="text-right" v-if="order.CreatedAt">
            <span class="text-[11px] font-bold text-gray-400">
              {{ formatFullDateTime(order.CreatedAt) }} น.
            </span>
          </div>
        </div>

        <!-- Progress Stepper (Visible if not all items finished/received) -->
        <div v-if="!(order.Menu || []).every(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus))"
          class="px-8 py-6 bg-white border-b border-gray-50">
          <div class="relative flex items-center justify-between">
            <!-- Background Progress Line -->
            <div class="absolute left-4 right-4 top-4 h-[2px]">
              <div class="w-full h-full bg-gray-100"></div>
              <div class="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-700 ease-out"
                :style="{ width: `${(statusStore.getOrderProgress(order) / 3) * 100}%` }"></div>
            </div>

            <!-- Stage 0: Waiting -->
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  statusStore.getOrderProgress(order) >= 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div v-if="statusStore.getItemCountByStage(order, 0) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  statusStore.getOrderProgress(order) >= 0 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ statusStore.getItemCountByStage(order, 0) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', statusStore.getOrderProgress(order) >= 0 ? 'text-blue-600' : 'text-gray-400']">รอรับออเดอร์</span>
            </div>

            <!-- Stage 1: Cooking -->
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  statusStore.getOrderProgress(order) >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 11c0 3.3 2.7 6 6 6h2c3.3 0 6-2.7 6-6H3Z" />
                    <path d="M17 11h4" />
                    <path d="M9 7v4" />
                    <path d="M13 7v4" />
                  </svg>
                </div>
                <div v-if="statusStore.getItemCountByStage(order, 1) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  statusStore.getOrderProgress(order) >= 1 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ statusStore.getItemCountByStage(order, 1) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', statusStore.getOrderProgress(order) >= 1 ? 'text-blue-600' : 'text-gray-400']">กำลังทำอาหาร</span>
            </div>

            <!-- Stage 2: Dispatched -->
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  statusStore.getOrderProgress(order) >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 17h4V5H2v12h3m15 0h2v-3.34a2 2 0 0 0-.59-1.42L17.5 9H14" />
                    <circle cx="7.5" cy="17.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                </div>
                <div v-if="statusStore.getItemCountByStage(order, 2) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  statusStore.getOrderProgress(order) >= 2 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ statusStore.getItemCountByStage(order, 2) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', statusStore.getOrderProgress(order) >= 2 ? 'text-blue-600' : 'text-gray-400']">กำลังจัดส่ง</span>
            </div>

            <!-- Stage 3: Finished -->
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  statusStore.getOrderProgress(order) >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div v-if="statusStore.getItemCountByStage(order, 3) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  statusStore.getOrderProgress(order) >= 3 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ statusStore.getItemCountByStage(order, 3) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', statusStore.getOrderProgress(order) >= 3 ? 'text-blue-600' : 'text-gray-400']">เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="p-4 space-y-4">
          <div v-for="(item, i) in order.Menu" :key="i"
            class="group flex justify-between items-center p-2 rounded-xl hover:bg-white/50 transition-colors">
            <div class="flex flex-col">
              <div class="flex gap-3 items-center">
                <span class="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">x{{ item.Quantity
                }}</span>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-700">{{ item.Name || statusStore.getMenuName(item.id || item.menuId)
                    }}</span>
                  <span v-if="item.Restaurant" class="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{{
                    item.Restaurant }}</span>
                  <span v-if="item.note" class="text-xs text-gray-500 mt-0.5">โน้ต: {{ item.note }}</span>
                </div>
              </div>

              <div class="mt-1.5 flex items-center gap-1.5">
                <span :class="{
                  'w-1.5 h-1.5 rounded-full ring-2 ring-offset-1': true,
                  'bg-yellow-400 ring-yellow-200': !item.itemStatus || item.itemStatus === 'waiting',
                  'bg-orange-500 ring-orange-200': item.itemStatus === 'pending' || item.itemStatus === 'cooking' || item.itemStatus === 'returned',
                  'bg-green-500 ring-green-200': item.itemStatus === 'dispatched',
                  'bg-teal-500 ring-teal-200': item.itemStatus === 'received',
                  'bg-red-500 ring-red-200': item.itemStatus === 'cancelled'
                }"></span>
                <span class="text-[9px] font-black uppercase tracking-wider" :class="{
                  'text-yellow-500': !item.itemStatus || item.itemStatus === 'waiting',
                  'text-orange-500': item.itemStatus === 'pending' || item.itemStatus === 'cooking' || item.itemStatus === 'returned',
                  'text-green-600': item.itemStatus === 'dispatched',
                  'text-teal-600': item.itemStatus === 'received',
                  'text-red-500': item.itemStatus === 'cancelled'
                }">
                  {{ (!item.itemStatus || item.itemStatus === 'waiting') ? 'รอร้านรับออเดอร์' :
                    (item.itemStatus === 'pending' || item.itemStatus === 'cooking') ? 'กำลังทำอาหาร' :
                      item.itemStatus === 'cancelled' ? 'ถูกยกเลิก' :
                        item.itemStatus === 'returned' ? 'รายการถูกตีกลับ' :
                          item.itemStatus === 'received' ? 'ได้รับแล้ว' : 'จัดส่ง' }}
                </span>
              </div>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
              <template v-if="item.itemStatus === 'cancelled'">
                <span class="text-sm font-black text-gray-800">฿0</span>
                <span class="text-[10px] text-gray-400 line-through">฿{{ statusStore.formatPrice(item.Price * item.Quantity)
                  }}</span>
              </template>
              <template v-else>
                <span class="text-sm font-black text-gray-800">฿{{ statusStore.formatPrice(item.Price * item.Quantity) }}</span>
              </template>
              <button v-if="item.itemStatus === 'dispatched'" @click="statusStore.markItemAsReceived(order.id, item.cartItemId, i, router)"
                class="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none shadow-sm animate-pulse">
                ยืนยันรับอาหาร
              </button>
            </div>
          </div>
        </div>

        <!-- Total Price for the Order Card -->
        <div class="p-4 bg-white/60 border-t border-white flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase">ยอดรวมรายการนี้</span>
          <span class="text-lg font-black text-blue-600">
            ฿{{statusStore.formatPrice((order.Menu || []).reduce((sum, item) => sum + (item.itemStatus === 'cancelled' ? 0 :
              (item.Price *
            item.Quantity)), 0)) }}
          </span>
        </div>
      </div>
    </div>
    <BottomNavigation />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style>
