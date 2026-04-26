<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useCommissionStore } from '@/stores/commissionStore';
import LayoutAdmin from '@/page/Admin/Admin.vue';

const dashboardStore = useDashboardStore();
const commissionStore = useCommissionStore();

const localRates = ref({});
const isEditing = ref(false);

onMounted(async () => {

  await dashboardStore.loadDashboardData();
  await commissionStore.loadCommissionRates();

  localRates.value = { ...commissionStore.rates };
});

onUnmounted(() => {
  commissionStore.clearListener();
  dashboardStore.clearListeners();
});

const restaurantData = computed(() => {
  if (!dashboardStore.availableRestaurants) return [];

  const revenueMap = {};

  dashboardStore.allOrders.forEach(order => {

  });


  const map = {};
  dashboardStore.allOrders.forEach(order => {

    if (order.statusOrder === 'cancelled' || order.statusOrder === 'returned') return;

  });


  return dashboardStore.availableRestaurants.map(restName => {

    let revenue = 0;
    dashboardStore.allOrders.forEach(order => {

      if (order.statusOrder !== 'cancelled' && order.statusOrder !== 'returned') {
        if (order.Menu && Array.isArray(order.Menu)) {
          order.Menu.forEach(item => {
            if (item.Restaurant === restName && item.itemStatus !== 'cancelled') {
              revenue += (Number(item.Price || 0) * Number(item.Quantity || 1));
            }
          });
        } else if (order.Restaurant === restName) {
          revenue += Number(order.localTotal || 0);
        }
      }
    });

    const rate = localRates.value[restName] !== undefined ? localRates.value[restName] : (commissionStore.rates[restName] || 0);
    const commission = (revenue * rate) / 100;

    return {
      name: restName,
      revenue,
      rate,
      commission,
      net: revenue - commission
    };
  });
});

const totalSystemRevenue = computed(() => {
  return restaurantData.value.reduce((sum, r) => sum + r.revenue, 0);
});

const totalCommissions = computed(() => {
  return restaurantData.value.reduce((sum, r) => sum + r.commission, 0);
});

const totalNetPayout = computed(() => {
  return restaurantData.value.reduce((sum, r) => sum + r.net, 0);
});

const updateLocalRate = (name, val) => {
  localRates.value[name] = Number(val);
};

const saveAll = async () => {
  try {
    await commissionStore.saveRates(localRates.value);
    isEditing.value = false;
    alert('Rates saved successfully');
  } catch (e) {
    alert('Error saving rates: ' + e.message);
  }
};

const cancelEdit = () => {
  localRates.value = { ...commissionStore.rates };
  isEditing.value = false;
};

watch(() => commissionStore.rates, (newRates) => {

  if (Object.keys(localRates.value).length === 0) {
    localRates.value = { ...newRates };
  }
}, { deep: true, immediate: true });

</script>

<template>
  <LayoutAdmin>
    <div class="p-6">

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-700">Commission</h1>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div v-if="dashboardStore.timeFilter === 'custom'"
            class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full sm:w-auto">
            <input type="date"
              class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full"
              :value="dashboardStore.customStartDate"
              @input="dashboardStore.setCustomDates($event.target.value, dashboardStore.customEndDate)" />
            <span class="text-slate-400 font-bold">-</span>
            <input type="date"
              class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full"
              :value="dashboardStore.customEndDate"
              @input="dashboardStore.setCustomDates(dashboardStore.customStartDate, $event.target.value)" />
          </div>

          <div class="dropdown dropdown-end w-full sm:w-auto">
            <label tabindex="0"
              class="btn btn-sm bg-white border-slate-200 text-slate-600 font-normal hover:bg-slate-50 w-full justify-between lg:min-w-[140px] h-[36px] min-h-[36px] px-4 rounded-xl shadow-sm">
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                </svg>
                <span v-if="dashboardStore.timeFilter === 'today'">วันนี้</span>
                <span v-else-if="dashboardStore.timeFilter === '7days'">ย้อนหลัง 7 วัน</span>
                <span v-else-if="dashboardStore.timeFilter === 'thisMonth'">เดือนนี้</span>
                <span v-else-if="dashboardStore.timeFilter === 'all'">ทั้งหมด</span>
                <span v-else-if="dashboardStore.timeFilter === 'custom'">กำหนดเอง</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 opacity-40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </label>
            <ul tabindex="0"
              class="dropdown-content z-[20] menu p-2 shadow-xl border border-slate-100 bg-base-100 rounded-2xl w-56 mt-2 flex-nowrap">
              <li v-for="filter in [
                { id: 'today', label: 'วันนี้' },
                { id: '7days', label: 'ย้อนหลัง 7 วัน' },
                { id: 'thisMonth', label: 'เดือนนี้' },
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'custom', label: 'กำหนดเอง' }
              ]" :key="filter.id">
                <label class="label cursor-pointer flex justify-start gap-3 py-2.5 px-4 rounded-xl transition-colors hover:bg-slate-50"
                  :class="{ 'bg-indigo-50/50': dashboardStore.timeFilter === filter.id }">
                  <input type="checkbox" :checked="dashboardStore.timeFilter === filter.id"
                    @change="dashboardStore.setTimeFilter(filter.id); $event.target.blur()"
                    class="checkbox checkbox-sm checkbox-primary rounded-full border-indigo-600" />
                  <span class="label-text font-medium"
                    :class="dashboardStore.timeFilter === filter.id ? 'text-indigo-600' : 'text-slate-600'">{{ filter.label }}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">รายได้รวม</p>
              <h3 class="text-3xl font-black text-slate-800">฿{{ totalSystemRevenue.toLocaleString() }}</h3>
              <div class="mt-4 flex items-center gap-2">
                <div class="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 w-full animate-pulse"></div>
                </div>
                <span class="text-[10px] font-bold text-indigo-500 uppercase">Gross Revenue</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ค่าธรรมเนียมรวม</p>
              <h3 class="text-3xl font-black text-rose-600">฿{{ totalCommissions.toLocaleString() }}</h3>
              <p class="text-xs font-bold text-rose-400 mt-4 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                Avg Rate: {{ ((totalCommissions / (totalSystemRevenue || 1)) * 100).toFixed(1) }}%
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ยอดสุทธิรวม</p>
              <h3 class="text-3xl font-black text-emerald-600">฿{{ totalNetPayout.toLocaleString() }}</h3>
              
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th class="py-4 pl-6">Restaurant</th>
                <th class="text-right">Revenue</th>
                <th class="text-center w-32">Rate (%)</th>
                <th class="text-right">Commission</th>
                <th class="text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody class="text-slate-600">
              <tr v-for="shop in restaurantData" :key="shop.name"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="pl-6 py-4">
                  <div class="font-bold text-slate-800">{{ shop.name }}</div>
                </td>
                <td class="text-right font-medium">
                  ฿{{ shop.revenue.toLocaleString() }}
                </td>
                <td class="text-center">
                  <div class="flex items-center justify-center gap-2">
                    <input type="number" min="0" max="100" :disabled="!isEditing" :value="shop.rate"
                      @input="updateLocalRate(shop.name, $event.target.value)" :class="[
                        'input input-sm input-bordered w-20 text-center font-bold',
                        isEditing ? 'text-indigo-600 border-indigo-200' : 'text-slate-400 bg-slate-50 border-transparent'
                      ]" />
                  </div>
                </td>
                <td class="text-right font-bold text-indigo-600">
                  ฿{{ shop.commission.toLocaleString() }}
                </td>
                <td class="text-right font-bold text-emerald-600">
                  ฿{{ shop.net.toLocaleString() }}
                </td>
              </tr>

              <tr v-if="restaurantData.length === 0">
                <td colspan="5" class="text-center py-20 text-slate-400">
                  <span class="loading loading-spinner loading-md mb-2"></span>
                  <p>Calculating commissions...</p>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50/50">
              <tr>
                <th class="pl-6 py-4">Totals</th>
                <th class="text-right">฿{{ totalSystemRevenue.toLocaleString() }}</th>
                <th></th>
                <th class="text-right">฿{{ totalCommissions.toLocaleString() }}</th>
                <th class="text-right">฿{{ totalNetPayout.toLocaleString() }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


      <div class="mt-6 flex justify-end gap-3">
        <button v-if="isEditing" @click="cancelEdit"
          class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl w-32 transition-all font-bold"
          :disabled="commissionStore.loading">
          Cancel
        </button>

        <button @click="isEditing ? saveAll() : isEditing = true" :class="[
          'btn border-none shadow-md rounded-xl transition-all font-bold gap-2 w-32',
          'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
        ]" :disabled="commissionStore.loading">
          <span v-if="commissionStore.loading" class="loading loading-spinner loading-sm"></span>
          <template v-if="!isEditing">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit
          </template>
          <template v-else>
            Save
          </template>
        </button>
      </div>
    </div>
  </LayoutAdmin>
</template>

