export const sharedFilterActions = {
  setTimeFilter(filter) {
    this.timeFilter = filter;
    this.applyFilters();
  },

  setCustomDates(start, end) {
    this.customStartDate = start;
    this.customEndDate = end;
    if (this.timeFilter === 'custom') this.applyFilters();
  },


  toggleMenuFilter(id) {
    const index = this.menuFilters.indexOf(id);
    if (index > -1) this.menuFilters.splice(index, 1);
    else this.menuFilters.push(id);
    this.applyFilters();
  },

  clearMenuFilters() {
    this.menuFilters = [];
    this.applyFilters();
  },
};
