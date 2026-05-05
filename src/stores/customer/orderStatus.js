import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOrderlistStore } from '@/stores/shared/orderlist';
import { useCartStore } from '@/stores/customer/cart';
import { useMenuStore } from '@/stores/shared/menu';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatPrice } from '@/utils/format';
import { filterRecentOrders } from '@/utils/orderHelpers';

// สถานะของเมนูที่ตั้งเป็นค่าคงที่เพื่อให้ความหมายชัดเจน
const FINISHED = ['received', 'cancelled'];
const ACTIVE_COOKING = ['pending', 'cooking'];
const COMPLETED = ['received', 'cancelled'];

// Helper functions สำหรับตรวจสอบสถานะ
const has = (items, statuses) => items.some(i => statuses.includes(i.MenuStatus));
const all = (items, statuses) => items.every(i => statuses.includes(i.MenuStatus));

export const useUserStatusStore = defineStore('userStatus', () => {
    const orderListStore = useOrderlistStore();
    const cartStore = useCartStore();
    const menuStore = useMenuStore();


    const room = ref('');

    const setLocation = (r) => {
        room.value = r;
    };

    const displayLocation = computed(() => {
        return `ห้อง ${room.value}`;
    });

    const roomOrders = computed(() => {
        const recentOrders = filterRecentOrders(orderListStore.list, room.value, 12);
        return recentOrders.filter(order => {
            const hasActiveItems = (order.Menu || []).some(item =>
                !COMPLETED.includes(item.MenuStatus)
            );
            return hasActiveItems;
        });
    });


    const markItemAsReceived = async (orderId, itemId, itemIndex, router) => {
        await orderListStore.updateSingleMenuStatus(orderId, itemId, itemIndex, 'received');

        let stillHasActive = false;
        for (const order of roomOrders.value) {
            for (let i = 0; i < (order.Menu || []).length; i++) {
                const item = order.Menu[i];
                const isClickedItem = (order.id === orderId) && (itemId ? item.cartItemId === itemId : i === itemIndex);

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

    const reorder = async (order, router) => {
        const validItems = (order.Menu || []).filter(item =>
            item.MenuStatus !== 'cancelled'
        );

        cartStore.loadCart(room.value);

        let addedCount = 0;
        let unavailableNames = [];

        for (const item of validItems) {
            const menuId = item.menuId || item.id;
            try {
                const menuRef = doc(db, 'Menu', menuId);
                const menuSnap = await getDoc(menuRef);

                if (menuSnap.exists()) {
                    const menuData = menuSnap.data();
                    if (menuData.Status === 'open') {
                        cartStore.addOrUpdateItem(item, item.Quantity, item.note || '');
                        addedCount++;
                    } else {
                        unavailableNames.push(item.Name);
                    }
                } else {
                    unavailableNames.push(item.Name);
                }
            } catch (err) {
                console.error("Error checking menu availability:", err);
                unavailableNames.push(item.Name);
            }
        }

        if (unavailableNames.length > 0) {
            alert(`เมนูต่อไปนี้หมดหรือถูกปิดการขายชั่วคราว ไม่สามารถสั่งได้ในขณะนี้`);
        }

        if (addedCount > 0) {
            router.push(`/user/cart/${room.value}`);
        }
    };

    const getOrderProgress = (order) => {
        const items = order.Menu || [];
        if (items.length === 0) return 0;

        if (has(items, ['received']) || all(items, FINISHED)) return 3;
        if (has(items, ['dispatched'])) return 2;
        if (has(items, ACTIVE_COOKING)) return 1;

        return 0;
    };

    const getItemCountByStage = (order, stage) => {
        const items = order.Menu || [];
        switch (stage) {
            case 0: return items.filter(i => !i.MenuStatus || i.MenuStatus === 'waiting').length;
            case 1: return items.filter(i => ACTIVE_COOKING.includes(i.MenuStatus)).length;
            case 2: return items.filter(i => i.MenuStatus === 'dispatched').length;
            case 3: return items.filter(i => FINISHED.includes(i.MenuStatus)).length;
            default: return 0;
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
        getMenuName: menuStore.getMenuNameById,
        markItemAsReceived,
        reorder,
        getOrderProgress,
        getItemCountByStage,
        initUserSession
    };
});
