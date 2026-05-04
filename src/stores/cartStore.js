import { defineStore } from "pinia";
import { db } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";

export const useCartStore = defineStore("cart", {

  state: () => ({
    item: [],
    room: null,
  }),

  getters: {
    
    getItemById: (state) => {
      return (menuId) => state.item.find(i => i.id === menuId) || null;
    },

    
    totalQuantity(state) {
      return state.item.reduce((acc, item) => acc + item.Quantity, 0);
    },


    totalPrice(state) {
      return state.item.reduce((acc, item) => acc + (item.Price * item.Quantity), 0);
    },
  },

  actions: {
    
    loadCart(room) {
      this.room = room;
      
      const storageKey = `cart-data-${room}`;
      const previousCart = localStorage.getItem(storageKey);
      
      if (previousCart) {
        try {
          const parsed = JSON.parse(previousCart);
          // Ensure all items have a cartItemId for stable keys
          this.item = parsed.map(i => ({
            ...i,
            cartItemId: i.cartItemId || `${i.id}-${Math.random().toString(36).substr(2, 9)}`
          }));
        } catch (e) {
          console.error("Cart parse error:", e);
          this.item = [];
        }
      } else {
        this.item = [];
      }

      // Multi-tab synchronization
      if (!this._isSyncing) {
        window.addEventListener('storage', (event) => {
          const currentKey = `cart-data-${this.room}`;
          if (event.key === currentKey) {
            // Re-load from storage when it changes in another tab
            const latest = localStorage.getItem(currentKey);
            if (latest) {
              try {
                this.item = JSON.parse(latest);
              } catch (e) {
                this.item = [];
              }
            } else {
              this.item = [];
            }
          }
        });
        this._isSyncing = true;
      }
    },

    
    saveToStorage() {
      if (this.room) {
        const storageKey = `cart-data-${this.room}`;
        if (this.item.length === 0) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify(this.item));
        }
      }
    },

    
    addOrUpdateItem(menu, quantity, note, unitPrice) {
      const priceToUse = unitPrice !== undefined ? unitPrice : menu.Price;
      const existingItem = this.item.find(i => 
        i.id === (menu.menuId || menu.id) && 
        i.note === note && 
        i.Price === priceToUse
      );

      if (existingItem) {
        existingItem.Quantity += quantity;
      } else {
        this.item.push({
          id: menu.menuId || menu.id,
          Name: menu.Name,
          cartItemId: `${menu.menuId || menu.id}-${Math.random().toString(36).substr(2, 9)}`,
          Price: priceToUse,
          basePrice: menu.Price,
          ImageUrl: menu.ImageUrl,
          Quantity: quantity,
          note: note,
          Restaurant: menu.Restaurant
        });
      }

      this.saveToStorage();
    },

    
    removeItemInCart(index) {
      this.item.splice(index, 1);
      this.saveToStorage();
    },

    
    updateQuantity(index, increment) {
      if (this.item[index]) {
        const newQuantity = this.item[index].Quantity + increment;
        if (newQuantity >= 1) {
          this.item[index].Quantity = newQuantity;
          this.saveToStorage();
        } else if (newQuantity === 0) {
          this.removeItemInCart(index);
        }
      }
    },

    
    async placeOrder() {
      try {
        const cartItems = [...this.item];
        const room = this.room;
        const totalPrice = this.totalPrice;
        const restaurants = [...new Set(cartItems.map(i => i.Restaurant || 'Unknown'))];

        await runTransaction(db, async (transaction) => {
          // 1. Get/Update Counter for Sequential Order Number
          const counterRef = doc(db, 'Metadata', 'Counters');
          const counterSnap = await transaction.get(counterRef);
          
          let nextNumber = 1;
          if (counterSnap.exists()) {
            nextNumber = (counterSnap.data().lastOrderNumber || 0) + 1;
          }
          
          const finalOrderNumber = nextNumber.toString().padStart(6, '0');
          
          // 2. Prepare Order Document
          const orderRef = doc(collection(db, 'Order'));
          const orderData = {
            OrderNumber: finalOrderNumber,
            room: room,
            Menu: cartItems.map(i => ({
              ...i,
              cartItemId: i.cartItemId || `${i.id}-${Math.random().toString(36).substr(2, 9)}`,
              id: i.menuId || i.id,
              itemStatus: 'waiting'
            })),
            TotalPrice: totalPrice,
            statusOrder: 'pending',
            CreatedAt: serverTimestamp(),
            RestaurantsInOrder: restaurants
          };

          // 3. Perform Writes in Transaction
          transaction.set(orderRef, orderData);
          transaction.set(counterRef, { lastOrderNumber: nextNumber }, { merge: true });
        });

        // Clear cart after successful transaction
        this.clearCart();
        return true;
      } catch (error) {
        console.error("Order placement error:", error);
        alert("สั่งซื้อไม่สำเร็จ: " + error.message);
        throw error;
      }
    },

    
    clearCart() {
      this.item = [];
      this.saveToStorage();
    }
  }
});

