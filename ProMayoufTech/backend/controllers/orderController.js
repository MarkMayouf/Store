import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { verifyPayPalPayment, checkIfNewTransaction } from "../utils/paypal.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js"; // Import JS invoice generator
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    currency,
    appliedCoupon,
    discountAmount,
    discountedItemsPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      if (!matchingItemFromDB) {
        res.status(404);
        throw new Error(`Product not found: ${itemFromClient.name}`);
      }
      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        selectedSize: itemFromClient.selectedSize,
        customizations: itemFromClient.customizations,
        _id: undefined,
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems, appliedCoupon);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      currency: currency || "USD",
      appliedCoupon: appliedCoupon || null,
      discountAmount: discountAmount || 0,
      discountedItemsPrice: discountedItemsPrice || itemsPrice,
    });

    const createdOrder = await order.save();

    // If a coupon was used, update its usage count
    if (appliedCoupon) {
      const Coupon = mongoose.model('Coupon');
      await Coupon.findOneAndUpdate(
        { code: appliedCoupon.code },
        { $inc: { timesUsed: 1 } }
      );
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { paymentSource, ...paymentDetailsProvided } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (order) {
    if (order.isPaid) {
      res.status(400);
      throw new Error("Order already paid");
    }

    if (paymentSource === "PayPal") {
      const { id, status, update_time, payer } = paymentDetailsProvided;
      const { verified, value } = await verifyPayPalPayment(id);
      if (!verified) throw new Error("PayPal Payment not verified");

      const isNewTransaction = await checkIfNewTransaction(Order, id);
      if (!isNewTransaction) throw new Error("PayPal Transaction has been used before");

      const paidCorrectAmount = parseFloat(order.totalPrice).toFixed(2) === parseFloat(value).toFixed(2);
      if (!paidCorrectAmount) throw new Error(`Incorrect amount paid (PayPal). Expected ${order.totalPrice}, got ${value}`);
      
      order.paymentResult = {
        id: id,
        status: status,
        update_time: update_time,
        email_address: payer.email_address,
        payment_source: "PayPal",
      };

    } else if (paymentSource === "Stripe") {
      const paymentIntent = paymentDetailsProvided;
      if (paymentIntent.status !== "succeeded") {
        throw new Error(`Stripe payment not successful. Status: ${paymentIntent.status}`);
      }
      const paidCorrectAmount = Math.round(parseFloat(order.totalPrice) * 100) === paymentIntent.amount;
      if (!paidCorrectAmount) {
          throw new Error(`Incorrect amount paid (Stripe). Expected ${Math.round(parseFloat(order.totalPrice) * 100)}, got ${paymentIntent.amount}`);
      }
      
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date(paymentIntent.created * 1000).toISOString(), 
        email_address: paymentIntent.charges?.data[0]?.billing_details?.email || req.user.email, 
        payment_source: "Stripe",
      };
      if (paymentIntent.currency.toUpperCase() !== order.currency.toUpperCase()) {
        console.warn(`Stripe payment currency (${paymentIntent.currency}) differs from order currency (${order.currency}) for order ${order._id}`);
      }

    } else {
      res.status(400);
      throw new Error("Invalid payment source specified");
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    const __dirname = path.resolve();
    const invoiceDir = path.join(__dirname, "invoices");
    if (!fs.existsSync(invoiceDir)){
        fs.mkdirSync(invoiceDir, { recursive: true }); // Ensure directory exists
    }
    const invoiceFilename = `invoice_${order._id}.pdf`;
    const invoiceFilePath = path.join(invoiceDir, invoiceFilename);
    
    const orderDataForInvoice = {
        ...order.toObject(),
        user: order.user.toObject(),
    };

    try {
        await generateInvoicePDF(orderDataForInvoice, invoiceFilePath); // Use await for the Promise
        order.invoicePath = `/invoices/${invoiceFilename}`;
    } catch (invoiceError) {
        console.error(`Failed to generate invoice for order ${order._id}:`, invoiceError);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Download invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error("Not authorized to access this invoice");
    }

    if (!order.invoicePath || !order.isPaid) {
        res.status(404);
        throw new Error("Invoice not available for this order or order not paid.");
    }

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, order.invoicePath);

    if (fs.existsSync(filePath)) {
        res.download(filePath, `invoice_${order._id}.pdf`, (err) => {
            if (err) {
                console.error("Error downloading invoice:", err);
                if (!res.headersSent) {
                    res.status(500).send("Could not download the file.");
                }
            }
        });
    } else {
        res.status(404);
        throw new Error("Invoice file not found.");
    }
});


// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (!order.isPaid) {
        res.status(400);
        throw new Error("Order is not paid yet");
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name").sort({ createdAt: -1 });
  res.json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  downloadInvoice,
};
