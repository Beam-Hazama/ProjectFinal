import { onMounted, getCurrentInstance } from "vue";
import { useMenuStore } from "@/stores/shared/menu";
import { useRestaurant } from "@/stores/shared/restaurant";
import { useCartStore } from "@/stores/customer/cart";
import { useCategoryStore } from "@/stores/shared/category";
import { useCustomerDataStore } from "@/stores/customer/customerData";

export const useCustomerData = (room) => {
  const menuStore = useMenuStore();
  const restaurantStore = useRestaurant();
  const cartStore = useCartStore();
  const categoryStore = useCategoryStore();
  const customerDataStore = useCustomerDataStore();

  const loadData = async () => {

    if (room && room !== "-" && room !== "undefined") {
      cartStore.setRoom(room);
    }
    await customerDataStore.loadAllData();
  };


  if (getCurrentInstance()) {
    onMounted(() => {
      loadData();
    });
  }

  return {
    menuStore,
    restaurantStore,
    cartStore,
    categoryStore,
    customerDataStore,
    loadData,
  };
};
