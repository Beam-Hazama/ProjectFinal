// Helper function to convert Firebase timestamp or anything to Date object
const toDate = (timestamp) => {
  if (!timestamp) return null;
  try {
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  } catch (e) {
    return null;
  }
};

/**
 * Formats a Firebase timestamp or Date object to a readable Thai locale string.
 * @param {any} timestamp - Firebase timestamp or Date.
 * @returns {string} - Formatted string (e.g., 03/05/2567 17:50:00).
 */
export const formatTimestamp = (timestamp) => 
  toDate(timestamp)?.toLocaleString('th-TH') ?? '-';

/**
 * Formats a timestamp to full date and time for Thai locale.
 * @param {any} timestamp 
 * @returns {string} (e.g., 03/05/67 17:50)
 */
export const formatFullDateTime = (timestamp) => 
  toDate(timestamp)?.toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) ?? '-';

/**
 * Formats a timestamp to only time string (HH:mm).
 * @param {any} timestamp 
 * @returns {string}
 */
export const formatTime = (timestamp) => 
  toDate(timestamp)?.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  }) ?? '-';

/**
 * Converts a Date object to a "DD/MM" string.
 * @param {Date} date 
 * @returns {string}
 */
export const toDayKey = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
};

/**
 * Formats a numeric value as a Thai Baht currency string.
 * @param {number} value 
 * @returns {string}
 */
export const formatPrice = (value) => 
  new Intl.NumberFormat('th-TH').format(Number(value) || 0);

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
