import { defineStore } from "pinia";
import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Dashboard Store
 * ──────────────
 * รวมข้อมูลสถิติของระบบทั้งหมดเพื่อให้ admin ดูภาพรวมธุรกิจ
 * 
 * Flow:
 *   1. โหลด orders + restaurants + menus จาก Firestore (realtime)
 *   2. user เลือก filter (เช่น "เดือนนี้", "ร้าน A")
 *   3. applyFilters() คำนวณตัวเลขใหม่ตาม filter
 *   4. UI ดึงค่าจาก state ไปแสดงเป็น stats / chart / table
 * 
 * ใช้กับ:
 *   - Admin/Dashboard.vue (สถิติรายได้)
 *   - Admin/Commission.vue (ข้อมูล revenue ต่อร้าน)
 */

// ─── Helper Functions สำหรับการคำนวณสถิติ ───

function getStartTime(timeFilter, customStart) {
  const now = new Date();
  if (timeFilter === 'today') return new Date(now.setHours(0, 0, 0, 0));
  if (timeFilter === '7days') return new Date(now.setDate(now.getDate() - 6));
  if (timeFilter === 'thisMonth') return new Date(now.setDate(1), now.setHours(0, 0, 0, 0));
  if (timeFilter === 'custom' && customStart) return new Date(customStart);
  return new Date(0);
}

function isOrderInTimeRange(order, start, end) {
  const createdAt = order.CreatedAt;
  if (!createdAt) return false;
  const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return orderDate >= start && orderDate <= end;
}

function calculateOrderRevenue(order, restaurantFilters = []) {
  if (order.statusOrder === 'cancelled' || order.statusOrder === 'returned') return 0;
  
  // ถ้าไม่มีการระบุ Menu (Order เก่า) ใช้ localTotal ที่คำนวณมาแล้ว
  if (!order.Menu || order.Menu.length === 0) {
    return restaurantFilters.length === 0 ? Number(order.localTotal || 0) : 0;
  }

  // คำนวณยอดรวมจากรายการเมนูที่ผ่าน filter ร้านค้า และสถานะไม่ถูกยกเลิก
  return order.Menu
    .filter(item => {
      const isRightRestaurant = restaurantFilters.length === 0 || restaurantFilters.includes(item.Restaurant);
      const isNotCancelled = item.itemStatus !== 'cancelled' && item.itemStatus !== 'returned';
      return isRightRestaurant && isNotCancelled;
    })
    .reduce((sum, item) => sum + (Number(item.Price || 0) * Number(item.Quantity || 1)), 0);
}

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    allOrders: [],
    allMenus: [],
    allRestaurants: [],

    timeFilter: "thisMonth",
    customStartDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
    customEndDate: new Date().toISOString().split("T")[0],
    restaurantFilters: [],

    totalOrders: 0,
    totalRevenue: 0,
    totalMenus: 0,
    totalRestaurants: 0,
    totalCommission: 0,
    netPayouts: 0,

    topRestaurants: [],
    topMenuItems: [],
    recentOrders: [],
    orderStatuses: { pending: 0, preparing: 0, completed: 0, cancelled: 0 },

    revenueByDay: [],
    categoriesCount: [],
    ordersByHour: [],

    availableRestaurants: [],

    ordersLoading: true,
    menusLoading: true,
    restaurantsLoading: true,

    unsubscribeOrders: null,
    unsubscribeMenus: null,
    unsubscribeRestaurants: null,
  }),

  getters: {
    isLoading: (state) => state.ordersLoading || state.menusLoading || state.restaurantsLoading,
    
    salesChartSeries: (state) => [{ name: "ยอดขาย (บาท)", data: state.revenueByDay.map((day) => day.revenue) }],
    categoryChartSeries: (state) => state.categoriesCount.map((cat) => cat.count),
    peakHoursChartSeries: (state) => [{ name: "จำนวนออเดอร์", data: state.ordersByHour.map((h) => h.count) }],
    
    hasActiveFilters: (state) => state.restaurantFilters.length > 0,

    // ข้อมูลรายได้แยกตามร้านค้า (สำหรับใช้ใน Commission)
    revenueByRestaurant: (state) => {
      const restMap = {};
      state.allRestaurants.forEach(r => restMap[r.Name] = 0);
      
      const start = getStartTime(state.timeFilter, state.customStartDate);
      const end = state.timeFilter === 'custom' ? new Date(state.customEndDate).setHours(23, 59, 59, 999) : new Date().setHours(23, 59, 59, 999);

      state.allOrders
        .filter(o => isOrderInTimeRange(o, start, end))
        .forEach(order => {
          if (order.Menu && order.statusOrder !== 'cancelled') {
            order.Menu.forEach(item => {
              if (item.itemStatus !== 'cancelled' && restMap[item.Restaurant] !== undefined) {
                restMap[item.Restaurant] += (Number(item.Price || 0) * Number(item.Quantity || 1));
              }
            });
          }
        });

      return Object.entries(restMap).map(([name, revenue]) => ({ name, revenue }));
    }
  },

  actions: {
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.applyFilters();
    },

    toggleRestaurantFilter(name) {
      const index = this.restaurantFilters.indexOf(name);
      if (index > -1) this.restaurantFilters.splice(index, 1);
      else this.restaurantFilters.push(name);
      this.applyFilters();
    },

    clearRestaurantFilters() {
      this.restaurantFilters = [];
      this.applyFilters();
    },

    setCustomDates(start, end) {
      this.customStartDate = start;
      this.customEndDate = end;
      if (this.timeFilter === "custom") this.applyFilters();
    },

    applyFilters() {
      const start = getStartTime(this.timeFilter, this.customStartDate);
      const end = this.timeFilter === "custom" ? new Date(this.customEndDate).setHours(23, 59, 59, 999) : new Date().setHours(23, 59, 59, 999);

      // กรองออเดอร์ตามเวลาและร้านค้า
      const filteredOrders = this.allOrders.filter(o => isOrderInTimeRange(o, start, end));
      
      // คำนวณสรุปยอด (Stats)
      let revenue = 0;
      let commission = 0;
      const statusCounts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
      const menuMetrics = {};
      const restRevenue = {};

      const restRateMap = {};
      this.allRestaurants.forEach(r => restRateMap[r.Name] = Number(r.CommissionRate || 0));

      filteredOrders.forEach(order => {
        const orderRev = calculateOrderRevenue(order, this.restaurantFilters);
        if (orderRev > 0 || this.restaurantFilters.length === 0) {
          revenue += orderRev;
          
          // คำนวณ Commission รายไอเทม
          if (order.Menu) {
            order.Menu.forEach(item => {
              if (item.itemStatus !== 'cancelled' && (this.restaurantFilters.length === 0 || this.restaurantFilters.includes(item.Restaurant))) {
                const itemRev = Number(item.Price || 0) * Number(item.Quantity || 1);
                commission += (itemRev * (restRateMap[item.Restaurant] || 0)) / 100;
                
                // เก็บข้อมูลสำหรับ Top Menu
                const menuId = item.id || item.menuId;
                if (!menuMetrics[menuId]) menuMetrics[menuId] = { name: item.Name, qty: 0, revenue: 0 };
                menuMetrics[menuId].qty += Number(item.Quantity || 1);
                menuMetrics[menuId].revenue += itemRev;

                // เก็บข้อมูลสำหรับ Top Restaurant
                restRevenue[item.Restaurant] = (restRevenue[item.Restaurant] || 0) + itemRev;
              }
            });
          }

          const status = order.statusOrder || 'pending';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        }
      });

      this.totalRevenue = revenue;
      this.totalCommission = commission;
      this.netPayouts = revenue - commission;
      this.totalOrders = filteredOrders.length;
      this.orderStatuses = statusCounts;

      // จัดอันดับ
      this.topRestaurants = Object.entries(restRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
      this.topMenuItems = Object.values(menuMetrics).sort((a,b) => b.qty - a.qty).slice(0, 5);
      this.recentOrders = [...filteredOrders].sort((a,b) => (b.CreatedAt?.seconds || 0) - (a.CreatedAt?.seconds || 0)).slice(0, 10);

      // สร้างข้อมูล Chart
      this.buildDailyRevenueChart(filteredOrders);
      this.buildPeakHoursChart(filteredOrders);
      this.buildCategoryStats(this.allMenus);
    },

    async loadDashboardData() {
      this.clearListeners();
      const ordersQuery = query(collection(db, "Order"));
      this.unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        this.allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.ordersLoading = false;
        this.applyFilters();
      });

      const menusQuery = query(collection(db, "Menu"));
      this.unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
        this.allMenus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.menusLoading = false;
        this.applyFilters();
      });

      const restaurantsQuery = query(collection(db, "Restaurant"));
      this.unsubscribeRestaurants = onSnapshot(restaurantsQuery, (snapshot) => {
        this.allRestaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.availableRestaurants = this.allRestaurants.map(r => r.Name);
        this.restaurantsLoading = false;
        this.applyFilters();
      });
    },

    clearListeners() {
      if (this.unsubscribeOrders) this.unsubscribeOrders();
      if (this.unsubscribeMenus) this.unsubscribeMenus();
      if (this.unsubscribeRestaurants) this.unsubscribeRestaurants();
    },

    buildDailyRevenueChart(orders) {
      const days = {};
      const today = new Date();
      today.setHours(0,0,0,0);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days[`${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`] = 0;
      }
      orders.forEach(o => {
        const rev = calculateOrderRevenue(o, this.restaurantFilters);
        const date = o.CreatedAt?.toDate?.() || new Date(o.CreatedAt);
        const key = `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}`;
        if (days[key] !== undefined) days[key] += rev;
      });
      this.revenueByDay = Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
    },

    buildCategoryStats(menus) {
      const counts = {};
      menus.forEach(m => counts[m.Category || "อื่นๆ"] = (counts[m.Category || "อื่นๆ"] || 0) + 1);
      this.categoriesCount = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    },

    buildPeakHoursChart(orders) {
      const hours = Array(24).fill(0);
      orders.forEach(o => {
        const date = o.CreatedAt?.toDate?.() || new Date(o.CreatedAt);
        hours[date.getHours()]++;
      });
      this.ordersByHour = hours.map((count, i) => ({ hour: `${i.toString().padStart(2,"0")}:00`, count }));
    }
  }
});
