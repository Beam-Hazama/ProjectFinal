<script setup>
defineProps({
  dashboardStore: Object
});
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <div class="text-3xl font-bold text-slate-700">Dashboard</div>

    <div class="flex lg:flex-row flex-col gap-2 w-full lg:w-auto mt-4 md:mt-0 items-center">
      <div class="dropdown w-full lg:w-max">
        <label tabindex="0" class="btn btn-sm bg-white border-slate-200 text-slate-600 font-normal hover:bg-slate-50 w-full justify-between lg:min-w-[120px] h-[32px] min-h-[32px] px-3">
          <span v-if="dashboardStore.timeFilter === 'today'">วันนี้</span>
          <span v-else-if="dashboardStore.timeFilter === '7days'">ย้อนหลัง 7 วัน</span>
          <span v-else-if="dashboardStore.timeFilter === 'thisMonth'">เดือนนี้</span>
          <span v-else-if="dashboardStore.timeFilter === 'all'">ทั้งหมด</span>
          <span v-else-if="dashboardStore.timeFilter === 'custom'">กำหนดเอง</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" /></svg>
        </label>
        <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-xl border border-slate-100 bg-base-100 rounded-box w-56 mt-2 flex-nowrap">
          <li v-for="filter in ['today', '7days', 'thisMonth', 'all', 'custom']" :key="filter">
            <label class="label cursor-pointer flex justify-start gap-3 py-2" :class="{'bg-slate-100': dashboardStore.timeFilter === filter}">
              <input type="checkbox" :checked="dashboardStore.timeFilter === filter" @change="dashboardStore.setTimeFilter(filter); $event.target.blur()" class="checkbox checkbox-sm checkbox-primary rounded-full border-indigo-600" />
              <span class="label-text whitespace-normal font-medium leading-tight" :class="dashboardStore.timeFilter === filter ? 'text-slate-800' : 'text-slate-600'">
                {{ filter === 'today' ? 'วันนี้' : filter === '7days' ? 'ย้อนหลัง 7 วัน' : filter === 'thisMonth' ? 'เดือนนี้' : filter === 'all' ? 'ทั้งหมด' : 'กำหนดเอง' }}
              </span>
            </label>
          </li>
        </ul>
      </div>

      <div v-if="dashboardStore.timeFilter === 'custom'" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
        <input type="date" class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
          :value="dashboardStore.customStartDate" @input="dashboardStore.setCustomDates($event.target.value, dashboardStore.customEndDate)" />
        <span class="text-slate-400 font-bold">-</span>
        <input type="date" class="input input-bordered input-sm bg-white border-slate-200 text-slate-600 focus:outline-none focus:border-indigo-500 w-full lg:w-max"
          :value="dashboardStore.customEndDate" @input="dashboardStore.setCustomDates(dashboardStore.customStartDate, $event.target.value)" />
      </div>

      <div class="w-px h-5 bg-slate-200 hidden lg:block mx-1"></div>

      <div v-if="dashboardStore.restaurantFilters" class="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
        <div class="dropdown w-full lg:w-auto">
          <label tabindex="0" class="btn btn-sm bg-white border-slate-200 text-slate-600 font-normal hover:bg-slate-50 w-full justify-between lg:min-w-[160px] h-[32px] min-h-[32px] px-3">
            <span v-if="dashboardStore.restaurantFilters.length === 0">ทุกร้านอาหาร</span>
            <span v-else class="text-indigo-600">เลือกแล้ว {{ dashboardStore.restaurantFilters.length }} ร้าน</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" /></svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-xl border border-slate-100 bg-base-100 rounded-box w-72 max-h-[60vh] overflow-y-auto mt-2 flex-nowrap">
            <li class="sticky top-0 bg-base-100 z-10 border-b border-slate-100 pb-1 mb-1">
              <a @click="dashboardStore.clearRestaurantFilters()" class="text-rose-500 font-medium justify-center py-2" :class="{ 'opacity-50 pointer-events-none': dashboardStore.restaurantFilters.length === 0 }">ล้างการเลือกทั้งหมด</a>
            </li>
            <li v-for="restaurant in dashboardStore.availableRestaurants" :key="restaurant">
              <label class="label cursor-pointer flex justify-start gap-3 py-2">
                <input type="checkbox" :checked="dashboardStore.restaurantFilters.includes(restaurant)" @change="dashboardStore.toggleRestaurantFilter(restaurant)" class="checkbox checkbox-sm checkbox-primary rounded-full border-indigo-600" />
                <span class="label-text whitespace-normal font-medium leading-tight text-slate-600">{{ restaurant }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="dashboardStore.availableCategories && dashboardStore.availableCategories.length > 0" class="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
        <div class="dropdown w-full lg:w-auto">
          <label tabindex="0" class="btn btn-sm bg-white border-slate-200 text-slate-600 font-normal hover:bg-slate-50 w-full justify-between lg:min-w-[140px] h-[32px] min-h-[32px] px-3">
            <span v-if="dashboardStore.menuCategoryFilters.length === 0">ทุกหมวดหมู่</span>
            <span v-else class="text-indigo-600">หมวดหมู่: {{ dashboardStore.menuCategoryFilters.length }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-xl border border-slate-100 bg-base-100 rounded-box w-60 max-h-[50vh] overflow-y-auto mt-2 flex-nowrap">
            <li class="sticky top-0 bg-base-100 z-10 border-b border-slate-100 pb-1 mb-1">
              <a @click="dashboardStore.clearCategoryFilters()" class="text-rose-500 font-medium justify-center py-2" :class="{ 'opacity-50 pointer-events-none': dashboardStore.menuCategoryFilters.length === 0 }">ล้างหมวดหมู่</a>
            </li>
            <li v-for="cat in dashboardStore.availableCategories" :key="cat">
              <label class="label cursor-pointer flex justify-start gap-3 py-2">
                <input type="checkbox" :checked="dashboardStore.menuCategoryFilters.includes(cat)" @change="dashboardStore.toggleCategoryFilter(cat)" class="checkbox checkbox-sm checkbox-primary rounded-full border-indigo-600" />
                <span class="label-text whitespace-normal font-medium leading-tight text-slate-600">{{ cat }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="dashboardStore.availableMenus && dashboardStore.availableMenus.length > 0" class="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
        <div class="dropdown w-full lg:w-auto">
          <label tabindex="0" class="btn btn-sm bg-white border-slate-200 text-slate-600 font-normal hover:bg-slate-50 w-full justify-between lg:min-w-[140px] h-[32px] min-h-[32px] px-3">
            <span v-if="dashboardStore.menuFilters.length === 0">ทุกเมนู</span>
            <span v-else class="text-indigo-600">เมนูที่เลือก: {{ dashboardStore.menuFilters.length }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-xl border border-slate-100 bg-base-100 rounded-box w-64 max-h-[50vh] overflow-y-auto mt-2 flex-nowrap">
            <li class="sticky top-0 bg-base-100 z-10 border-b border-slate-100 pb-1 mb-1">
              <a @click="dashboardStore.clearMenuFilters()" class="text-rose-500 font-medium justify-center py-2" :class="{ 'opacity-50 pointer-events-none': dashboardStore.menuFilters.length === 0 }">ล้างเมนู</a>
            </li>
            <li v-for="menu in dashboardStore.availableMenus" :key="menu.id">
              <label class="label cursor-pointer flex justify-start gap-3 py-2">
                <input type="checkbox" :checked="dashboardStore.menuFilters.includes(menu.id)" @change="dashboardStore.toggleMenuFilter(menu.id)" class="checkbox checkbox-sm checkbox-primary rounded-full border-indigo-600" />
                <span class="label-text whitespace-normal font-medium leading-tight text-slate-600">{{ menu.Name }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <button v-if="dashboardStore.hasActiveFilters" @click="dashboardStore.clearAllFilters ? dashboardStore.clearAllFilters() : dashboardStore.clearRestaurantFilters()" class="btn btn-sm bg-rose-50 text-rose-500 border-none font-medium hover:bg-rose-100 h-[32px] min-h-[32px] px-4 shadow-sm ml-1">ล้างทั้งหมด</button>
    </div>
  </div>
</template>
