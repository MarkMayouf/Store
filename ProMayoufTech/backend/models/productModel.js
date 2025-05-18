import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const sizeSchema = mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  }
});

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Suits', 'Tuxedos', 'Blazers', 'Dress Shirts', 'Accessories'],
  },
  subCategory: {
    type: String,
    required: false,
    enum: ['business', 'wedding', 'tuxedos', 'formal', 'casual', 'oxford', 'derby', 'loafers', 'boots', 'ties', 'belts', 'cufflinks', 'pocketsquares', 'blazers'],
  },
  description: {
    type: String,
    required: true,
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  regularPrice: {
    type: Number,
    required: false,
    default: function () {
      return this.price; // Default to current price if not specified
    }
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  sizes: [sizeSchema],
  color: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  fit: {
    type: String,
    required: true,
    enum: ['Slim', 'Regular', 'Classic', 'Modern'],
  },
  style: {
    type: String,
    required: true,
    enum: ['Business', 'Wedding', 'Formal', 'Casual'],
  },
  pieces: {
    type: Number,
    required: true,
    enum: [2, 3], // 2-piece or 3-piece suit
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleEndDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;