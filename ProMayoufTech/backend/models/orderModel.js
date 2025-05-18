import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        selectedSize: { type: String },
        customizations: {
          type: Object,
          default: null,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      // e.g., "PayPal", "Stripe"
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String }, // Transaction ID from PayPal or Stripe Payment Intent ID
      status: { type: String }, // e.g., "COMPLETED" (PayPal), "succeeded" (Stripe)
      update_time: { type: String }, // From PayPal or Stripe event timestamp
      email_address: { type: String }, // Payer email from PayPal
      payment_source: { type: String }, // "PayPal" or "Stripe"
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    appliedCoupon: {
      code: { type: String },
      discountType: { type: String },
      discountValue: { type: Number },
    },
    discountAmount: {
      type: Number,
      default: 0.0,
    },
    discountedItemsPrice: {
      type: Number,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD", // Default currency, can be set during order creation
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    invoicePath: { // Path to the generated PDF invoice
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
