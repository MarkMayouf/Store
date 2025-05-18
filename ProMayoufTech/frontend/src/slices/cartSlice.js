import {
  createSlice
} from "@reduxjs/toolkit";
import {
  updateCart
} from "../utils/cartUtils";

const initialState = localStorage.getItem("cart") ?
  JSON.parse(localStorage.getItem("cart")) : {
    cartItems: [],
    shippingAddress: {},
    paymentMethod: "PayPal"
  };

// Get recently viewed products from localStorage or initialize empty array
const recentlyViewedFromStorage = localStorage.getItem("recentlyViewed") ?
  JSON.parse(localStorage.getItem("recentlyViewed")) : [];

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...initialState,
    recentlyViewed: recentlyViewedFromStorage,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existItem = state.cartItems.find(
        (x) => x._id === item._id && (item.selectedSize ? x.selectedSize === item.selectedSize : true)
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          (x._id === existItem._id && (!item.selectedSize || x.selectedSize === item.selectedSize)) ?
          item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      // Check for special offers
      const suits = state.cartItems.filter(item => item.category === 'suits');
      if (suits.length >= 2) {
        // Apply "Buy 2 Get 30% off" discount
        suits.forEach(suit => {
          suit.price = suit.price * 0.7; // 30% off
        });
      }

      // Check for bundle offers
      const hasShirt = state.cartItems.some(item => item.category === 'shirts');
      const hasTie = state.cartItems.some(item => item.category === 'ties');
      const hasSuit = suits.length > 0;

      if (hasShirt && hasTie && hasSuit) {
        // Apply bundle discount
        const shirt = state.cartItems.find(item => item.category === 'shirts');
        const tie = state.cartItems.find(item => item.category === 'ties');
        if (shirt) shirt.price = 0; // Free shirt
        if (tie) tie.price = 0; // Free tie
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      const {
        id,
        size
      } = action.payload;

      state.cartItems = state.cartItems.filter(
        (x) => !(x._id === id && (size ? x.selectedSize === size : true))
      );

      return updateCart(state);
    },
    updateCartItemColor: (state, action) => {
      const {
        id,
        size,
        customizations,
        color
      } = action.payload;

      state.cartItems = state.cartItems.map(item => {
        if (item._id === id &&
          (!size || item.selectedSize === size) &&
          (JSON.stringify(item.customizations) === JSON.stringify(customizations))) {
          return {
            ...item,
            selectedColor: color
          };
        }
        return item;
      });

      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.setItem('cart', JSON.stringify(state));
    },
    applyCoupon: (state, action) => {
      const {
        code,
        discountType,
        discountValue,
        minimumPurchaseAmount
      } = action.payload;

      const subtotal = state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

      if (subtotal >= minimumPurchaseAmount) {
        state.coupon = {
          code,
          discountType,
          discountValue,
          minimumPurchaseAmount
        };

        // Apply discount
        if (discountType === 'percentage') {
          state.discount = (subtotal * discountValue) / 100;
        } else if (discountType === 'fixed') {
          state.discount = discountValue;
        }
      }

      return updateCart(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
      return updateCart(state);
    },
    resetCart: (state) => {
      state.cartItems = [];
      state.shippingAddress = {};
      state.paymentMethod = "PayPal";
      state.coupon = null;
      state.discount = 0;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    // Recently viewed products reducers
    addToRecentlyViewed: (state, action) => {
      // Add product to recently viewed, but limited to 5 most recent products
      const product = {
        _id: action.payload._id,
        name: action.payload.name,
        image: action.payload.image,
        price: action.payload.price,
        category: action.payload.category,
        subCategory: action.payload.subCategory,
      };

      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter(p => p._id !== product._id);

      // Add to the beginning of the array
      state.recentlyViewed = [product, ...state.recentlyViewed].slice(0, 5);

      // Store in localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
      localStorage.removeItem('recentlyViewed');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemColor,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
  applyCoupon: applyCouponToCart,
  removeCoupon: clearCouponFromCart,
  addToRecentlyViewed,
  clearRecentlyViewed,
} = cartSlice.actions;

export default cartSlice.reducer;