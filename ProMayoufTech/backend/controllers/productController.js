import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i',
    },
  } : {};

  // Add category and subCategory filtering
  const filter = {
    ...keyword
  };
  if (req.query.category) {
    filter.category = {
      $regex: new RegExp(`^${req.query.category}$`, 'i')
    };
  }
  if (req.query.subcategory) {
    console.log('Filtering by subcategory:', req.query.subcategory);
    filter.subCategory = {
      $regex: new RegExp(`^${req.query.subcategory}$`, 'i')
    };
  }

  console.log('API filter:', filter);
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize)
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Suits',
    subCategory: 'business',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
    color: 'Black',
    material: 'Cotton',
    fit: 'Regular',
    style: 'Business',
    pieces: 2,
    isOnSale: false
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    subCategory,
    countInStock,
    color,
    material,
    fit,
    style,
    pieces,
    isOnSale
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.countInStock = countInStock || product.countInStock;
    product.color = color || product.color;
    product.material = material || product.material;
    product.fit = fit || product.fit;
    product.style = style || product.style;
    product.pieces = pieces || product.pieces;
    product.isOnSale = isOnSale !== undefined ? isOnSale : product.isOnSale;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({
      _id: product._id
    });
    res.json({
      message: 'Product removed'
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const {
    rating,
    comment
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if user has already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    // Check if user has purchased the product
    const Order = mongoose.model('Order');
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': product._id,
      isPaid: true
    });

    if (!hasPurchased) {
      res.status(400);
      throw new Error('You must purchase this product before reviewing');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({
      message: 'Review added'
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({
    rating: -1
  }).limit(3);

  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
};