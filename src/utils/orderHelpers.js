export const getCompletionStatus = (items) => {
    if (items.every(i => i.MenuStatus === 'cancelled')) {
        return 'cancelled';
    }
    if (items.every(i => ['received', 'cancelled'].includes(i.MenuStatus))) {
        return 'completed';
    }
    if (items.every(i => ['dispatched', 'received', 'cancelled'].includes(i.MenuStatus))) {
        return 'dispatched';
    }
    if (items.some(i => ['cooking', 'dispatched'].includes(i.MenuStatus))) {
        return 'cooking';
    }
    return 'pending';
};

export const getStatusColor = (status) => {
    const colors = {
        pending: 'badge-info text-white',
        cooking: 'bg-orange-500 text-white border-none',
        dispatched: 'bg-amber-500 text-white border-none',
        completed: 'badge-success text-white',
        received: 'badge-success text-white',
        cancelled: 'badge-error text-white',
    };
    return colors[status] || 'badge-ghost text-slate-500';
};

export const filterRecentOrders = (orders, room, hours = 12) => {
    if (!orders) return [];
    const cutoff = Math.floor(Date.now() / 1000) - (hours * 60 * 60);
    return orders.filter(o => {
        const isOwner = String(o.RoomNumber) === String(room);
        if (!isOwner) return false;
        const createdAtSeconds = o.CreatedAt?.seconds || Math.floor(Date.now() / 1000);
        return createdAtSeconds >= cutoff;
    });
};

export const sortOrdersByDate = (orders, direction = 'desc') => {
    if (!orders) return [];
    const factor = direction === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
        const aSec = a.CreatedAt?.seconds || 0;
        const bSec = b.CreatedAt?.seconds || 0;
        return (aSec - bSec) * factor;
    });
};

export const getProgressStatus = (items) => {
    if (!items?.length) return 'pending';

    // ถ้าทุก item ถูกยกเลิก → ออเดอร์ถูกยกเลิก
    if (items.every(i => i.MenuStatus === 'cancelled')) return 'cancelled';

    // ลำดับขั้นของสถานะ 
    const rank = { pending: 0, cooking: 1, dispatched: 2, received: 3 };
    const rankToStatus = ['pending', 'cooking', 'dispatched', 'completed'];

    // หา rank ต่ำสุดในกลุ่ม items ที่ยังไม่ถูกยกเลิก
    const activeRanks = items
        .filter(i => i.MenuStatus !== 'cancelled')
        .map(i => rank[i.MenuStatus] ?? 0);

    if (activeRanks.length === 0) return 'cancelled';
    return rankToStatus[Math.min(...activeRanks)];
};
