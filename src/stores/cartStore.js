import { defineStore } from "pinia";

//import { useOderlistStore } from "./orderList";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
  }),
  /*getters: {
    summaryQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.quantity, 0);
    },
    summaryPrice(state) {
      return state.item.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);
    },
  },*/
  actions: {
    loadcart() {
      const previousCart = localStorage.getItem("cart-data");
      if (previousCart) {
        this.item = JSON.parse(previousCart);
      }
    },
    addToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });
      if (productdata.remainQuantity > 0) {
        if (fineProductIndex < 0) {
          productdata.quantity = 1;
          this.item.push(productdata);
        } else {
          const cerrentItem = this.item[fineProductIndex];
          if(this.item[fineProductIndex].quantity < productdata.remainQuantity){
          this.updateQuantity(fineProductIndex, cerrentItem.quantity + 1);}
        }
      }
    },
    /*decreaseToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.name === productdata.name;
      });

      if (productdata.quantity <= 0) {
        productdata.quantity = 0;
      } else {
        const cerrentItem = this.item[fineProductIndex];
        this.updateQuantity(fineProductIndex, cerrentItem.quantity - 1,productdata.remainQuantity);
      }
    },
    updateQuantity(index, quantity) {
      this.item[index].quantity = quantity;
      localStorage.setItem("cart-data", JSON.stringify(this.item));
    },
    removeItemInCart(index) {
      this.item.splice(index, 1);
      localStorage.setItem("cart-data", JSON.stringify(this.item));
    },
    placeorder(userData) {
      const orderData = {
        ...userData,
        totalPrice: this.summaryPrice,
        paymentMethod: "Credit Cart",
        orderNumber: `AA${Math.floor(Math.random() * 100000)}`,
        products: this.item,
      };
      const orderList = useOderlistStore();
      localStorage.setItem("order-data", JSON.stringify(orderData));
      orderList.addToOrderList(orderData);
    },
    loadCheckout() {
      const orderData = localStorage.getItem("order-data");
      if (orderData) {
        this.checkout = JSON.parse(orderData);
      }
    },
    clearcart() {
      this.item = [];
    },*/
  },
});
