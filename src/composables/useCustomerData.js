import { onMounted, getCurrentInstance } from "vue";
import { useMenuStore } from "@/stores/shared/menu";
import { useRestaurant } from "@/stores/shared/restaurant";
import { useCartStore } from "@/stores/customer/cart";
import { useCategoryStore } from "@/stores/shared/category";

/**
 * Composable to load basic customer-side data (menu, restaurant list, cart, and categories)
 */
export const useCustomerData = (room) => {
  const menuStore = useMenuStore();
  const restaurantStore = useRestaurant();
  const cartStore = useCartStore();
  const categoryStore = useCategoryStore();

  const loadData = () => {
    if (menuStore.list.length === 0) {
      menuStore.loadMenu();
    }

    if (restaurantStore.list.length === 0) {
      restaurantStore.loadListRestaurant();
    }

    if (categoryStore.list.length === 0) {
      categoryStore.fetchCategories();
    }

    if (room) {
      cartStore.loadCart(room);
    }
  };

  // เรียกใช้อัตโนมัติเฉพาะตอนอยู่ใน setup lifecycle เท่านั้น เพื่อหลีกเลี่ยง error เมื่อเรียกหลัง async หรือใน watch
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
    loadData
  };
};

