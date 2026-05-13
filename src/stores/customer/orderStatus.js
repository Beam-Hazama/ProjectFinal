import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useOrderlistStore } from "@/stores/shared/orderList";
import { useMenuStore } from "@/stores/shared/menu";
import { formatPrice } from "@/utils/format";
import { filterRecentOrders } from "@/utils/orderHelpers";

// สถานะของเมนูที่ตั้งเป็นค่าคงที่เพื่อให้ความหมายชัดเจน
const FINISHED = ["received", "cancelled"];
const ACTIVE_COOKING = ["cooking"];
const COMPLETED = ["received", "cancelled"];

// Helper functions สำหรับตรวจสอบสถานะ
const has = (items, statuses) =>
  items.some((i) => statuses.includes(i.MenuStatus));
const all = (items, statuses) =>
  items.every((i) => statuses.includes(i.MenuStatus));

export const useUserStatusStore = defineStore("userStatus", () => {
  const orderListStore = useOrderlistStore();
  const menuStore = useMenuStore();

  const room = ref("");

  const setLocation = (r) => {
    room.value = r;
  };

  const displayLocation = computed(() => {
    return `ห้อง ${room.value}`;
  });

  const roomOrders = computed(() => {
    const recentOrders = filterRecentOrders(
      orderListStore.list,
      room.value,
      12,
    );
    return recentOrders.filter((order) => {
      const hasActiveItems = (order.Menu || []).some(
        (item) => !COMPLETED.includes(item.MenuStatus),
      );
      return hasActiveItems;
    });
  });

  const markItemAsReceived = async (orderId, itemId, itemIndex, router) => {
    await orderListStore.updateSingleMenuStatus(
      orderId,
      itemId,
      itemIndex,
      "received",
    );

    let stillHasActive = false;
    for (const order of roomOrders.value) {
      for (let i = 0; i < (order.Menu || []).length; i++) {
        const item = order.Menu[i];
        const isClickedItem =
          order.id === orderId &&
          (itemId ? item.cartItemId === itemId : i === itemIndex);

        if (!isClickedItem && !COMPLETED.includes(item.MenuStatus)) {
          stillHasActive = true;
          break;
        }
      }
      if (stillHasActive) break;
    }

    if (!stillHasActive) {
      router.push(`/user/bill/${room.value}`);
    }
  };

  const getOrderProgress = (order) => {
    const items = order.Menu || [];
    if (items.length === 0) return 0;

    if (has(items, ["received"]) || all(items, FINISHED)) return 3;
    if (has(items, ["dispatched"])) return 2;
    if (has(items, ACTIVE_COOKING)) return 1;

    return 0;
  };

  const getItemCountByStage = (order, stage) => {
    const items = order.Menu || [];
    switch (stage) {
      case 0:
        return items.filter((i) => !i.MenuStatus || i.MenuStatus === "pending")
          .length;
      case 1:
        return items.filter((i) => ACTIVE_COOKING.includes(i.MenuStatus))
          .length;
      case 2:
        return items.filter((i) => i.MenuStatus === "dispatched").length;
      case 3:
        return items.filter((i) => FINISHED.includes(i.MenuStatus)).length;
      default:
        return 0;
    }
  };

  const initUserSession = (r) => {
    setLocation(r);
    orderListStore.loadOrderUser(r);
    menuStore.loadMenu();
  };

  return {
    room,
    displayLocation,
    roomOrders,
    formatPrice,
    markItemAsReceived,
    getOrderProgress,
    getItemCountByStage,
    initUserSession,
  };
});
