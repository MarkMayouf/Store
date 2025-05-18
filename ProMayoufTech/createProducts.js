const fetch = require('node-fetch');
const fs = require('fs');

// Dummy admin credentials for testing
const adminCredentials = {
  email: 'admin@example.com',
  password: '123456'
};

const loginAdmin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/users/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminCredentials)
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

const createProduct = async (token, productData) => {
  try {
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Create product failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Created product: ${data.name} (ID: ${data._id})`);
    return data;
  } catch (error) {
    console.error('Create product error:', error.message);
    throw error;
  }
};

const updateProduct = async (token, productId, productData) => {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Update product failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Updated product: ${data.name}`);
    return data;
  } catch (error) {
    console.error('Update product error:', error.message);
    throw error;
  }
};

const products = [
  {
    name: 'Classic Navy Blue Suit',
    image: '/images/navy-blue-suit.jpg',
    description: 'Premium navy blue wool suit perfect for business meetings and formal occasions.',
    brand: 'ProMayouf Signature',
    category: 'Suits',
    subCategory: 'business',
    price: 599.99,
    countInStock: 50,
    color: 'Navy Blue',
    material: 'Wool Blend',
    fit: 'Regular',
    style: 'Business',
    pieces: 2,
    isOnSale: false
  },
  {
    name: 'Formal Black Tuxedo',
    image: '/images/black-tuxedo.jpg',
    description: 'Elegant black tuxedo for formal events and black tie occasions.',
    brand: 'ProMayouf Elite',
    category: 'Suits',
    subCategory: 'formal',
    price: 799.99,
    countInStock: 30,
    color: 'Black',
    material: 'Premium Wool',
    fit: 'Slim',
    style: 'Formal',
    pieces: 3,
    isOnSale: false
  },
  {
    name: 'Classic Oxford Dress Shoes',
    image: '/images/oxford-shoes.jpg',
    description: 'Premium leather oxford dress shoes perfect for formal occasions.',
    brand: 'ProMayouf Footwear',
    category: 'Shoes',
    subCategory: 'formal',
    price: 249.99,
    countInStock: 40,
    color: 'Black',
    material: 'Leather',
    fit: 'Regular',
    style: 'Formal',
    pieces: 1,
    isOnSale: false
  },
  {
    name: 'Casual Leather Loafers',
    image: '/images/leather-loafers.jpg',
    description: 'Comfortable leather loafers suitable for business casual attire.',
    brand: 'ProMayouf Comfort',
    category: 'Shoes',
    subCategory: 'casual',
    price: 179.99,
    countInStock: 60,
    color: 'Brown',
    material: 'Leather',
    fit: 'Wide',
    style: 'Casual',
    pieces: 1,
    isOnSale: true
  },
  {
    name: 'Silk Necktie',
    image: '/images/silk-tie.jpg',
    description: 'Premium silk necktie with elegant pattern design.',
    brand: 'ProMayouf Essentials',
    category: 'Accessories',
    subCategory: 'ties',
    price: 59.99,
    countInStock: 100,
    color: 'Blue Striped',
    material: 'Silk',
    fit: 'Regular',
    style: 'Business',
    pieces: 1,
    isOnSale: false
  },
  {
    name: 'Leather Belt',
    image: '/images/leather-belt.jpg',
    description: 'Classic leather belt with brushed metal buckle.',
    brand: 'ProMayouf Leather',
    category: 'Accessories',
    subCategory: 'belts',
    price: 79.99,
    countInStock: 80,
    color: 'Black',
    material: 'Full Grain Leather',
    fit: 'Regular',
    style: 'Business',
    pieces: 1,
    isOnSale: false
  }
];

const main = async () => {
  try {
    console.log('Logging in as admin...');
    const token = await loginAdmin();
    console.log('Successfully logged in');

    console.log('Creating products...');
    for (const productData of products) {
      // First create a basic product
      const newProduct = await createProduct(token, {});
      
      // Then update it with full data
      await updateProduct(token, newProduct._id, productData);
    }

    console.log('All products created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main(); 