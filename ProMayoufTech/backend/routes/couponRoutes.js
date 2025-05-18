import express from "express";
const router = express.Router();
import {
  applyCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// @route   POST /api/coupons/apply
// @access  Private (user must be logged in to apply a coupon)
router.post("/apply", protect, applyCoupon);

// @route   POST /api/coupons
// @access  Private/Admin
router.route("/").post(protect, admin, createCoupon).get(protect, admin, getCoupons);

// @route   GET /api/coupons/:id, PUT /api/coupons/:id, DELETE /api/coupons/:id
// @access  Private/Admin
router
  .route("/:id")
  .get(protect, admin, getCouponById)
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;

