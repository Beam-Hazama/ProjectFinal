import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOrderlistStore } from '@/stores/orderlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useMenuStore } from '@/stores/menuStore';
import { app, db, messaging as defaultMessaging } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { showBrowserNotification } from '@/utils/notification';
import { formatPrice } from '@/utils/format';

export const useUserStatusStore = defineStore('userStatus', () => {
    const orderListStore = useOrderlistStore();
    const cartStore = useCartStore();
    const menuStore = useMenuStore();

    const IS_NOTIFICATION_ENABLED = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const notificationPermission = ref(
        ('Notification' in window) ? Notification.permission : 'unsupported'
    );

    const room = ref('');

    const setLocation = (r) => {
        room.value = r;
    };

    const displayLocation = computed(() => {
        return `ห้อง ${room.value}`;
    });

    const roomOrders = computed(() => {
        const twelveHoursAgo = Math.floor(Date.now() / 1000) - (12 * 60 * 60);
        return orderListStore.list.filter(order => {
            const isOwner = order.room === room.value;
            if (!isOwner) return false;

            // Filter by time (handle pending server timestamps by using current time as fallback)
            const createdAtSeconds = order.CreatedAt?.seconds || Math.floor(Date.now() / 1000);
            if (createdAtSeconds < twelveHoursAgo) return false;

            const hasActiveItems = (order.Menu || []).some(item =>
                !['received', 'cancelled'].includes(item.itemStatus)
            );

            return hasActiveItems;
        });
    });

    const getMenuName = (id) => {
        const menu = menuStore.list.find(m => m.id === id);
        return menu ? menu.Name : 'เมนู (ไม่ทราบชื่อ)';
    };

    const markItemAsReceived = async (orderId, itemId, itemIndex, router) => {
        await orderListStore.updateSingleItemStatus(orderId, itemId, itemIndex, 'received');

        let stillHasActive = false;
        for (const order of roomOrders.value) {
            for (let i = 0; i < (order.Menu || []).length; i++) {
                const item = order.Menu[i];
                const isClickedItem = (order.id === orderId) && (itemId ? item.cartItemId === itemId : i === itemIndex);

                if (!isClickedItem && !['received', 'cancelled'].includes(item.itemStatus)) {
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
            item.itemStatus !== 'cancelled'
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

        const anyReceived = items.some(i => i.itemStatus === 'received');
        const allFinished = items.every(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus));

        if (anyReceived || allFinished) return 3;

        const anyDispatched = items.some(i => i.itemStatus === 'dispatched');
        if (anyDispatched) return 2;

        const anyCooking = items.some(i => ['pending', 'cooking'].includes(i.itemStatus));
        if (anyCooking) return 1;

        return 0;
    };

    const getItemCountByStage = (order, stage) => {
        const items = order.Menu || [];
        switch (stage) {
            case 0: return items.filter(i => !i.itemStatus || i.itemStatus === 'waiting').length;
            case 1: return items.filter(i => ['pending', 'cooking'].includes(i.itemStatus)).length;
            case 2: return items.filter(i => i.itemStatus === 'dispatched').length;
            case 3: return items.filter(i => ['received', 'cancelled', 'returned'].includes(i.itemStatus)).length;
            default: return 0;
        }
    };

    const registerPushToken = async () => {
        if (!IS_NOTIFICATION_ENABLED) return;
        let activeMessaging = defaultMessaging;
        if (!activeMessaging) {
            try {
                activeMessaging = getMessaging(app);
            } catch (e) {
                console.log('FCM not supported');
                return;
            }
        }

        try {
            const currentToken = await getToken(activeMessaging, {
                vapidKey: 'BEMBQXbqVMk-b5ofr7Cpw9fCfQpbWY5K83C6KorO9DIA4XHJMApg-O-6_mcmhVvVvoCZajUBDQjQRJd4IOFhjgU'
            });

            if (currentToken && roomOrders.value.length > 0) {
                for (const order of roomOrders.value) {
                    const orderRef = doc(db, 'Order', order.id);
                    await updateDoc(orderRef, {
                        deviceTokens: arrayUnion(currentToken)
                    });
                }
            }
        } catch (err) {
            // Silence messaging errors on localhost as they are expected due to SSL/ServiceWorker requirements
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Notification system is disabled on localhost (requires HTTPS).');
            } else {
                console.error('Auto fetch token error:', err);
            }
        }
    };

    const requestNotificationPermission = async () => {
        if (!IS_NOTIFICATION_ENABLED) {
            alert('ระบบแจ้งเตือนถูกปิดการใช้งานชั่วคราวครับ');
            return;
        }
        if (!('Notification' in window)) {
            alert('ระบบแจ้งเตือนไม่ทำงาน: เบราว์เซอร์ไม่มีฟังก์ชัน Notification (อาจจะไม่ได้เป็น https)');
            return;
        }

        let activeMessaging = defaultMessaging;
        if (!activeMessaging) {
            try {
                activeMessaging = getMessaging(app);
            } catch (e) {
                alert('ระบบ Web Push ไม่ทำงาน: ' + e.message);
                return;
            }
        }

        try {
            const permission = await Notification.requestPermission();
            notificationPermission.value = permission;
            if (permission === 'granted') {
                await registerPushToken();
                alert('เปิดแจ้งเตือนสำเร็จ! ระบบจะเตือนเมื่อร้านอัปเดตออเดอร์');
            } else {
                alert('การแจ้งเตือนถูกปฏิเสธ หากต้องการเปิดให้ไปตั้งค่าในเบราว์เซอร์');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการขอสิทธิ์: ' + err.message);
            console.error('Permission request error:', err);
        }
    };

    const initUserSession = (r) => {
        setLocation(r);
        orderListStore.loadOrderUser(r);
        menuStore.loadMenu();

        if (IS_NOTIFICATION_ENABLED) {
            setTimeout(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    registerPushToken();

                    const activeMessaging = defaultMessaging || getMessaging(app);
                    onMessage(activeMessaging, (payload) => {
                        console.log('Message received. ', payload);
                        if (payload.notification) {
                            showBrowserNotification(payload.notification.title, payload.notification.body);
                        }
                    });
                }
            }, 3000);
        }
    };

    return {
        room,
        IS_NOTIFICATION_ENABLED,
        notificationPermission,
        displayLocation,
        roomOrders,
        formatPrice,
        getMenuName,
        markItemAsReceived,
        reorder,
        getOrderProgress,
        getItemCountByStage,
        registerPushToken,
        requestNotificationPermission,
        initUserSession
    };
});
