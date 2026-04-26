<script setup>
defineProps({
  dashboardStore: Object
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Top Menus -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
        5 อันดับเมนูยอดฮิตของคุณ
      </h2>
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-slate-500">
              <th>เมนู</th>
              <th class="text-right">จำนวน (จาน)</th>
              <th class="text-right">ยอดขาย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in dashboardStore.topMenuItems" :key="menu.name" class="hover:bg-slate-50 transition-colors">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">
                    <div class="mask mask-squircle w-8 h-8 bg-slate-100">
                      <img v-if="menu.image" :src="menu.image" />
                      <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">IMG</span>
                    </div>
                  </div>
                  <div class="font-medium text-slate-700">{{ menu.name }}</div>
                </div>
              </td>
              <td class="text-right font-bold text-blue-600">{{ menu.qty }}</td>
              <td class="text-right font-bold text-emerald-600">฿{{ menu.revenue.toLocaleString() }}</td>
            </tr>
            <tr v-if="dashboardStore.topMenuItems.length === 0">
              <td colspan="3" class="text-center py-4 text-slate-400">ไม่มีข้อมูลการสั่งซื้อ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
        10 ออเดอร์ล่าสุด
      </h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="text-slate-500 bg-slate-50">
              <th class="rounded-l-lg">ออเดอร์ #</th>
              <th>เวลา</th>
              <th>ยอดรวม</th>
              <th class="rounded-r-lg">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in dashboardStore.recentOrders" :key="order.id" class="hover:bg-slate-50 transition-colors border-b border-slate-50">
              <td class="font-bold text-slate-700">#{{ order.OrderNumber || order.id.substring(0, 6).toUpperCase() }}</td>
              <td class="text-sm text-slate-500">
                {{ order.CreatedAt?.toDate ? order.CreatedAt.toDate().toLocaleString('th-TH') : new Date(order.CreatedAt).toLocaleString('th-TH') }}
              </td>
              <td class="font-bold text-emerald-600">฿{{ Number(order.localTotal || 0).toLocaleString() }}</td>
              <td>
                <div class="badge badge-sm font-medium border-0" :class="{
                  'bg-amber-100 text-amber-700': order.statusOrder === 'pending' || !order.statusOrder,
                  'bg-blue-100 text-blue-700': order.statusOrder === 'preparing' || order.statusOrder === 'cooking',
                  'bg-emerald-100 text-emerald-700': order.statusOrder === 'completed',
                  'bg-rose-100 text-rose-700': order.statusOrder === 'cancelled' || order.statusOrder === 'returned'
                }">
                  {{ order.statusOrder === 'pending' || !order.statusOrder ? 'รอดำเนินการ' :
                     order.statusOrder === 'preparing' || order.statusOrder === 'cooking' ? 'กำลังเตรียม' :
                     order.statusOrder === 'completed' ? 'เสร็จสิ้น' :
                     order.statusOrder === 'cancelled' || order.statusOrder === 'returned' ? 'ยกเลิก' : order.statusOrder }}
                </div>
              </td>
            </tr>
            <tr v-if="dashboardStore.recentOrders.length === 0">
              <td colspan="4" class="text-center py-8 text-slate-400">ยังไม่มีประวัติออเดอร์ในส่วนนี้</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
