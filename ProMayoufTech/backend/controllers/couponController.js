import asyncHandler from "../middleware/asyncHandler.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js"; // May be needed for user-specific coupon usage checks later

// @desc    Apply a coupon to a cart (validate and calculate discount)
// @route   POST /api/coupons/apply
// @access  Private 
const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode, cartTotal } = req.body;

  if (!couponCode || typeof cartTotal === "undefined") {
    res.status(400);
    throw new Error("Coupon code and cart total are required.");
  }

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found.");
  }

  if (!coupon.isValid()) {
    let reason = "Coupon is not valid.";
    if (!coupon.isActive) reason = "Coupon is inactive.";
    else if (coupon.validFrom > new Date()) reason = "Coupon is not yet active.";
    else if (coupon.validUntil < new Date()) reason = "Coupon has expired.";
    else if (coupon.usageLimitPerCoupon !== null && coupon.timesUsed >= coupon.usageLimitPerCoupon) {
      reason = "Coupon usage limit reached.";
    }
    res.status(400);
    throw new Error(reason);
  }

  if (cartTotal < coupon.minimumPurchaseAmount) {
    res.status(400);
    throw new Error(`Minimum purchase amount of $${coupon.minimumPurchaseAmount.toFixed(2)} not met.`);
  }

  // TODO: Implement user-specific usage limit check if usageLimitPerUser is set.
  // This would typically involve checking the user's past orders for this coupon code.
  // For now, we rely on the global timesUsed.

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed_amount") {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);

  const newTotal = cartTotal - discountAmount;

  res.status(200).json({
    message: "Coupon applied successfully!",
    couponCode: coupon.code,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    newTotal: parseFloat(newTotal.toFixed(2)),
    originalTotal: parseFloat(cartTotal.toFixed(2)),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumPurchaseAmount,
    isActive,
    validFrom,
    validUntil,
    usageLimitPerCoupon,
    usageLimitPerUser,
  } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minimumPurchaseAmount,
    isActive,
    validFrom,
    validUntil,
    usageLimitPerCoupon,
    usageLimitPerUser,
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.json(coupons);
});

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumPurchaseAmount,
    isActive,
    validFrom,
    validUntil,
    usageLimitPerCoupon,
    usageLimitPerUser,
    timesUsed
  } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = code.toUpperCase() || coupon.code;
    coupon.description = description || coupon.description;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue || coupon.discountValue;
    coupon.minimumPurchaseAmount = minimumPurchaseAmount !== undefined ? minimumPurchaseAmount : coupon.minimumPurchaseAmount;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
    coupon.validFrom = validFrom || coupon.validFrom;
    coupon.validUntil = validUntil || coupon.validUntil;
    coupon.usageLimitPerCoupon = usageLimitPerCoupon !== undefined ? usageLimitPerCoupon : coupon.usageLimitPerCoupon;
    coupon.usageLimitPerUser = usageLimitPerUser !== undefined ? usageLimitPerUser : coupon.usageLimitPerUser;
    coupon.timesUsed = timesUsed !== undefined ? timesUsed : coupon.timesUsed; // Allow admin to reset or adjust

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ message: "Coupon removed" });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

export {
  applyCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};

