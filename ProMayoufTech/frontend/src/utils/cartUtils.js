export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export const updateCart = (state) => {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );
  state.itemsPrice = addDecimals(itemsPrice);

  // Apply coupon discount if there is one
  if (state.appliedCoupon) {
    const discount = state.appliedCoupon.discountType === 'percentage'
      ? (itemsPrice * state.appliedCoupon.discountValue) / 100
      : state.appliedCoupon.discountValue;
    state.discountAmount = addDecimals(discount);
    state.discountedItemsPrice = addDecimals(itemsPrice - discount);
  } else {
    state.discountAmount = addDecimals(0);
    state.discountedItemsPrice = state.itemsPrice;
  }

  // Calculate the shipping price based on the discounted items price
  const effectivePrice = state.appliedCoupon ? parseFloat(state.discountedItemsPrice) : itemsPrice;
  const shippingPrice = effectivePrice > 100 ? 0 : 10;
  state.shippingPrice = addDecimals(shippingPrice);

  // Calculate the tax price based on the discounted items price
  const taxPrice = 0.15 * effectivePrice;
  state.taxPrice = addDecimals(taxPrice);

  // Calculate the total price
  const totalPrice = effectivePrice + shippingPrice + taxPrice;
  state.totalPrice = addDecimals(totalPrice);

  // Save the cart to localStorage
  localStorage.setItem('cart', JSON.stringify(state));

  return state;
};
