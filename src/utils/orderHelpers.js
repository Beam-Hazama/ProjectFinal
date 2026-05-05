/**
 * Computes the aggregate status of an order based on the MenuStatus of its items.
 * @param {Array} items - List of menu items in the order
 * @returns {string} - The aggregate status ('pending', 'cooking', 'dispatched', 'completed', 'cancelled')
 */
export const computeLocalStatus = (items) => {
    if (!items || items.length === 0) return 'pending';

    // All items cancelled -> Order cancelled
    if (items.every(i => i.MenuStatus === 'cancelled')) {
        return 'cancelled';
    }

    // All items received or cancelled -> Order completed
    if (items.every(i => ['received', 'cancelled'].includes(i.MenuStatus))) {
        return 'completed';
    }

    // All items dispatched, received or cancelled -> Order dispatched (for restaurant list view)
    if (items.every(i => ['dispatched', 'received', 'cancelled'].includes(i.MenuStatus))) {
        return 'dispatched';
    }

    // Any item being cooked or dispatched -> Order in progress (cooking)
    if (items.some(i => ['cooking', 'dispatched'].includes(i.MenuStatus))) {
        return 'cooking';
    }

    // Default status
    return 'pending';
};

/**
 * Returns the CSS classes for a status badge.
 * @param {string} status - The status to get color for
 * @returns {string} - CSS classes
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: 'badge-info text-white',
        cooking: 'bg-orange-500 text-white border-none',
        dispatched: 'bg-amber-500 text-white border-none',
        completed: 'badge-success text-white',
        received: 'badge-success text-white',
        cancelled: 'badge-error text-white',
        waiting: 'badge-ghost text-slate-400',
    };
    return colors[status] || 'badge-ghost text-slate-500';
};

/**
 * Filters orders based on room number and recency.
 * @param {Array} orders - List of orders
 * @param {string} room - Room number
 * @param {number} [hours=12] - Number of hours to look back
 * @returns {Array} - Filtered orders
 */
export const filterRecentOrders = (orders, room, hours = 12) => {
    if (!orders) return [];
    const cutoff = Math.floor(Date.now() / 1000) - (hours * 60 * 60);
    return orders.filter(o => {
        const isOwner = o.Roomnumber === room;
        if (!isOwner) return false;

        // Filter by time (handle pending server timestamps by using current time as fallback)
        const createdAtSeconds = o.CreatedAt?.seconds || Math.floor(Date.now() / 1000);
        return createdAtSeconds >= cutoff;
    });
};

/**
 * Sort orders by CreatedAt timestamp.
 * @param {Array} orders - List of orders
 * @param {'asc'|'desc'} [direction='desc'] - 'desc' = newest first, 'asc' = oldest first
 * @returns {Array} - New sorted array (does not mutate input)
 */
export const sortOrdersByDate = (orders, direction = 'desc') => {
    if (!orders) return [];
    const factor = direction === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
        const aSec = a.CreatedAt?.seconds || 0;
        const bSec = b.CreatedAt?.seconds || 0;
        return (aSec - bSec) * factor;
    });
};

/**
 * Derive the global order status from all menu items' statuses.
 * ใช้กฎ "items ที่คืบหน้าน้อยที่สุดกำหนดสถานะรวม" — ถ้ายังมี item ที่ pending อยู่ ออเดอร์ก็ pending
 * (ต่างจาก computeLocalStatus ที่มอง "ความสำเร็จ" ส่วน deriveOrderStatus มอง "ความคืบหน้า")
 * @param {Array} items - Menu items
 * @returns {string} - 'pending' | 'cooking' | 'dispatched' | 'completed' | 'cancelled'
 */
export const deriveOrderStatus = (items) => {
    if (!items?.length) return 'pending';

    // ถ้าทุก item ถูกยกเลิก → ออเดอร์ถูกยกเลิก
    if (items.every(i => (i.MenuStatus || 'waiting') === 'cancelled')) return 'cancelled';

    // ลำดับขั้นของสถานะ (เลขน้อย = ก้าวหน้าน้อย)
    const rank = { waiting: 0, pending: 0, cooking: 1, dispatched: 2, received: 3 };
    const rankToStatus = ['pending', 'cooking', 'dispatched', 'completed'];

    // หา rank ต่ำสุดในกลุ่ม items ที่ยังไม่ถูกยกเลิก
    const activeRanks = items
        .filter(i => (i.MenuStatus || 'waiting') !== 'cancelled')
        .map(i => rank[i.MenuStatus] ?? 0);

    if (activeRanks.length === 0) return 'cancelled';
    return rankToStatus[Math.min(...activeRanks)];
};
