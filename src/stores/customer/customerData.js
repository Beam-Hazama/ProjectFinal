import { defineStore } from "pinia";
import { useMenuStore } from "@/stores/shared/menu";
import { useRestaurant } from "@/stores/shared/restaurant";
import { useCartStore } from "@/stores/customer/cart";
import { useCategoryStore } from "@/stores/shared/category";

export const useCustomerDataStore = defineStore("customerDataStore", {
  state: () => ({
    isInitialLoaded: false,
    isLoading: false,
    error: null,
  }),

  actions: {
    async loadAllData() {
      if (this.isLoading) return;

      const menuStore = useMenuStore();
      const restaurantStore = useRestaurant();
      const cartStore = useCartStore();
      const categoryStore = useCategoryStore();

      this.isLoading = true;
      this.error = null;

      const promises = [];

      if (menuStore.list.length === 0) {
        promises.push(menuStore.loadMenu());
      }
      if (restaurantStore.list.length === 0) {
        promises.push(restaurantStore.loadRestaurants());
      }
      if (categoryStore.list.length === 0) {
        promises.push(categoryStore.fetchCategories());
      }
      
      if (cartStore.room && cartStore.room !== "-" && cartStore.room !== "undefined") {
        promises.push(cartStore.loadCart(cartStore.room));
      }

      try {
        await Promise.all(promises);
        this.isInitialLoaded = true;
      } catch (error) {
        console.error("Customer Data Store load failure:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
