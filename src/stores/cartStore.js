import { defineStore } from "pinia";

import { useOderlistStore } from "@/stores/OrderList";

export const useCartStore = defineStore("cart", {
  state: () => ({
    item: [],
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
      if (productdata.Remainquantity > 0) {
        if (fineProductIndex < 0) {
          productdata.Quantity = 1;
          this.item.push(productdata);
          localStorage.setItem("cart-data", JSON.stringify(this.item));
          console.log('data ++')
        } else {
          const cerrentItem = this.item[fineProductIndex];
          if(this.item[fineProductIndex].Quantity < productdata.Remainquantity){
          this.updateQuantity(fineProductIndex, cerrentItem.Quantity + 1);}
        }
      }
      
      localStorage.setItem("cart-data", JSON.stringify(this.item));
    },
    /*decreaseToCart(productdata) {
      const fineProductIndex = this.item.findIndex((item) => {
        return item.Name === productdata.Name;
      });

      if (productdata.Quantity <= 0) {
        productdata.Quantity = 0;
      } else {
        const cerrentItem = this.item[fineProductIndex];
        this.updateQuantity(fineProductIndex, cerrentItem.Quantity - 1,productdata.RemainQuantity);
      }
    },*/
    updateQuantity(index, quantity) {
      this.item[index].Quantity = quantity;
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
    /*loadCheckout() {
      const orderData = localStorage.getItem("order-data");
      /*if (orderData) {
        this.checkout = JSON.parse(orderData);
      }
    },*/
    clearcart() {
      this.item = [];
    },
  },
});
