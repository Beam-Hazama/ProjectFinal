import { toDayKey } from '@/utils/format';

/**
 * Calculates the time range (start and end dates) based on a filter.
 * @param {string} filter - 'today', '7days', 'thisMonth', or 'custom'.
 * @param {string|Date} customStart - Custom start date.
 * @param {string|Date} customEnd - Custom end date.
 * @returns {Object} { start, end } as Date objects.
 */
export const getTimeRange = (filter, customStart, customEnd) => {
    const now = new Date();
    let start = new Date(0);
    
    if (filter === 'today') {
        start = new Date(now); 
        start.setHours(0, 0, 0, 0);
    } else if (filter === '7days') {
        start = new Date(now); 
        start.setDate(start.getDate() - 6); 
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'custom' && customStart) {
        start = new Date(customStart); 
        start.setHours(0, 0, 0, 0);
    }
    
    const end = filter === 'custom' && customEnd
        ? new Date(new Date(customEnd).setHours(23, 59, 59, 999))
        : new Date(new Date(now).setHours(23, 59, 59, 999));
    
    return { start, end };
};

/**
 * Builds daily revenue data for the last 7 days.
 * @param {Array} orders - List of order objects.
 * @param {Function} getRevenueFromOrder - Callback to calculate revenue for a single order.
 * @returns {Array} List of { date, revenue } objects.
 */
export const buildDailyRevenue = (orders, getRevenueFromOrder) => {
    const days = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days[toDayKey(d)] = 0;
    }
    
    orders.forEach(order => {
        if (!order.CreatedAt) return;
        const date = order.CreatedAt.toDate?.() || new Date(order.CreatedAt);
        const key = toDayKey(date);
        if (days[key] !== undefined) {
            days[key] += getRevenueFromOrder(order);
        }
    });
    
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
};

/**
 * Builds peak hours data (count per hour).
 * @param {Array} orders - List of order objects.
 * @returns {Array} List of { hour, count } objects.
 */
export const buildPeakHours = (orders) => {
    const hours = Array(24).fill(0);
    orders.forEach(order => {
        if (!order.CreatedAt) return;
        const date = order.CreatedAt.toDate?.() || new Date(order.CreatedAt);
        hours[date.getHours()]++;
    });
    const result = hours.map((count, hour) => ({ 
        hour: `${String(hour).padStart(2, '0')}:00`, 
        count 
    }));
    // Add 24:00 as a duplicate of 00:00 for chart continuity if needed
    result.push({ hour: '24:00', count: hours[0] });
    return result;
};

/**
 * Builds category distribution statistics.
 * @param {Array} menus - List of menu objects.
 * @returns {Array} List of { name, count } objects sorted by count.
 */
export const buildCategoryStats = (menus) => {
    const counts = {};
    menus.forEach(m => {
        const cat = m.Category || 'อื่นๆ';
        counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
};

/**
 * Helper to check if an order falls within a given time range.
 * @param {Object} order - Order object.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @returns {boolean}
 */
export const isOrderInTimeRange = (order, start, end) => {
    const createdAt = order.CreatedAt;
    if (!createdAt) return false;
    const orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return orderDate >= start && orderDate <= end;
};
