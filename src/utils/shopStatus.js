
export const getTimeDiffMinutes = (openTime, closeTime) => {
    if (!openTime || !closeTime) return 0;
    try {
        const [oH, oM] = openTime.split(':').map(Number);
        const [cH, cM] = closeTime.split(':').map(Number);
        const open = oH * 60 + oM;
        const close = cH * 60 + cM;
        if (close > open) return close - open;
        // ข้ามเที่ยงคืน
        return (1440 - open) + close;
    } catch {
        return 0;
    }
};


export const isMinimumTimeGap = (openTime, closeTime, minMinutes = 300) => {
    if (!openTime || !closeTime) return false;
    if (openTime === closeTime) return false;
    return getTimeDiffMinutes(openTime, closeTime) >= minMinutes;
};

export const getShopAutoStatus = (openTime, closeTime, openDays, now = new Date()) => {
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
    if (openDays && Array.isArray(openDays) && openDays.length > 0) {
        if (!openDays.includes(currentDay)) return 'close';
    }

    if (!openTime || !closeTime) return 'close';

    try {
        const minutesNow = now.getHours() * 60 + now.getMinutes();
        const [oH, oM] = openTime.split(':').map(Number);
        const [cH, cM] = closeTime.split(':').map(Number);
        const open = oH * 60 + oM;
        const close = cH * 60 + cM;

        if (close > open) {
            // Normal case (08:00 - 20:00)
            return (minutesNow >= open && minutesNow < close ? 'open' : 'close');
        } else {
            // Overnight case (18:00 - 02:00)
            return (minutesNow >= open || minutesNow < close ? 'open' : 'close');
        }
    } catch (e) {
        return 'close';
    }
};


export const checkShopClosed = (shop, now = new Date()) => {
    if (!shop) return true;


    if (shop.Status === 'open') return false;
    if (shop.Status === 'close') return true;


    return getShopAutoStatus(shop.OpenTime, shop.CloseTime, shop.OpenDays, now) === 'close';
};
