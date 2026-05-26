<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useDashboardStore } from '@/stores/admin/dashboard';
import { useCommissionStore } from '@/stores/admin/commission';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import { formatPrice } from '@/utils/format';

const dashboardStore = useDashboardStore();
const commissionStore = useCommissionStore();

onMounted(async () => {
  await dashboardStore.loadDashboardData();
  await commissionStore.loadCommissionRates();
});

onUnmounted(() => {
  commissionStore.clearListener();
  dashboardStore.clearListeners();
});

const tableData = computed(() => {
  return dashboardStore.revenueByRestaurant.map((item) => {

    const config =
      commissionStore.rates[item.name] || {};

    const rate =
      config.rate || 0;

    const cap =
      config.cap;

    let commission =
      (item.revenue * rate) / 100;

    // cap
    if (
      cap !== null &&
      cap !== undefined
    ) {
      commission = Math.min(
        commission,
        cap
      );
    }

    return {
      name: item.name,
      revenue: item.revenue,
      rate,
      cap,
      commission,
      net: item.revenue - commission,
    };
  });
});

const totalRevenue = computed(() =>
  tableData.value.reduce(
    (sum, r) => sum + r.revenue,
    0
  )
);

const totalCommissions = computed(() =>
  tableData.value.reduce(
    (sum, r) => sum + r.commission,
    0
  )
);

const totalNetPayout = computed(() =>
  tableData.value.reduce(
    (sum, r) => sum + r.net,
    0
  )
);
</script>

<template>
  <LayoutAdmin>

    <div class="p-6">

      <!-- HEADER -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-700">
          Commission
        </h1>
      </div>

      <!-- APPLY TO ALL -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">

        <div class="flex flex-col md:flex-row gap-4 items-start">

          <!-- RATE -->
          <div>

            <label class="block text-sm font-bold text-slate-700 mb-2">
              Commission Rate (%)
            </label>

            <input
              type="number"
              min="0"
              max="30"
              v-model="commissionStore.bulkRate"
              @input="if (Number($event.target.value) > 30) { commissionStore.bulkRate = 30; $event.target.value = 30; } else if (Number($event.target.value) < 0) { commissionStore.bulkRate = 0; $event.target.value = 0; }"
              class="input input-bordered w-40"
            />
            
            <p class="text-xs text-slate-400 mt-2">
              * กำหนดได้สูงสุดไม่เกิน 30%
            </p>

          </div>

          <!-- CAP -->
          <div>

            <label class="block text-sm font-bold text-slate-700 mb-2">
              Commission Cap
            </label>

            <input
              type="number"
              min="0"
              v-model="commissionStore.bulkCap"
              placeholder="No limit"
              class="input input-bordered w-44"
            />

          </div>

          <!-- APPLY -->
          <div class="pt-7">
            <button
              class="btn bg-indigo-500 hover:bg-indigo-600 text-white border-none"
              :disabled="commissionStore.loading"
              @click="commissionStore.applyCommissionToAll()"
            >

              <span
                v-if="commissionStore.loading"
                class="loading loading-spinner loading-sm"
              ></span>

              <template v-else>
                Apply To All
              </template>

            </button>
          </div>

        </div>

      </div>

      <!-- SUMMARY -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <!-- TOTAL REVENUE -->
        <div class="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <!-- Decorative BG -->
          <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
          
          <div class="relative z-10">
            <p class="text-xs font-medium text-slate-400 mb-1">
              ยอดขายรวม
            </p>
            <h3 class="text-2xl font-bold text-slate-800">
              ฿{{ formatPrice(totalRevenue) }}
            </h3>
          </div>

          <div class="relative z-10 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- TOTAL COMMISSION -->
        <div class="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <!-- Decorative BG -->
          <div class="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
          
          <div class="relative z-10">
            <p class="text-xs font-medium text-slate-400 mb-1">
              ค่าธรรมเนียมรวม
            </p>
            <h3 class="text-2xl font-bold text-rose-600">
              ฿{{ formatPrice(totalCommissions) }}
            </h3>
          </div>

          <div class="relative z-10 w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- NET -->
        <div class="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <!-- Decorative BG -->
          <div class="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
          
          <div class="relative z-10">
            <p class="text-xs font-medium text-slate-400 mb-1">
              ยอดสุทธิรวม
            </p>
            <h3 class="text-2xl font-bold text-emerald-600">
              ฿{{ formatPrice(totalNetPayout) }}
            </h3>
          </div>

          <div class="relative z-10 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div class="overflow-x-auto">

          <table class="table w-full">

            <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">

              <tr>

                <th class="py-4 pl-6">
                  Restaurant
                </th>

                <th class="text-right">
                  Revenue
                </th>

                <th class="text-right">
                  Rate
                </th>

                <th class="text-right">
                  Cap
                </th>

                <th class="text-right">
                  Commission
                </th>

                <th class="text-right">
                  Net Revenue
                </th>

              </tr>

            </thead>

            <tbody class="text-slate-600">

              <tr
                v-for="shop in tableData"
                :key="shop.name"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >

                <!-- NAME -->
                <td class="pl-6 py-4">

                  <div class="font-bold text-slate-800">
                    {{ shop.name }}
                  </div>

                </td>

                <!-- REVENUE -->
                <td class="text-right font-medium">

                  ฿{{ formatPrice(shop.revenue) }}

                </td>

                <!-- RATE -->
                <td class="text-right font-bold text-indigo-600">

                  {{ shop.rate }}%

                </td>

                <!-- CAP -->
                <td class="text-right font-medium">

                  <template v-if="shop.cap !== null">

                    ฿{{ formatPrice(shop.cap) }}

                  </template>

                  <template v-else>

                    -

                  </template>

                </td>

                <!-- COMMISSION -->
                <td class="text-right font-bold text-rose-600">

                  ฿{{ formatPrice(shop.commission) }}

                </td>

                <!-- NET -->
                <td class="text-right font-bold text-emerald-600">

                  ฿{{ formatPrice(shop.net) }}

                </td>

              </tr>

              <!-- LOADING -->
              <tr
                v-if="
                  dashboardStore.isLoading ||
                  commissionStore.loading
                "
              >

                <td
                  colspan="6"
                  class="text-center py-20 text-slate-400"
                >

                  <span class="loading loading-spinner loading-md mb-2"></span>

                  <p>
                    Calculating commissions...
                  </p>

                </td>

              </tr>

            </tbody>

            <!-- FOOTER -->
            <tfoot class="bg-slate-50/50">

              <tr>

                <th class="pl-6 py-4">
                  Totals
                </th>

                <th class="text-right">
                  ฿{{ formatPrice(totalRevenue) }}
                </th>

                <th></th>

                <th></th>

                <th class="text-right">
                  ฿{{ formatPrice(totalCommissions) }}
                </th>

                <th class="text-right">
                  ฿{{ formatPrice(totalNetPayout) }}
                </th>

              </tr>

            </tfoot>

          </table>

        </div>

      </div>

    </div>

  </LayoutAdmin>
</template>