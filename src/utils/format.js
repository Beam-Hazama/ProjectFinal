/**
 * Formats a Firebase timestamp or Date object to a readable Thai locale string.
 * @param {any} timestamp - Firebase timestamp or Date.
 * @returns {string} - Formatted string (e.g., 03/05/2567 17:50:00).
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH');
  } catch (e) {
    return '-';
  }
};

/**
 * Formats a timestamp to full date and time for Thai locale.
 * @param {any} timestamp 
 * @returns {string} (e.g., 03/05/67 17:50)
 */
export const formatFullDateTime = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '-';
  }
};

/**
 * Formats a timestamp to only time string (HH:mm).
 * @param {any} timestamp 
 * @returns {string}
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '-';
  }
};

/**
 * Formats a numeric value as a Thai Baht currency string.
 * @param {number} value 
 * @returns {string}
 */
export const formatPrice = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('th-TH').format(value);
};

/**
 * Formats an array of day names to a Thai short name string.
 * @param {Array} daysArray 
 * @returns {string}
 */
export const formatOpenDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return 'ไม่ได้ระบุ';
  if (daysArray.length === 7) return 'ทุกวัน';

  const dayMap = {
    'Monday': 'จ.',
    'Tuesday': 'อ.',
    'Wednesday': 'พ.',
    'Thursday': 'พฤ.',
    'Friday': 'ศ.',
    'Saturday': 'ส.',
    'Sunday': 'อา.'
  };

  const sortedDaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const sortedSelected = [...daysArray].sort((a, b) => {
    return sortedDaysOrder.indexOf(a) - sortedDaysOrder.indexOf(b);
  });

  return sortedSelected.map(day => dayMap[day] || day).join(', ');
};
