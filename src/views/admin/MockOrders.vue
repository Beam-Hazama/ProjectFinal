<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const loading = ref(false);
const message = ref('');

const today = new Date();
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);

const startDate = ref(lastWeek.toISOString().split('T')[0]);
const endDate = ref(today.toISOString().split('T')[0]);
const orderCount = ref(10);
const selectedRestaurant = ref('all');
const restaurantsList = ref([]);

onMounted(async () => {
  try {
    const restSnapshot = await getDocs(collection(db, 'Restaurant'));
    if (!restSnapshot.empty) {
      restaurantsList.value = restSnapshot.docs.map(doc => doc.data().RestaurantName).filter(Boolean);
    }
  } catch (err) {
    console.error('Error loading restaurants:', err);
  }
});

const generateOrders = async () => {
  if (!startDate.value || !endDate.value) {
    message.value = 'กรุณาระบุช่วงวันที่ให้ครบถ้วน';
    return;
  }
  
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    message.value = 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด';
    return;
  }

  loading.value = true;
  message.value = 'กำลังดึงข้อมูล...';
  
  try {
    // 1. Fetch available menus
    const menuSnapshot = await getDocs(collection(db, 'Menu'));
    if (menuSnapshot.empty) {
      throw new Error('ไม่พบข้อมูลเมนูในระบบ');
    }
    const allMenus = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter menus by restaurant if selected
    let availableMenus = allMenus;
    if (selectedRestaurant.value !== 'all') {
      availableMenus = allMenus.filter(m => (m.RestaurantName || m.Restaurant) === selectedRestaurant.value);
      if (availableMenus.length === 0) {
        throw new Error(`ไม่พบเมนูอาหารสำหรับร้าน "${selectedRestaurant.value}"`);
      }
    }

    // 2. Fetch available rooms (QR Code)
    const qrSnapshot = await getDocs(collection(db, 'QRCode'));
    let rooms = [];
    if (!qrSnapshot.empty) {
      rooms = qrSnapshot.docs.map(doc => doc.data().RoomNumber).filter(Boolean);
    }
    if (rooms.length === 0) rooms = ['101', '102', '103', '201', '202'];

    message.value = `กำลังสร้างออเดอร์ (Mock ${orderCount.value} ออเดอร์)...`;
    
    let createdCount = 0;
    
    // Create mock orders
    for (let i = 0; i < orderCount.value; i++) {
      // Random room
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Random number of items (1 to 4)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      const restaurantsInOrder = new Set();
      let totalPrice = 0;

      for (let j = 0; j < numItems; j++) {
        const randomMenu = availableMenus[Math.floor(Math.random() * availableMenus.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const restName = randomMenu.RestaurantName || randomMenu.Restaurant || 'Unknown';
        
        const price = Number(randomMenu.Price || 0);
        totalPrice += price * qty;
        
        restaurantsInOrder.add(restName);
        
        orderItems.push({
          MenuId: randomMenu.id,
          MenuName: randomMenu.MenuName,
          Category: randomMenu.Category || '',
          RestaurantName: restName,
          Price: price,
          Quantity: qty,
          ImageUrl: randomMenu.ImageUrl || '',
          Note: Math.random() > 0.8 ? 'ขอเผ็ดๆ' : '',
          MenuStatus: 'received' // Setting to 'received' makes it fully complete and invisible to active order lists
        });
      }

      // Random date between selected range
      const startMs = start.getTime();
      const endMs = end.getTime();
      const randomMs = startMs + Math.random() * (endMs - startMs);
      const date = new Date(randomMs);
      
      const completedDate = new Date(date);
      completedDate.setMinutes(completedDate.getMinutes() + Math.floor(Math.random() * 20) + 10); // 10-30 mins prep time

      const orderRef = doc(collection(db, "Order"));
      const finalOrderNumber = orderRef.id.slice(0, 8).toUpperCase();

      const orderData = {
        OrderNumber: finalOrderNumber,
        RoomNumber: String(randomRoom),
        Menu: orderItems,
        OrderStatus: 'completed',
        TotalPrice: totalPrice,
        CreatedAt: Timestamp.fromDate(date),
        CompletedAt: Timestamp.fromDate(completedDate),
        RestaurantsInOrder: Array.from(restaurantsInOrder),
        PaymentMethod: 'promptpay',
        IsPaid: true,
      };

      await setDoc(orderRef, orderData);
      createdCount++;
    }

    message.value = `สร้างออเดอร์สำเร็จ ${createdCount} รายการ!`;

  } catch (error) {
    console.error(error);
    message.value = 'เกิดข้อผิดพลาด: ' + error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-lg text-center">
    <h1 class="text-3xl font-black text-blue-600 mb-4">สร้างข้อมูล Mock Orders</h1>
    <p class="text-gray-600 mb-6">ระบุจำนวนออเดอร์และช่วงเวลาที่ต้องการสุ่มสร้าง</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">ร้านอาหาร</label>
        <select v-model="selectedRestaurant" class="select select-bordered w-full">
          <option value="all">ทุกร้านอาหาร (สุ่มรวม)</option>
          <option v-for="rest in restaurantsList" :key="rest" :value="rest">
            {{ rest }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">จำนวนออเดอร์</label>
        <input type="number" v-model="orderCount" min="1" max="100" class="input input-bordered w-full" />
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">วันที่เริ่มต้น</label>
        <input type="date" v-model="startDate" class="input input-bordered w-full" />
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">วันที่สิ้นสุด</label>
        <input type="date" v-model="endDate" class="input input-bordered w-full" />
      </div>
    </div>

    <button 
      @click="generateOrders" 
      :disabled="loading"
      class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50 w-full md:w-auto"
    >
      <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
      {{ loading ? 'กำลังสร้างข้อมูล...' : 'Generate Mock Orders' }}
    </button>
    
    <div v-if="message" class="mt-6 p-4 rounded-lg font-bold" :class="message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : (message.includes('ผิดพลาด') || message.includes('กรุณา') || message.includes('ต้องไม่มากกว่า') ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700')">
      {{ message }}
    </div>
  </div>
</template>
