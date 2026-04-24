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
          <h1 class="text-3xl font-bold text-slate-800">Commission</h1>
        </div>

        <div class="flex gap-3">
          
          <div class="flex items-center gap-2">
            <div v-if="dashboardStore.timeFilter === 'custom'" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                type="date" 
                class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500"
                :value="dashboardStore.customStartDate"
                @input="dashboardStore.setCustomDates($event.target.value, dashboardStore.customEndDate)"
              />
              <span class="text-slate-400 font-bold">-</span>
              <input 
                type="date" 
                class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500"
                :value="dashboardStore.customEndDate"
                @input="dashboardStore.setCustomDates(dashboardStore.customStartDate, $event.target.value)"
              />
            </div>

            <select
              class="select select-bordered select-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500"
              :value="dashboardStore.timeFilter" @change="dashboardStore.setTimeFilter($event.target.value)">
              <option value="today">วันนี้</option>
              <option value="7days">ย้อนหลัง 7 วัน</option>
              <option value="thisMonth">เดือนนี้</option>
              <option value="all">ทั้งหมด</option>
              <option value="custom">กำหนดเอง</option>
            </select>
          </div>
        </div>
      </div>

      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <p class="text-sm font-bold text-slate-500 mb-1">รายได้รวม</p>
           <h3 class="text-3xl font-black text-slate-800">฿{{ totalSystemRevenue.toLocaleString() }}</h3>
           <div class="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <div class="h-full bg-blue-500 w-full"></div>
           </div>
        </div>
        
        <div class="bg-indigo-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
           <p class="text-sm font-bold text-indigo-600 mb-1">ค่าธรรมเนียมรวม</p>
           <h3 class="text-3xl font-black text-indigo-700">฿{{ totalCommissions.toLocaleString() }}</h3>
           <p class="text-xs text-indigo-400 mt-2 font-medium">อัตราเฉลี่ย: {{ ( (totalCommissions / (totalSystemRevenue || 1)) * 100 ).toFixed(1) }}%</p>
        </div>

        <div class="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100">
           <p class="text-sm font-bold text-emerald-600 mb-1">ยอดสุทธิ</p>
           <h3 class="text-3xl font-black text-emerald-700">฿{{ totalNetPayout.toLocaleString() }}</h3>
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
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      :disabled="!isEditing"
                      :value="shop.rate"
                      @input="updateLocalRate(shop.name, $event.target.value)"
                      :class="[
                        'input input-sm input-bordered w-20 text-center font-bold',
                        isEditing ? 'text-indigo-600 border-indigo-200' : 'text-slate-400 bg-slate-50 border-transparent'
                      ]"
                    />
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
         
         <button @click="isEditing ? saveAll() : isEditing = true" 
           :class="[
             'btn border-none shadow-md rounded-xl transition-all font-bold gap-2 w-32',
             'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
           ]" 
           :disabled="commissionStore.loading">
           <span v-if="commissionStore.loading" class="loading loading-spinner loading-sm"></span>
           <template v-if="!isEditing">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

