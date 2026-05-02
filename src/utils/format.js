export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('th-TH');
  } catch (e) {
    return '-';
  }
};

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

export const formatPrice = (value) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('th-TH').format(value);
};

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
