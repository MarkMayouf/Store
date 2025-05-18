# Validation Plan for E-commerce Website Modifications

This document outlines the testing and validation steps for the modified e-commerce website, focusing on the new features: men's suits and shoes theme, comprehensive payment integration, coupon system, admin dashboard, invoicing, and delivery tracking.

## I. General Setup and Sanity Checks

1.  **Environment Setup:** Ensure backend and frontend can be run locally.
2.  **Basic Navigation:** Test basic site navigation, homepage, product listing, and product detail pages.
3.  **User Accounts:**
    *   Test user registration.
    *   Test user login and logout.
    *   Test admin login and logout.

## II. Theme and Product Redesign (Men's Suits and Shoes)

1.  **Product Display:** Verify that product listings and detail pages primarily showcase men's suits, shoes, and related accessories.
2.  **Product Model:** Check if product data (categories, attributes) aligns with men's fashion items.
3.  **UI/UX:** Confirm that the visual theme reflects a men's fashion aesthetic (as per earlier design plans - this is a conceptual check based on code).

## III. Payment Integration (PayPal & Stripe)

1.  **Checkout Process:**
    *   Add items to cart and proceed to checkout.
    *   Verify shipping address input.
    *   Verify payment method selection (PayPal, Stripe).
2.  **PayPal Payment (Simulated/Sandbox):
    *   Initiate PayPal payment.
    *   Simulate successful payment.
    *   Verify order status updates to "Paid".
    *   Verify payment details are recorded in the order.
    *   Simulate failed/cancelled PayPal payment and verify order status remains "Not Paid".
3.  **Stripe Payment (Simulated/Test Mode):
    *   Initiate Stripe payment.
    *   Simulate successful payment using test card details.
    *   Verify order status updates to "Paid".
    *   Verify payment details (Stripe Payment Intent ID) are recorded.
    *   Simulate failed Stripe payment and verify order status remains "Not Paid".

## IV. Coupon System

1.  **Admin Coupon Management (via UI or API tests if UI is complex to navigate programmatically):
    *   Create a percentage-based coupon.
    *   Create a fixed-amount coupon.
    *   Create a coupon with an expiry date (past and future).
    *   Create a coupon with usage limits (total and per user).
    *   Edit an existing coupon.
    *   Delete a coupon.
    *   View coupon list and details.
2.  **User Coupon Application:
    *   Apply a valid percentage coupon to the cart; verify discount calculation.
    *   Apply a valid fixed-amount coupon to the cart; verify discount calculation.
    *   Attempt to apply an expired coupon; verify error.
    *   Attempt to apply a coupon with exceeded usage limit; verify error.
    *   Attempt to apply a coupon below minimum purchase amount (if applicable); verify error.
    *   Verify coupon is removed if cart no longer meets conditions.
    *   Verify order total reflects coupon discount upon successful application.

## V. Admin Dashboard

1.  **Access Control:** Verify only admin users can access `/admin/*` routes.
2.  **Dashboard Overview (`/admin/dashboard`):
    *   Verify display of Total Sales, Total Orders, New Customers, Average Order Value. (Cross-check with direct database queries if possible for accuracy).
    *   Verify Recent Orders list is accurate and links to order details.
    *   Verify Top Selling Products list is accurate.
    *   Verify Low Stock Alerts are accurate and link to product edit pages.
3.  **Management Links:** Verify quick links to Order, Product, User, and Coupon management pages are functional.
4.  **Product Management (`/admin/productlist`, `/admin/product/:id/edit`):
    *   View product list.
    *   Create a new product (suit/shoe).
    *   Edit an existing product.
    *   Delete a product.
5.  **Order Management (`/admin/orderlist`, `/order/:id` for admin view):
    *   View order list.
    *   View order details.
    *   Filter/sort orders (if implemented).
6.  **User Management (`/admin/userlist`):
    *   View user list.
    *   View user details.
    *   Edit user (e.g., isAdmin status).

## VI. Invoicing

1.  **Automated Generation:** Verify a PDF invoice is generated and its path is saved to the order upon successful payment (PayPal and Stripe).
2.  **Content Verification:**
    *   Open a generated PDF invoice.
    *   Compare content against `invoice_design.md` (Company details, customer details, itemized list, totals, payment info).
    *   Verify correct calculation of prices, taxes, discounts, and totals.
3.  **User Access:**
    *   Log in as a user.
    *   Navigate to order history.
    *   Attempt to download the invoice for a paid order; verify successful download.
    *   Verify invoice is not available for unpaid orders.
4.  **Admin Access:**
    *   Log in as admin.
    *   Navigate to an order's details page.
    *   Attempt to download the invoice for a paid order; verify successful download.

## VII. Delivery Tracking

1.  **Admin - Mark as Delivered:
    *   Navigate to a paid, undelivered order in the admin panel.
    *   Use the "Mark As Delivered" functionality.
    *   Verify order status updates to "Delivered" and `deliveredAt` timestamp is set.
2.  **User - View Delivery Status:
    *   Log in as the user who placed the order.
    *   View the order in their order history.
    *   Verify the delivery status is correctly displayed (e.g., "Not Delivered", "Delivered on [Date]").
3.  **Admin - View Delivery Status:
    *   Verify delivery status is correctly displayed in the admin order list and order details page.

## VIII. End-to-End Testing

1.  **New User Full Flow:**
    *   Register new user.
    *   Browse products (men's suits/shoes).
    *   Add items to cart.
    *   Apply a valid coupon.
    *   Proceed to checkout, enter shipping.
    *   Complete payment (e.g., Stripe test).
    *   Verify order confirmation and email (if email sending is mocked/testable).
    *   Check order history, verify status and invoice download link.
    *   Admin: Mark order as delivered.
    *   User: Verify delivery status update.

## IX. Reporting

- Document all test cases and their results.
- List any bugs found with steps to reproduce.
- Confirm all user requirements have been met.

This plan will be executed by running the application and using a combination of UI interaction (simulated via browser tools where applicable) and API calls (via shell/Python scripts) to verify functionality.
