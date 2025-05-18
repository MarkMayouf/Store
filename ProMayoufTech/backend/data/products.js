const products = [{
    name: 'Classic Black Business Suit',
    image: '/images/classic-black-suit.jpg',
    description: 'Premium black wool suit perfect for business meetings and formal occasions. Features a timeless design with modern tailoring.',
    brand: 'ProMayouf Signature',
    category: 'Suits',
    subCategory: 'business',
    price: 599.99,
    countInStock: 50,
    rating: 4.5,
    numReviews: 12,
    color: 'Black',
    material: 'Wool Blend',
    fit: 'Regular',
    style: 'Business',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 10
      },
      {
        size: '42R',
        quantity: 10
      },
      {
        size: '44R',
        quantity: 10
      },
      {
        size: '46R',
        quantity: 10
      },
      {
        size: '48R',
        quantity: 10
      }
    ]
  },
  {
    name: 'Navy Blue Slim Fit Suit',
    image: '/images/navy-slim-suit.jpg',
    description: 'Modern navy blue suit with a slim fit cut. Perfect for young professionals and contemporary occasions.',
    brand: 'ProMayouf Modern',
    category: 'Suits',
    subCategory: 'business',
    price: 499.99,
    countInStock: 45,
    rating: 4.0,
    numReviews: 8,
    color: 'Navy Blue',
    material: 'Wool Blend',
    fit: 'Slim',
    style: 'Business',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '38R',
        quantity: 15
      },
      {
        size: '40R',
        quantity: 15
      },
      {
        size: '42R',
        quantity: 15
      }
    ]
  },
  {
    name: 'Grey Three-Piece Wedding Suit',
    image: '/images/grey-wedding-suit.jpg',
    description: 'Elegant grey three-piece suit perfect for weddings and special occasions. Includes vest for a complete formal look.',
    brand: 'ProMayouf Luxe',
    category: 'Suits',
    subCategory: 'wedding',
    price: 799.99,
    countInStock: 30,
    rating: 4.8,
    numReviews: 15,
    color: 'Light Grey',
    material: 'Pure Wool',
    fit: 'Classic',
    style: 'Wedding',
    pieces: 3,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 6
      },
      {
        size: '42R',
        quantity: 6
      },
      {
        size: '44R',
        quantity: 6
      },
      {
        size: '46R',
        quantity: 6
      },
      {
        size: '48R',
        quantity: 6
      }
    ]
  },
  {
    name: 'Black Peak Lapel Tuxedo',
    image: '/images/black-tuxedo.jpg',
    description: 'Sophisticated black tuxedo with peak lapels for formal events and black-tie occasions. Crafted with premium fabrics and impeccable tailoring.',
    brand: 'ProMayouf Luxe',
    category: 'Suits',
    subCategory: 'tuxedos',
    price: 899.99,
    countInStock: 25,
    rating: 4.9,
    numReviews: 18,
    color: 'Black',
    material: 'Pure Wool',
    fit: 'Slim',
    style: 'Formal',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '38R',
        quantity: 5
      },
      {
        size: '40R',
        quantity: 5
      },
      {
        size: '42R',
        quantity: 5
      },
      {
        size: '44R',
        quantity: 5
      },
      {
        size: '46R',
        quantity: 5
      }
    ]
  },
  {
    name: 'Pinstripe Formal Suit',
    image: '/images/pinstripe-suit.jpg',
    description: 'Classic pinstripe formal suit with traditional styling. Perfect for business meetings and formal occasions where you need to make an impression.',
    brand: 'ProMayouf Signature',
    category: 'Suits',
    subCategory: 'formal',
    price: 649.99,
    countInStock: 35,
    rating: 4.7,
    numReviews: 14,
    color: 'Navy/Pinstripe',
    material: 'Pure Wool',
    fit: 'Classic',
    style: 'Formal',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 7
      },
      {
        size: '42R',
        quantity: 7
      },
      {
        size: '44R',
        quantity: 7
      },
      {
        size: '46R',
        quantity: 7
      },
      {
        size: '48R',
        quantity: 7
      }
    ]
  },
  {
    name: 'Classic Black Formal Suit',
    image: '/images/black-formal-suit.jpg',
    description: 'Elegant black formal suit with notch lapels, perfect for galas, ceremonies, and upscale events. Tailored with premium fabric for a sophisticated silhouette.',
    brand: 'ProMayouf Luxe',
    category: 'Suits',
    subCategory: 'formal',
    price: 699.99,
    countInStock: 40,
    rating: 4.8,
    numReviews: 16,
    color: 'Black',
    material: 'Pure Wool',
    fit: 'Classic',
    style: 'Formal',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 8
      },
      {
        size: '42R',
        quantity: 8
      },
      {
        size: '44R',
        quantity: 8
      },
      {
        size: '46R',
        quantity: 8
      },
      {
        size: '48R',
        quantity: 8
      }
    ]
  },
  {
    name: 'Charcoal Modern Fit Blazer',
    image: '/images/charcoal-blazer.jpg',
    description: 'Versatile charcoal blazer that can be dressed up or down. Perfect for business casual settings.',
    brand: 'ProMayouf Classic',
    category: 'Blazers',
    subCategory: 'blazers',
    price: 299.99,
    countInStock: 40,
    rating: 4.3,
    numReviews: 10,
    color: 'Charcoal',
    material: 'Wool Blend',
    fit: 'Modern',
    style: 'Business',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 8
      },
      {
        size: '42R',
        quantity: 8
      },
      {
        size: '44R',
        quantity: 8
      },
      {
        size: '46R',
        quantity: 8
      },
      {
        size: '48R',
        quantity: 8
      }
    ]
  },
  {
    name: 'White Dress Shirt',
    image: '/images/white-dress-shirt.jpg',
    description: 'Premium cotton dress shirt with a modern fit. Essential for any formal wardrobe.',
    brand: 'ProMayouf Essentials',
    category: 'Dress Shirts',
    subCategory: 'oxford',
    price: 69.99,
    countInStock: 100,
    rating: 4.6,
    numReviews: 20,
    color: 'White',
    material: 'Cotton',
    fit: 'Modern',
    style: 'Business',
    pieces: 2,
    isOnSale: false,
    sizes: [{
        size: '40R',
        quantity: 20
      },
      {
        size: '42R',
        quantity: 20
      },
      {
        size: '44R',
        quantity: 20
      },
      {
        size: '46R',
        quantity: 20
      },
      {
        size: '48R',
        quantity: 20
      }
    ]
  }
];

export default products;