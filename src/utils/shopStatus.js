/**
 * Computes the auto-status (open/close) of a restaurant based on its times and days.
 * @param {string} openTime - e.g. "08:00"
 * @param {string} closeTime - e.g. "20:00"
 * @param {Array} openDays - e.g. ["Monday", "Tuesday"]
 * @param {Date} [now=new Date()] - current time
 * @returns {string} - 'open' or 'close'
 */
export const getAutoStatus = (openTime, closeTime, openDays, now = new Date()) => {
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
            // Normal case (e.g. 08:00 - 20:00)
            return (minutesNow >= open && minutesNow < close ? 'open' : 'close');
        } else {
            // Overnight case (e.g. 18:00 - 02:00)
            return (minutesNow >= open || minutesNow < close ? 'open' : 'close');
        }
    } catch (e) {
        return 'close';
    }
};

/**
 * Checks if a restaurant is closed, considering ManualStatus.
 * @param {Object} shop - The restaurant data
 * @param {Date} [now=new Date()] - current time
 * @returns {boolean} - true if closed, false if open
 */
export const checkShopClosed = (shop, now = new Date()) => {
    if (!shop) return true;
    if (shop.ManualStatus === 'manual') return shop.Status === 'close';
    return getAutoStatus(shop.OpenTime, shop.CloseTime, shop.OpenDays, now) === 'close';
};
