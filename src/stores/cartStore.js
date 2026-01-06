import { defineStore } from "pinia";
import { useOderlistStore } from "@/stores/OrderList";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
    tableId: null,
  }),
  getters: {
    summaryQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.Quantity, 0);
    },
    summaryPrice(state) {
      return state.item.reduce((acc, item) => {
        return acc + item.Price * item.Quantity;
      }, 0);
    },
  },
  actions: {
    loadcart(tableId) {
      this.tableId = tableId;
      const storageKey = `cart-data-${tableId}`;
      const previousCart = localStorage.getItem(storageKey);
      if (previousCart) {
        this.item = JSON.parse(previousCart);
      } else {
        this.item = [];
      }
    },
    saveToStorage() {
      if (this.tableId) {
        const storageKey = `cart-data-${this.tableId}`;
        localStorage.setItem(storageKey, JSON.stringify(this.item));
      }
    },
    addToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });
      if (productdata.Remainquantity > 0) {
        if (fineProductIndex < 0) {
          const newItem = { ...productdata, Quantity: 1 };
          this.item.push(newItem);
        } else {
          const currentItem = this.item[fineProductIndex];
          if (currentItem.Quantity < productdata.Remainquantity) {
            this.updateQuantity(fineProductIndex, currentItem.Quantity + 1);
          }
        }
      }
      this.saveToStorage();
    },
    decreaseToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });

      if (fineProductIndex !== -1) {
        const currentItem = this.item[fineProductIndex];
        if (currentItem.Quantity > 1) {
          this.updateQuantity(fineProductIndex, currentItem.Quantity - 1);
        } else {
          this.removeItemInCart(fineProductIndex);
        }
      }
      this.saveToStorage();
    },
    updateQuantity(index, quantity) {
      this.item[index].Quantity = quantity;
      this.saveToStorage();
    },
    removeItemInCart(index) {
      this.item.splice(index, 1);
      this.saveToStorage();
    },
    placeorder(tableId) {
      const orderData = {
        TotalPrice: this.summaryPrice,
        OrderNumber: `${Math.floor(Math.random() * 100000)}`,
        TableID: tableId,
        Menu: this.item,
      };
      const orderList = useOderlistStore();
      localStorage.clear("cart-data",JSON.stringify)
      localStorage.setItem("order-data", JSON.stringify(orderData));
      orderList.addToOrderList(orderData);
    },
    clearcart() {
      this.item = [];
      this.saveToStorage();
    },
  },
});