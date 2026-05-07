export const DAYS_OF_WEEK = [
    { label: 'อา.', value: 'Sunday' },
    { label: 'จ.', value: 'Monday' },
    { label: 'อ.', value: 'Tuesday' },
    { label: 'พ.', value: 'Wednesday' },
    { label: 'พฤ.', value: 'Thursday' },
    { label: 'ศ.', value: 'Friday' },
    { label: 'ส.', value: 'Saturday' }
];

export const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',
    COOKING: 'cooking',
    DISPATCHED: 'dispatched',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
});

export const MENU_STATUS = Object.freeze({
    WAITING: 'waiting',
    PENDING: 'pending',
    COOKING: 'cooking',
    DISPATCHED: 'dispatched',
    RECEIVED: 'received',
    CANCELLED: 'cancelled',
});

export const SHOP_STATUS = Object.freeze({
    OPEN: 'open',
    CLOSE: 'close',
    AUTO: 'auto',
    BLOCKED: 'blocked',
});

export const USER_ROLE = Object.freeze({
    ADMIN: 'admin',
    RESTAURANT: 'restaurant',
});
