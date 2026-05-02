import { defineStore } from 'pinia';

export const useFormatTimestampStore = defineStore('formatTimestamp', {
  actions: {
    formatTimestamp(timestamp) {
      if (!timestamp) return '-';
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('th-TH');
      } catch (e) {
        return '-';
      }
    }
  }
});
