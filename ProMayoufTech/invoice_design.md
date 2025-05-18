## Invoice Design and Content

This document outlines the design and content requirements for the e-commerce platform invoices.

### 1. Invoice Header

- **Company Logo:** (Placeholder for ProMayoufTech Logo)
- **Company Name:** ProMayoufTech
- **Company Address:** (Placeholder: 123 Tech Avenue, Silicon Valley, CA 94000)
- **Company Contact:** (Placeholder: contact@promayouftech.com | +1-555-TECH-BIZ)
- **Invoice Title:** "INVOICE" or "TAX INVOICE" (if applicable)
- **Invoice Number:** Unique identifier for each invoice (e.g., INV-YYYYMMDD-XXXXX).
- **Order Number:** Corresponding order ID.
- **Invoice Date:** Date the invoice was generated.
- **Due Date:** (Typically "Due upon receipt" for e-commerce, or specific date if applicable).

### 2. Billing Information (Customer)

- **Billed To:**
- Customer Name
- Customer Email
- Customer Billing Address (Street, City, State, Postal Code, Country)

### 3. Shipping Information (Customer)

- **Ship To:** (If different from Billing Address, otherwise can state "Same as Billing Address")
- Customer Name (Recipient Name)
- Customer Shipping Address (Street, City, State, Postal Code, Country)

### 4. Itemized List of Products/Services

- Table with the following columns:
    - **# (Item No.):** Sequential number for each line item.
    - **Product Name/Description:** Full name of the product (e.g., "Men's Slim Fit Wool Suit - Navy Blue, Size 40R").
    - **SKU/Product Code:** (Optional, but good for tracking)
    - **Quantity (Qty):** Number of units purchased.
    - **Unit Price:** Price per unit (excluding tax).
    - **Total Price (Line Total):** Quantity * Unit Price (excluding tax).

### 5. Invoice Summary / Totals

- **Subtotal:** Sum of all line item totals (excluding tax).
- **Discount Applied (if any):** Description of coupon code and amount deducted (e.g., "Coupon SUMMER20: -$20.00").
- **Shipping & Handling:** Cost of shipping.
- **Tax (e.g., VAT, GST, Sales Tax):** Calculated tax amount. Clearly state tax rate if applicable (e.g., "Sales Tax (8.25%)").
- **Grand Total:** The final amount due (Subtotal - Discount + Shipping + Tax).

### 6. Payment Information

- **Payment Method Used:** (e.g., Visa ****1234, PayPal, Stripe).
- **Payment Status:** (e.g., PAID, Partially Paid, Unpaid - though for e-commerce, usually PAID).
- **Transaction ID:** (If available from payment gateway).
- **Date Paid:** Date the payment was successfully processed.

### 7. Footer / Notes

- **Thank You Message:** (e.g., "Thank you for your business!")
- **Return Policy Summary:** Brief note on return/exchange policy or link to full policy.
- **Terms and Conditions:** (Optional, or link to full T&Cs).
- **Company Registration Number / Tax ID:** (If legally required).

### 8. Design and Layout Considerations

- **Format:** PDF for easy download and printing.
- **Branding:** Consistent with the website's branding (colors, fonts if possible within PDF generation limits).
- **Clarity:** Easy to read, with clear sections and legible font sizes.
- **Professionalism:** Clean and professional appearance.
- **Whitespace:** Adequate whitespace to avoid a cluttered look.

### 9. Technical Implementation Notes

- **Automated Generation:** Invoices should be generated automatically upon successful order payment.
- **Accessibility:** Users should be able to download their invoices from their order history page.
- **Admin Access:** Admins should be able to view/download invoices for any order.
- **PDF Library:** A suitable PDF generation library will be needed for the backend (e.g., ReportLab, WeasyPrint, FPDF for Python/Node.js environments).

This design will serve as the blueprint for implementing the invoice generation feature.

