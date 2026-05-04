<script setup>
defineProps({
  dashboardStore: Object
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div v-if="dashboardStore.topRestaurants" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        5 อันดับร้านอาหารขายดี
      </h2>
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-slate-500">
              <th>อันดับ</th>
              <th>ร้านอาหาร</th>
              <th class="text-right">ยอดขาย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rest, index) in dashboardStore.topRestaurants" :key="rest.name" class="hover:bg-slate-50 transition-colors">
              <td class="font-bold text-slate-400">
                <span v-if="index === 0" class="text-yellow-500 text-lg">🥇</span>
                <span v-else-if="index === 1" class="text-slate-400 text-lg">🥈</span>
                <span v-else-if="index === 2" class="text-amber-700 text-lg">🥉</span>
                <span v-else>#{{ index + 1 }}</span>
              </td>
              <td class="font-medium text-slate-700">{{ rest.name }}</td>
              <td class="text-right font-bold text-emerald-600">฿{{ rest.revenue.toLocaleString() }}</td>
            </tr>
            <tr v-if="dashboardStore.topRestaurants.length === 0">
              <td colspan="3" class="text-center py-4 text-slate-400">ไม่มีข้อมูลการขาย</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" :class="{'lg:col-span-2': !dashboardStore.topRestaurants}">
      <h2 class="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
        5 อันดับเมนูยอดฮิต
      </h2>
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-slate-500">
              <th>เมนู</th>
              <th v-if="dashboardStore.topRestaurants">ร้านอาหาร</th>
              <th class="text-right">จำนวน (จาน)</th>
              <th class="text-right">ยอดขาย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in dashboardStore.topMenuItems" :key="menu.name + (menu.restaurant || '')" class="hover:bg-slate-50 transition-colors">
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
              <td v-if="dashboardStore.topRestaurants" class="text-xs text-slate-500">{{ menu.restaurant }}</td>
              <td class="text-right font-bold text-blue-600">{{ menu.qty }}</td>
              <td class="text-right font-bold text-emerald-600">฿{{ menu.revenue.toLocaleString() }}</td>
            </tr>
            <tr v-if="dashboardStore.topMenuItems.length === 0">
              <td :colspan="dashboardStore.topRestaurants ? 4 : 3" class="text-center py-4 text-slate-400">ไม่มีข้อมูลการสั่งซื้อ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
