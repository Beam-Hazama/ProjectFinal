<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOderlistStore } from '@/stores/OrderList';
import { useCartStore } from '@/stores/cartStore';
import { useMenuStore } from '@/stores/menuStore';
import { app, db, messaging as defaultMessaging } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { showBrowserNotification } from '@/utils/notification';

const IS_NOTIFICATION_ENABLED = true;

const route = useRoute();
const router = useRouter();
const orderListStore = useOderlistStore();
const cartStore = useCartStore();
const menuStore = useMenuStore();

const building = route.params.building || '-';
const floor = route.params.floor || '-';
const room = route.params.room || '-';
const roomId = `${building}-${floor}-${room}`;

const notificationPermission = ref(
  ('Notification' in window) ? Notification.permission : 'unsupported'
);

const displayLocation = computed(() => {
  return `ห้อง ${room} ชั้น ${floor} ตึก ${building}`;
});

const roomOrders = computed(() => {
  return orderListStore.list.filter(order => {
    const isOwner = order.building === building && 
                    order.floor === floor && 
                    order.room === room;
    if (!isOwner) return false;

    const hasActiveItems = (order.Menu || []).some(item =>
      !['received', 'cancelled'].includes(item.itemStatus)
    );

    return hasActiveItems;
  });
});

onMounted(() => {
  if (building && floor && room) {
    orderListStore.loadOrderUser(building, floor, room);
  }
  menuStore.loadMenu();

  setTimeout(() => {
    if (IS_NOTIFICATION_ENABLED && 'Notification' in window && Notification.permission === 'granted') {
      fetchFCMTokenAndSave();

      const activeMessaging = defaultMessaging || getMessaging(app);
      onMessage(activeMessaging, (payload) => {
        console.log('Message received. ', payload);
        if (payload.notification) {
          showBrowserNotification(payload.notification.title, payload.notification.body);
        }
      });
    }
  }, 3000);
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('th-TH').format(value);
};

const getMenuName = (id) => {
  const menu = menuStore.list.find(m => m.id === id);
  return menu ? menu.Name : 'เมนู (ไม่ทราบชื่อ)';
};

const confirmReceived = async (orderId, itemId) => {
  if (confirm('ยืนยันว่าได้รับรายการนี้แล้ว?')) {
    await orderListStore.updateSingleItemStatus(orderId, itemId, 'received');
    orderListStore.loadOrderUser(roomId);
  }
};

const reorder = async (order) => {
  const validItems = (order.Menu || []).filter(item =>
    item.itemStatus !== 'cancelled'
  );

  cartStore.loadcart(building, floor, room);

  let addedCount = 0;
  let unavailableNames = [];

  for (const item of validItems) {
    const menuId = item.menuId || item.id;
    try {
      const menuRef = doc(db, 'Menu', menuId);
      const menuSnap = await getDoc(menuRef);

      if (menuSnap.exists()) {
        const menuData = menuSnap.data();
        if (menuData.Status === 'open') {
          cartStore.addOrUpdateItem(item, item.Quantity, item.note || '');
          addedCount++;
        } else {
          unavailableNames.push(item.Name);
        }
      } else {
        unavailableNames.push(item.Name);
      }
    } catch (err) {
      console.error("Error checking menu availability:", err);
      unavailableNames.push(item.Name);
    }
  }

  if (unavailableNames.length > 0) {
    alert(`เมนูต่อไปนี้หมดหรือถูกปิดการขายชั่วคราว ไม่สามารถสั่งได้ในขณะนี้`);
  }

  if (addedCount > 0) {
    router.push(`/user/cart/${building}/${floor}/${room}`);
  }
};

const getOrderProgress = (order) => {
  const items = order.Menu || [];
  if (items.length === 0) return 0;

  const allFinished = items.every(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus));
  if (allFinished) return 3;

  const anyDispatched = items.some(i => i.itemStatus === 'dispatched');
  if (anyDispatched) return 2;

  const anyCooking = items.some(i => ['pending', 'cooking'].includes(i.itemStatus));
  if (anyCooking) return 1;

  return 0;
};

const getItemCountByStage = (order, stage) => {
  const items = order.Menu || [];
  switch (stage) {
    case 0: return items.filter(i => !i.itemStatus || i.itemStatus === 'waiting').length;
    case 1: return items.filter(i => ['pending', 'cooking'].includes(i.itemStatus)).length;
    case 2: return items.filter(i => i.itemStatus === 'dispatched').length;
    case 3: return items.filter(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus)).length;
    default: return 0;
  }
};

const fetchFCMTokenAndSave = async () => {
  if (!IS_NOTIFICATION_ENABLED) return;
  let activeMessaging = defaultMessaging;
  if (!activeMessaging) {
    try {
      activeMessaging = getMessaging(app);
    } catch (e) {
      console.log('FCM not supported');
      return;
    }
  }

  try {
    const currentToken = await getToken(activeMessaging, {
      vapidKey: 'BEMBQXbqVMk-b5ofr7Cpw9fCfQpbWY5K83C6KorO9DIA4XHJMApg-O-6_mcmhVvVvoCZajUBDQjQRJd4IOFhjgU'
    });

    if (currentToken && roomOrders.value.length > 0) {
      for (const order of roomOrders.value) {
        const orderRef = doc(db, 'Order', order.id);
        await updateDoc(orderRef, {
          deviceTokens: arrayUnion(currentToken)
        });
      }
    }
  } catch (err) {
    console.error('Auto fetch token error:', err);
  }
};

const requestNotificationPermission = async () => {
  if (!IS_NOTIFICATION_ENABLED) {
    alert('ระบบแจ้งเตือนถูกปิดการใช้งานชั่วคราวครับ');
    return;
  }
  if (!('Notification' in window)) {
    alert('ระบบแจ้งเตือนไม่ทำงาน: เบราว์เซอร์ไม่มีฟังก์ชัน Notification (อาจจะไม่ได้เป็น https)');
    return;
  }

  let activeMessaging = defaultMessaging;
  if (!activeMessaging) {
    try {
      activeMessaging = getMessaging(app);
    } catch (e) {
      alert('ระบบ Web Push ไม่ทำงาน: ' + e.message);
      return;
    }
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission.value = permission;
    if (permission === 'granted') {
      await fetchFCMTokenAndSave();
      alert('เปิดแจ้งเตือนสำเร็จ! ระบบจะเตือนเมื่อร้านอัปเดตออเดอร์');
    } else {
      alert('การแจ้งเตือนถูกปฏิเสธ หากต้องการเปิดให้ไปตั้งค่าในเบราว์เซอร์');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการขอสิทธิ์: ' + err.message);
    console.error('Permission request error:', err);
  }
};
</script>

<template>
  <div class="w-full min-h-screen p-4 space-y-5 bg-gradient-to-br from-blue-50 to-purple-50 font-sans">

    
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
            {{ displayLocation }}
          </p>
        </div>
      </div>
      <router-link :to="`/User/${building}/${floor}/${room}`"
        class="group flex items-center gap-2 mt-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-white/50">
        <span class="text-sm font-bold">ย้อนกลับ</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </router-link>
    </div>

    
    <div v-if="IS_NOTIFICATION_ENABLED && notificationPermission !== 'granted'"
      class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-xl">🔔</span>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-yellow-800">เปิดรับการแจ้งเตือน</span>
          <span class="text-[10px] text-yellow-600">เพื่อไม่พลาดสถานะออเดอร์ของคุณ</span>
        </div>
      </div>
      <button @click="requestNotificationPermission"
        class="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm rounded-lg px-4">
        เปิดเลย
      </button>
    </div>

    
    <div class="space-y-6">
      <div v-if="roomOrders.length === 0"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30 mb-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="font-medium">ยังไม่มีรายการสั่งซื้อ</p>
        <router-link :to="`/User/${building}/${floor}/${room}`"
          class="mt-4 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 text-sm">ไปที่เมนูอาหาร</router-link>
      </div>

      <div v-for="(order, index) in roomOrders" :key="index"
        class="bg-white/80 backdrop-blur-md shadow-xl border border-white/50 rounded-2xl overflow-hidden">
        
        <div class="p-4 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Order Number</span>
            <span class="text-sm font-black text-blue-700">#{{ order.OrderNumber }}</span>
            <span class="text-[10px] text-gray-400 font-medium mt-0.5" v-if="order.CreatedAt">
              {{ order.CreatedAt?.toDate ? order.CreatedAt.toDate().toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '' }} น.
            </span>
          </div>
          <button @click="reorder(order)"
            class="btn btn-sm bg-indigo-100 text-indigo-700 border-none hover:bg-indigo-200 gap-1 shadow-sm font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            สั่งอีกครั้ง
          </button>
        </div>

        
        <div v-if="!(order.Menu || []).every(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus))"
          class="px-8 py-6 bg-white border-b border-gray-50">
          <div class="relative flex items-center justify-between">
            
            <div class="absolute left-4 right-4 top-4 h-[2px]">
              <div class="w-full h-full bg-gray-100"></div>
              <div class="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-700 ease-out"
                :style="{ width: `${(getOrderProgress(order) / 3) * 100}%` }"></div>
            </div>

            
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  getOrderProgress(order) >= 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div v-if="getItemCountByStage(order, 0) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  getOrderProgress(order) >= 0 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ getItemCountByStage(order, 0) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', getOrderProgress(order) >= 0 ? 'text-blue-600' : 'text-gray-400']">รอรับออเดอร์</span>
            </div>

            
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  getOrderProgress(order) >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 11c0 3.3 2.7 6 6 6h2c3.3 0 6-2.7 6-6H3Z" />
                    <path d="M17 11h4" />
                    <path d="M9 7v4" />
                    <path d="M13 7v4" />
                  </svg>
                </div>
                <div v-if="getItemCountByStage(order, 1) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  getOrderProgress(order) >= 1 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ getItemCountByStage(order, 1) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', getOrderProgress(order) >= 1 ? 'text-blue-600' : 'text-gray-400']">กำลังทำอาหาร</span>
            </div>

            
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  getOrderProgress(order) >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 17h4V5H2v12h3m15 0h2v-3.34a2 2 0 0 0-.59-1.42L17.5 9H14" />
                    <circle cx="7.5" cy="17.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                </div>
                <div v-if="getItemCountByStage(order, 2) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  getOrderProgress(order) >= 2 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ getItemCountByStage(order, 2) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', getOrderProgress(order) >= 2 ? 'text-blue-600' : 'text-gray-400']">กำลังจัดส่ง</span>
            </div>

            
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 mb-1.5',
                  getOrderProgress(order) >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                ]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div v-if="getItemCountByStage(order, 3) > 0" :class="['absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm transition-all duration-300',
                  getOrderProgress(order) >= 3 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ getItemCountByStage(order, 3) }}
                </div>
              </div>
              <span
                :class="['text-[8px] font-bold whitespace-nowrap', getOrderProgress(order) >= 3 ? 'text-blue-600' : 'text-gray-400']">สำเร็จแล้ว</span>
            </div>
          </div>
        </div>

        
        <div class="p-4 space-y-4">
          <div v-for="(item, i) in order.Menu" :key="i"
            class="group flex justify-between items-center p-2 rounded-xl hover:bg-white/50 transition-colors">
            <div class="flex flex-col">
              <div class="flex gap-3 items-center">
                <span class="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">x{{ item.Quantity
                  }}</span>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-700">{{ item.Name || getMenuName(item.id || item.menuId)
                    }}</span>
                  <span v-if="item.note" class="text-xs text-gray-500 mt-0.5">{{ item.note }}</span>
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
              <span class="text-sm font-black text-gray-800">฿{{ formatPrice(item.Price * item.Quantity) }}</span>
              <button v-if="item.itemStatus === 'dispatched'" @click="confirmReceived(order.id, item.id)"
                class="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none shadow-sm animate-pulse">
                ยืนยันรับอาหาร
              </button>
            </div>
          </div>
        </div>

        
        <div class="p-4 bg-white/60 border-t border-white flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase">ยอดรวมรายการนี้</span>
          <span class="text-lg font-black text-blue-600">฿{{ formatPrice(order.TotalPrice) }}</span>
        </div>
      </div>
    </div>

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
