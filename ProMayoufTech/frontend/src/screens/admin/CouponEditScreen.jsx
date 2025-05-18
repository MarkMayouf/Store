import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {
  useGetCouponDetailsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "../../slices/couponsApiSlice";

const CouponEditScreen = () => {
  const { id: couponId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "fixed_amount"
  const [discountValue, setDiscountValue] = useState(0);
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [usageLimitPerCoupon, setUsageLimitPerCoupon] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(1); // null for unlimited, 1 by default

  const { data: coupon, isLoading, error: errorDetails, refetch } = useGetCouponDetailsQuery(
    couponId,
    { skip: !couponId } // Skip if creating a new coupon
  );

  const [createCoupon, { isLoading: loadingCreate }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: loadingUpdate }] = useUpdateCouponMutation();

  useEffect(() => {
    if (coupon && couponId) {
      setCode(coupon.code);
      setDescription(coupon.description || "");
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setMinimumPurchaseAmount(coupon.minimumPurchaseAmount || 0);
      setIsActive(coupon.isActive);
      setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().split("T")[0] : "");
      setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : "");
      setUsageLimitPerCoupon(coupon.usageLimitPerCoupon === null ? "" : coupon.usageLimitPerCoupon); // Handle null for input
      setUsageLimitPerUser(coupon.usageLimitPerUser === null ? "" : coupon.usageLimitPerUser); // Handle null for input
    }
  }, [coupon, couponId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (new Date(validFrom) > new Date(validUntil)) {
        toast.error("Valid From date cannot be after Valid Until date.");
        return;
    }
    try {
      const couponData = {
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minimumPurchaseAmount: parseFloat(minimumPurchaseAmount),
        isActive,
        validFrom,
        validUntil,
        // Convert empty string back to null for limits
        usageLimitPerCoupon: usageLimitPerCoupon === "" || usageLimitPerCoupon === null ? null : parseInt(usageLimitPerCoupon, 10),
        usageLimitPerUser: usageLimitPerUser === "" || usageLimitPerUser === null ? null : parseInt(usageLimitPerUser, 10),
      };

      if (couponId) {
        await updateCoupon({ couponId, ...couponData }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(couponData).unwrap();
        toast.success("Coupon created successfully");
      }
      refetch(); // Refetch details if editing, or list if navigating back
      navigate("/admin/couponlist");
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to save coupon");
    }
  };

  return (
    <>
      <Link to="/admin/couponlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>{couponId ? "Edit Coupon" : "Create Coupon"}</h1>
        {(loadingCreate || loadingUpdate || isLoading) && <Loader />}
        {errorDetails && <Message variant="danger">{errorDetails?.data?.message || errorDetails.error}</Message>}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="code" className="my-2">
            <Form.Label>Coupon Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter coupon code (e.g., SUMMER20)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="description" className="my-2">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Summer sale 20% off"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group controlId="discountType" className="my-2">
                <Form.Label>Discount Type</Form.Label>
                <Form.Select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="discountValue" className="my-2">
                <Form.Label>Discount Value</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter value (e.g., 10 or 10.00)"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                ></Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="minimumPurchaseAmount" className="my-2">
            <Form.Label>Minimum Purchase Amount (Optional)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter minimum cart total for coupon to apply"
              value={minimumPurchaseAmount}
              onChange={(e) => setMinimumPurchaseAmount(e.target.value)}
              step="0.01"
              min="0"
            ></Form.Control>
          </Form.Group>

          <Row>
            <Col md={6}>
                <Form.Group controlId="validFrom" className="my-2">
                    <Form.Label>Valid From</Form.Label>
                    <Form.Control
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    required
                    ></Form.Control>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group controlId="validUntil" className="my-2">
                    <Form.Label>Valid Until</Form.Label>
                    <Form.Control
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                    ></Form.Control>
                </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId="usageLimitPerCoupon" className="my-2">
                <Form.Label>Total Usage Limit (Optional, blank for unlimited)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 100"
                  value={usageLimitPerCoupon}
                  onChange={(e) => setUsageLimitPerCoupon(e.target.value)}
                  min="0"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="usageLimitPerUser" className="my-2">
                <Form.Label>Usage Limit Per User (Optional, blank for unlimited, 0 for no limit per user but global limit applies)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 1"
                  value={usageLimitPerUser}
                  onChange={(e) => setUsageLimitPerUser(e.target.value)}
                  min="0"
                ></Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="isActive" className="my-3">
            <Form.Check
              type="checkbox"
              label="Is Active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            ></Form.Check>
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-2">
            {couponId ? "Update Coupon" : "Create Coupon"}
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default CouponEditScreen;

