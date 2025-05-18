import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Alert, Form } from "react-bootstrap";
import { useSelector } from "react-redux";

const StripePaymentForm = ({ amount, currency, onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setError("Stripe.js has not loaded yet. Please try again in a moment.");
      return;
    }

    setProcessing(true);
    onProcessing(true);

    try {
      // 1. Create a payment intent on the server
      const res = await fetch("/api/config/stripe/paymentintent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency }), // amount in cents
      });

      const { clientSecret, error: backendError } = await res.json();

      if (backendError) {
        setError(backendError.message || "Failed to create payment intent.");
        if (onError) onError(backendError.message || "Failed to create payment intent.");
        setProcessing(false);
        onProcessing(false);
        return;
      }

      if (!clientSecret) {
        setError("Failed to get client secret from server.");
        if (onError) onError("Failed to get client secret from server.");
        setProcessing(false);
        onProcessing(false);
        return;
      }

      // 2. Confirm the card payment
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: userInfo.name,
            email: userInfo.email,
          },
        },
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        if (onError) onError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
        onProcessing(false);
      } else {
        // Payment successful
        if (onSuccess) onSuccess(payload.paymentIntent);
        setProcessing(false);
        onProcessing(false);
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
      setProcessing(false);
      onProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Card Details</Form.Label>
        <CardElement options={cardElementOptions} className="form-control" />
      </Form.Group>
      <Button type="submit" variant="primary" disabled={!stripe || processing} className="w-100">
        {processing ? "Processing..." : `Pay ${currency.toUpperCase()} ${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm;

