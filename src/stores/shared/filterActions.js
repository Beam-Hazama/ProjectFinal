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

  toggleCategoryFilter(category) {
    const index = this.menuCategoryFilters.indexOf(category);
    if (index > -1) this.menuCategoryFilters.splice(index, 1);
    else this.menuCategoryFilters.push(category);
    this.applyFilters();
  },

  clearCategoryFilters() {
    this.menuCategoryFilters = [];
    this.applyFilters();
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
