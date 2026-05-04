/**
 * Checks if a restaurant is closed based on its status and opening hours.
 * @param {Object} shop The restaurant document data.
 * @param {Date} [now=new Date()] The current date/time to check against.
 * @returns {boolean} True if the shop is closed, false if open.
 */
export const checkShopClosed = (shop, now = new Date()) => {
  if (!shop) return true;
  
  // Explicit status check
  if (shop.Status === 'close') return true;
  if (shop.Status === 'open') return false;

  // Auto status or fallback to time check
  if (!shop.OpenTime || !shop.CloseTime) return true;

  try {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDayName = now.toLocaleString('en-US', { weekday: 'long' });

    // Check opening days if provided
    if (shop.OpenDays && Array.isArray(shop.OpenDays) && shop.OpenDays.length > 0) {
      if (!shop.OpenDays.includes(currentDayName)) {
        return true;
      }
    }

    const [openH, openM] = shop.OpenTime.split(':').map(Number);
    const [closeH, closeM] = shop.CloseTime.split(':').map(Number);
    
    if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) {
      return true;
    }

    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (closeMin > openMin) {
      // Normal hours (e.g., 08:00 - 20:00)
      return !(currentTime >= openMin && currentTime < closeMin);
    } else {
      // Overnight hours (e.g., 18:00 - 02:00)
      return !(currentTime >= openMin || currentTime < closeMin);
    }
  } catch (e) {
    console.error("Error checking shop closed status:", e);
    return true;
  }
};
