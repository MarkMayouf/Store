## Admin Dashboard - Key Metrics and Functionalities

This document outlines the key metrics, functionalities, and design considerations for the admin dashboard of the e-commerce platform.

### 1. Key Metrics (Overview Section)

- **Total Sales:** Display total revenue over selectable periods (e.g., today, last 7 days, last 30 days, all time).
- **Number of Orders:** Show the total count of orders for the selected period.
- **Average Order Value (AOV):** Calculate and display AOV for the selected period.
- **New Customers:** Track the number of new registered users for the selected period.
- **Recent Orders:** A quick view of the last 5-10 orders with status.
- **Top Selling Products:** List of top-selling products by quantity or revenue.
- **Low Stock Alerts:** Notifications for products running low on inventory.

### 2. Core Functionalities (Separate Sections/Pages within Admin Area)

#### 2.1. Order Management
- View a list of all orders with filtering (by status, date, customer) and sorting.
- View detailed information for each order (items, customer details, shipping address, payment status, delivery status).
- Update order status (e.g., processing, shipped, delivered, cancelled).
- Mark orders as paid/unpaid (though payment status should ideally be updated automatically by payment gateways).
- View and manage payment details associated with an order.
- Potentially trigger refunds (if payment gateway integration supports this via API).

#### 2.2. Product Management (Men's Suits and Shoes)
- View a list of all products with search, filtering (by category, stock status, price), and sorting.
- Add new products with details: name, description, price, images, category (suits, shoes, accessories), stock quantity, brand, sizes, colors, etc.
- Edit existing product details.
- Delete products (soft delete or permanent delete with confirmation).
- Manage product categories.
- Manage inventory levels for each product and its variants (if applicable, e.g., different sizes/colors).

#### 2.3. User Management
- View a list of all registered users with search and filtering.
- View user details (name, email, registration date, order history).
- Edit user details (e.g., update name, reset password - with security considerations).
- Manage user roles (e.g., customer, admin) - current project has isAdmin flag.
- Suspend or delete user accounts.

#### 2.4. Coupon Management (Already Implemented - Link from Dashboard)
- List existing coupons (code, discount type/value, validity, usage limits, status).
- Create new coupons with various parameters.
- Edit existing coupons.
- Delete coupons.
- View coupon usage statistics.

#### 2.5. Content Management (Optional - Future Enhancement)
- Manage static pages (e.g., About Us, Contact Us, FAQ).
- Manage promotional banners or homepage content.

### 3. Design and UI Considerations

- **Layout:** Clean, intuitive, and responsive design. A sidebar for navigation and a main content area for displaying information and forms.
- **Navigation:** Clear and easy-to-use navigation menu for accessing different sections (Dashboard Overview, Orders, Products, Users, Coupons, Settings).
- **Data Visualization:** Use charts and graphs for key metrics on the overview page (e.g., sales trends, order volume).
- **Tables:** Use well-structured and sortable tables for displaying lists of orders, products, users, etc., with pagination for large datasets.
- **Forms:** User-friendly forms for creating and editing products, coupons, etc., with clear validation messages.
- **Search and Filtering:** Robust search and filtering capabilities for all list views.
- **Notifications/Alerts:** Prominent display of important alerts (e.g., low stock, new orders).

### 4. Security

- **Authentication:** Ensure only authenticated admin users can access the dashboard (already handled by `protect` and `admin` middleware).
- **Authorization:** Role-based access control to ensure admins can only perform actions they are authorized for.
- **Input Validation:** Sanitize and validate all inputs to prevent common web vulnerabilities (e.g., XSS, SQL injection - though ORM helps with SQLi).
- **CSRF Protection:** Implement CSRF protection for all state-changing requests if not already handled by the framework/libraries.

### 5. Backend API Requirements

- Endpoints to fetch aggregated data for the dashboard overview (sales, orders, AOV, etc.).
- CRUD (Create, Read, Update, Delete) endpoints for managing orders, products, and users (some may already exist, others might need enhancement or creation specifically for admin use).
- Endpoints for updating order status, delivery status.
- Endpoints for managing inventory.

This plan will guide the development of the admin dashboard components and backend support.

