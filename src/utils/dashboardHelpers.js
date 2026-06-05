import { toDayKey } from '@/utils/format';


export const getTimeRange = (filter, customStart, customEnd) => {
    const now = new Date();
    let start = new Date(0);
    
    if (filter === 'today') {
        start = new Date(now); 
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'previousMonth') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'all') {
        start = new Date(2000, 0, 1);
        start.setHours(0, 0, 0, 0);
    } else if (filter === 'custom' && customStart) {
        start = new Date(customStart); 
        start.setHours(0, 0, 0, 0);
    }
    
    let end;

    if (filter === 'custom' && customEnd) {
        end = new Date(new Date(customEnd).setHours(23, 59, 59, 999));

    } else if (filter === 'previousMonth') {
        end = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999
        );

    } else {
        end = new Date(new Date(now).setHours(23, 59, 59, 999));
    }
    return { start, end };
};


export const buildDailyRevenue = (orders, getRevenueFromOrder, start, end) => {
    const days = {};
    const curr = new Date(start);
    curr.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (curr <= last) {
        days[toDayKey(new Date(curr))] = 0;
        curr.setDate(curr.getDate() + 1);
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


export const buildMonthlyRevenue = (orders, getRevenueFromOrder, start, end) => {
    const months = {};
    const curr = new Date(start);
    curr.setDate(1);
    curr.setHours(0, 0, 0, 0);
    const last = new Date(end);
    
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    while (curr <= last || (curr.getFullYear() === last.getFullYear() && curr.getMonth() <= last.getMonth())) {
        const key = `${monthNames[curr.getMonth()]}`;
        months[key] = 0;
        curr.setMonth(curr.getMonth() + 1);
    }
    
    orders.forEach(order => {
        if (!order.CreatedAt) return;
        const date = order.CreatedAt.toDate?.() || new Date(order.CreatedAt);
        const key = `${monthNames[date.getMonth()]}`;
        if (months[key] !== undefined) {
            months[key] += getRevenueFromOrder(order);
        }
    });
    
    return Object.entries(months).map(([date, revenue]) => ({ date, revenue }));
};


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
    result.push({ hour: '24:00', count: hours[0] });
    return result;
};

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


export const isOrderInTimeRange = (order, start, end) => {
    const createdAt = order.CreatedAt;
    if (!createdAt) return false;
    
    let orderDate;
    if (createdAt.toDate) {
        orderDate = createdAt.toDate();
    } else if (typeof createdAt === 'string' && createdAt.includes('/')) {
        // Handle DD/MM/YYYY or DD/MM/BE
        const parts = createdAt.split(' ');
        const dateParts = parts[0].split('/');
        let day = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]) - 1;
        let year = parseInt(dateParts[2]);
        
        // If year is BE (e.g. 2569), convert to AD (2026)
        if (year > 2400) year -= 543;
        
        if (parts[1]) {
            const timeParts = parts[1].split(':');
            orderDate = new Date(year, month, day, parseInt(timeParts[0]), parseInt(timeParts[1]));
        } else {
            orderDate = new Date(year, month, day);
        }
    } else {
        orderDate = new Date(createdAt);
    }
    
    return orderDate >= start && orderDate <= end;
};

export const extractUniqueCategories = (menus) =>
    [...new Set(menus.map(m => m.Category).filter(c => c && c.trim() !== ''))];

export const getSortedRecentOrders = (orders, limit = 10) =>
    [...orders].sort((a, b) => {
        const timeA = a.CreatedAt?.toMillis ? a.CreatedAt.toMillis() : new Date(a.CreatedAt).getTime();
        const timeB = b.CreatedAt?.toMillis ? b.CreatedAt.toMillis() : new Date(b.CreatedAt).getTime();
        return timeB - timeA;
    }).slice(0, limit);

export const getTopMenuItems = (metricsMap) =>
    Object.values(metricsMap).sort((a, b) => b.revenue - a.revenue);

export const addMenuMetric = (map, menuId, item, itemRev) => {
    if (!map[menuId]) {
        map[menuId] = { name: item.MenuName, qty: 0, revenue: 0, image: item.ImageUrl, category: item.Category, restaurantName: item.RestaurantName || item.Restaurant };
    }
    map[menuId].qty += Number(item.Quantity || 1);
    map[menuId].revenue += itemRev;
};
