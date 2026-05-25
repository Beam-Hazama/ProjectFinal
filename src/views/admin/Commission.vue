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

        <div class="flex flex-col md:flex-row gap-4 items-end">

          <!-- RATE -->
          <div>

            <label class="block text-sm font-bold text-slate-700 mb-2">
              Commission Rate (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              v-model="commissionStore.bulkRate"
              class="input input-bordered w-40"
            />

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

      <!-- SUMMARY -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <!-- TOTAL REVENUE -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

          <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
            รายได้รวม
          </p>

          <h3 class="text-3xl font-black text-slate-800">
            ฿{{ formatPrice(totalRevenue) }}
          </h3>

        </div>

        <!-- TOTAL COMMISSION -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

          <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
            ค่าธรรมเนียมรวม
          </p>

          <h3 class="text-3xl font-black text-rose-600">
            ฿{{ formatPrice(totalCommissions) }}
          </h3>

        </div>

        <!-- NET -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

          <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
            ยอดสุทธิรวม
          </p>

          <h3 class="text-3xl font-black text-emerald-600">
            ฿{{ formatPrice(totalNetPayout) }}
          </h3>

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