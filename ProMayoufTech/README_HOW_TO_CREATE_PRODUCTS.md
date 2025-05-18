# How to Create Products in Admin Dashboard

Follow these steps to create suit, shoe, and accessory products in the ProMayouf Tech e-commerce admin dashboard.

## Prerequisites

1. The backend server must be running: `npm start` from the main project directory
2. The frontend server must be running: `cd frontend && npm start` in a separate terminal
3. You must be logged in as an admin user (email: admin@example.com, password: 123456)

## Steps to Create Products

### 1. Login to Admin Dashboard

1. Navigate to http://localhost:3000/login
2. Enter admin credentials
3. After login, go to the admin dashboard by clicking your profile and selecting "Admin" from the dropdown

### 2. Create a Suit Product

1. In the admin dashboard, click on "Products" in the sidebar
2. Click the "+" button to create a new product
3. Fill in the product details:
   - Name: Classic Navy Blue Suit
   - Price: 599.99
   - Image: /images/navy-blue-suit.jpg (upload or use URL)
   - Brand: ProMayouf Signature
   - Category: Suits
   - SubCategory: business
   - Count In Stock: 50
   - Description: Premium navy blue wool suit perfect for business meetings and formal occasions.
   - Color: Navy Blue
   - Material: Wool Blend
   - Fit: Regular
   - Style: Business
   - Pieces: 2
   - Is On Sale: No
4. Click "Create" to save the product

### 3. Create a Formal Suit Product

1. Click "+" to create another product
2. Fill in the product details:
   - Name: Formal Black Tuxedo
   - Price: 799.99
   - Image: /images/black-tuxedo.jpg
   - Brand: ProMayouf Elite
   - Category: Suits
   - SubCategory: formal
   - Count In Stock: 30
   - Description: Elegant black tuxedo for formal events and black tie occasions.
   - Color: Black
   - Material: Premium Wool
   - Fit: Slim
   - Style: Formal
   - Pieces: 3
   - Is On Sale: No
3. Click "Create" to save the product

### 4. Create Shoe Products

#### Formal Shoes
1. Click "+" to create a new product
2. Fill in the product details:
   - Name: Classic Oxford Dress Shoes
   - Price: 249.99
   - Image: /images/oxford-shoes.jpg
   - Brand: ProMayouf Footwear
   - Category: Shoes
   - SubCategory: formal
   - Count In Stock: 40
   - Description: Premium leather oxford dress shoes perfect for formal occasions.
   - Color: Black
   - Material: Leather
   - Fit: Regular
   - Style: Formal
   - Pieces: 1
   - Is On Sale: No
3. Click "Create" to save the product

#### Casual Shoes
1. Click "+" to create another product
2. Fill in the product details:
   - Name: Casual Leather Loafers
   - Price: 179.99
   - Image: /images/leather-loafers.jpg
   - Brand: ProMayouf Comfort
   - Category: Shoes
   - SubCategory: casual
   - Count In Stock: 60
   - Description: Comfortable leather loafers suitable for business casual attire.
   - Color: Brown
   - Material: Leather
   - Fit: Wide
   - Style: Casual
   - Pieces: 1
   - Is On Sale: Yes
3. Click "Create" to save the product

### 5. Create Accessory Products

#### Necktie
1. Click "+" to create a new product
2. Fill in the product details:
   - Name: Silk Necktie
   - Price: 59.99
   - Image: /images/silk-tie.jpg
   - Brand: ProMayouf Essentials
   - Category: Accessories
   - SubCategory: ties
   - Count In Stock: 100
   - Description: Premium silk necktie with elegant pattern design.
   - Color: Blue Striped
   - Material: Silk
   - Fit: Regular
   - Style: Business
   - Pieces: 1
   - Is On Sale: No
3. Click "Create" to save the product

#### Belt
1. Click "+" to create another product
2. Fill in the product details:
   - Name: Leather Belt
   - Price: 79.99
   - Image: /images/leather-belt.jpg
   - Brand: ProMayouf Leather
   - Category: Accessories
   - SubCategory: belts
   - Count In Stock: 80
   - Description: Classic leather belt with brushed metal buckle.
   - Color: Black
   - Material: Full Grain Leather
   - Fit: Regular
   - Style: Business
   - Pieces: 1
   - Is On Sale: No
3. Click "Create" to save the product

## Testing the Functionality

After creating the products, you can test the functionality by:

1. Browsing products by category (Suits, Shoes, Accessories)
2. Checking that subcategories work correctly (formal vs business suits, formal vs casual shoes)
3. Verifying that product details display correctly
4. Testing the add to cart functionality
5. Testing the checkout process with the created products

The products should now be visible in their respective categories and subcategories throughout the store. 