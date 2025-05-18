import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

// Additional test products
const testProducts = [
  // Suits
  {
    name: 'Classic Navy Blue Suit',
    image: '/images/navy-blue-suit.jpg',
    description: 'Premium navy blue wool suit perfect for business meetings and formal occasions.',
    brand: 'ProMayouf Signature',
    category: 'Suits',
    subCategory: 'business',
    price: 599.99,
    countInStock: 50,
    rating: 4.5,
    numReviews: 12,
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
    rating: 4.8,
    numReviews: 8,
    color: 'Black',
    material: 'Premium Wool',
    fit: 'Slim',
    style: 'Formal',
    pieces: 3,
    isOnSale: false
  },
  // Shoes
  {
    name: 'Classic Oxford Dress Shoes',
    image: '/images/oxford-shoes.jpg',
    description: 'Premium leather oxford dress shoes perfect for formal occasions.',
    brand: 'ProMayouf Footwear',
    category: 'Shoes',
    subCategory: 'formal',
    price: 249.99,
    countInStock: 40,
    rating: 4.6,
    numReviews: 15,
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
    rating: 4.3,
    numReviews: 22,
    color: 'Brown',
    material: 'Leather',
    fit: 'Wide',
    style: 'Casual',
    pieces: 1,
    isOnSale: true
  },
  // Accessories
  {
    name: 'Silk Necktie',
    image: '/images/silk-tie.jpg',
    description: 'Premium silk necktie with elegant pattern design.',
    brand: 'ProMayouf Essentials',
    category: 'Accessories',
    subCategory: 'ties',
    price: 59.99,
    countInStock: 100,
    rating: 4.7,
    numReviews: 30,
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
    rating: 4.5,
    numReviews: 25,
    color: 'Black',
    material: 'Full Grain Leather',
    fit: 'Regular',
    style: 'Business',
    pieces: 1,
    isOnSale: false
  }
];

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = [...products, ...testProducts].map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
