import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Container,
  Card,
  Button,
  Form,
  InputGroup,
  Toast,
  Badge,
  Carousel,
  Modal,
  Image,
  ListGroup,
} from 'react-bootstrap';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaFilter,
  FaSortAmountDown,
  FaHeart,
  FaShoppingCart,
  FaArrowUp,
  FaArrowRight,
  FaPercent,
  FaTags,
  FaComments,
  FaStar,
  FaStarHalfAlt,
  FaArrowLeft,
  FaEye,
  FaRegHeart,
  FaTimes,
  FaMinus,
  FaPlus,
  FaRobot,
  FaRuler,
} from 'react-icons/fa';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';
import { useDispatch } from 'react-redux';
import SizeRecommenderChatbot from '../components/SizeRecommenderChatbot';
import '../assets/styles/home.css';
import { toast } from 'react-toastify';

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { pageNumber, keyword, category } = useParams();

  // Get subcategory and other query params from URL
  const queryParams = new URLSearchParams(location.search);
  const subcategory = queryParams.get('subcategory');
  const urlCategory = queryParams.get('category');

  // Use the category from URL params or query params
  const activeCategory = category || urlCategory;

  console.log('Page URL params:', { pageNumber, keyword, category });
  console.log('Query params:', { urlCategory, subcategory });
  console.log('Active category:', activeCategory);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    category: activeCategory,
    subcategory,
  });

  // State variables
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [visibleSection, setVisibleSection] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const [animatedElements, setAnimatedElements] = useState({});

  // Featured categories - Update with more detailed information and subcategories
  const categories = [
    {
      id: 'suits',
      name: 'Suits',
      image: '/images/category-suits.jpg',
      description: 'Premium suits for every occasion, tailored to perfection.',
      link: '/category/suits',
      count: '150+ Items',
      subcategories: [
        { name: 'Business Suits', link: 'business-suits' },
        { name: 'Wedding Suits', link: 'wedding-suits' },
        { name: 'Tuxedos', link: 'tuxedos' },
        { name: 'Blazers', link: 'blazers' },
      ],
      featured: {
        title: 'Executive Collection',
        description: 'Premium suits for the modern professional.',
        link: 'executive-collection',
      },
    },
    {
      id: 'shoes',
      name: 'Shoes',
      image: '/images/category-shoes.jpg',
      description: 'Elevate your style with our exclusive footwear collection.',
      link: '/category/Shoes',
      count: '80+ Items',
      subcategories: [
        { name: 'Oxford Shoes', link: 'oxford-shoes' },
        { name: 'Loafers', link: 'loafers' },
        { name: 'Derby Shoes', link: 'derby-shoes' },
        { name: 'Dress Boots', link: 'dress-boots' },
      ],
      featured: {
        title: 'Premium Leather',
        description: 'Handcrafted from the finest materials.',
        link: 'premium-leather-shoes',
      },
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: '/images/category-accessories.jpg',
      description: 'Complete your look with our fine selection of accessories.',
      link: '/category/Accessories',
      count: '200+ Items',
      subcategories: [
        { name: 'Ties', link: 'ties' },
        { name: 'Belts', link: 'belts' },
        { name: 'Cufflinks', link: 'cufflinks' },
        { name: 'Pocket Squares', link: 'pocket-squares' },
      ],
      featured: {
        title: 'Gift Sets',
        description: 'Perfect combinations for any occasion.',
        link: 'accessory-gift-sets',
      },
    },
  ];

  // Special offers
  const specialOffers = [
    {
      title: 'Buy 1 Get 2 Free',
      description: 'Purchase any premium suit and get a second one free.',
      link: '/sale/bogo',
    },
    {
      title: 'Up to 40% Off',
      description: 'Limited time savings on select shoes and accessories.',
      link: '/sale',
    },
  ];

  // Customer testimonials
  const testimonials = [
    {
      rating: 5,
      content:
        "The quality of ProMayouf's suits is exceptional. I've received countless compliments on my recent purchase.",
      author: 'James Wilson',
      location: 'New York, NY',
    },
    {
      rating: 5,
      content:
        "The attention to detail in their tailoring is remarkable. Best suit I've ever owned.",
      author: 'Robert Johnson',
      location: 'Chicago, IL',
    },
    {
      rating: 4.5,
      content:
        'Great customer service and the fit was perfect. Would definitely shop here again.',
      author: 'Michael Brown',
      location: 'Los Angeles, CA',
    },
  ];

  // Hero slides
  const heroSlides = [
    {
      image: '/images/hero-1.jpg',
      title: 'Refined Elegance For Every Occasion',
      description:
        'Explore our new collection of premium suits designed for the modern gentleman.',
      link: '/category/suits',
      badge: 'New Arrivals',
    },
    {
      image: '/images/hero-2.jpg',
      title: 'Summer Sale Up To 50% Off',
      description:
        "Limited time offers on select styles and accessories. Shop now before they're gone.",
      link: '/sale',
      badge: 'Limited Time',
    },
  ];

  // Track scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSection(entry.target.id);
          setAnimatedElements((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.2 });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // Navigation functions
  const navigateToCategory = (categoryPath) => {
    // Extract the category name from the path if it's in the format "/category/X"
    const categoryName = categoryPath.includes('/category/')
      ? categoryPath.split('/category/')[1]
      : categoryPath;

    navigate(`/category/${categoryName}`);
    window.scrollTo(0, 0);
  };

  const navigateToViewAll = () => {
    // Navigate to the homepage with page parameter instead of /products which doesn't exist
    navigate('/page/1');
    window.scrollTo(0, 0);
  };

  // Add a function to filter products by category
  const filterByCategory = (category) => {
    if (data && data.products) {
      const filtered = data.products.filter(
        (product) =>
          product.category === category ||
          product.category.includes(category) ||
          (product.subCategory && product.subCategory.includes(category))
      );
      setFilteredProducts(filtered);
      setToastMessage(`Showing ${filtered.length} ${category} products`);
      setShowToast(true);
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      setToastMessage('Product removed from wishlist');
    } else {
      setWishlist([...wishlist, productId]);
      setToastMessage('Product added to wishlist');
    }
    setShowToast(true);

    // In a real app, this would dispatch to wishlist store/API
    // dispatch(toggleWishlistItem(productId))
  };

  // Handle direct add to cart
  const handleAddToCart = (product, qty = 1) => {
    // If the product has sizes, navigate to product detail page to select size
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product._id}`, {
        state: { from: `${location.pathname}${location.search}` },
      });
      toast.info('Please select a size before adding to cart');
      return;
    }

    dispatch(
      addToCart({
        ...product,
        qty,
        product: product._id,
      })
    );
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
    setShowQuickView(true);
  };

  // Close quick view modal
  const closeQuickView = () => {
    setShowQuickView(false);
    setTimeout(() => {
      setQuickViewProduct(null);
    }, 300);
  };

  // Handle quantity changes in quick view
  const handleIncreaseQty = () => {
    if (quickViewQty < 10) setQuickViewQty(quickViewQty + 1);
  };

  const handleDecreaseQty = () => {
    if (quickViewQty > 1) setQuickViewQty(quickViewQty - 1);
  };

  // Add to cart from quick view
  const addToCartFromQuickView = () => {
    if (quickViewProduct) {
      // If the product has sizes, navigate to product detail page to select size
      if (quickViewProduct.sizes && quickViewProduct.sizes.length > 0) {
        closeQuickView();
        navigate(`/product/${quickViewProduct._id}`, {
          state: { from: `${location.pathname}${location.search}` },
        });
        toast.info('Please select a size before adding to cart');
        return;
      }

      handleAddToCart(quickViewProduct, quickViewQty);
      closeQuickView();
    }
  };

  // Filter and sort products
  useEffect(() => {
    if (data && data.products) {
      let filtered = [...data.products];

      // Add debug logging for subcategory filtering
      console.log('Subcategory filter:', subcategory);
      console.log('Products before filtering:', filtered.length);

      // Apply subcategory filter if it exists
      if (subcategory) {
        filtered = filtered.filter((p) => {
          // Debug each product
          console.log(`Product ${p.name}:`, {
            subCategory: p.subCategory,
            matchesSubcategory:
              p.subCategory &&
              p.subCategory.toLowerCase() === subcategory.toLowerCase(),
          });

          return (
            // Case-insensitive comparison
            (p.subCategory &&
              p.subCategory.toLowerCase() === subcategory.toLowerCase()) ||
            (p.subCategories &&
              p.subCategories.some(
                (sc) => sc.toLowerCase() === subcategory.toLowerCase()
              )) ||
            (p.tags &&
              p.tags.some(
                (tag) => tag.toLowerCase() === subcategory.toLowerCase()
              ))
          );
        });

        console.log(
          'Products after filtering by subcategory:',
          filtered.length
        );
      }

      // Apply price filter
      if (priceFilter === 'under100') {
        filtered = filtered.filter((p) => p.price < 100);
      } else if (priceFilter === 'between100and200') {
        filtered = filtered.filter((p) => p.price >= 100 && p.price <= 200);
      } else if (priceFilter === 'over200') {
        filtered = filtered.filter((p) => p.price > 200);
      }

      // Apply sorting
      if (sortBy === 'priceAsc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'priceDesc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setFilteredProducts(filtered);
      console.log('Final filtered products count:', filtered.length);

      // Show toast about filtered results when subcategory is present
      if (subcategory && filtered.length > 0) {
        setToastMessage(
          `Showing ${filtered.length} products in ${
            subcategory.charAt(0).toUpperCase() + subcategory.slice(1)
          } Suits`
        );
        setShowToast(true);
      }
    }
  }, [data, priceFilter, sortBy, subcategory]);

  // Render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaStar key={i} style={{ opacity: 0.3 }} />);
      }
    }
    return stars;
  };

  // Handler for chatbot recommendations
  const handleSizeRecommendation = (recommendation) => {
    setChatbotOpen(false);
    setToastMessage(`Size recommendation: ${recommendation.size}`);
    setShowToast(true);
  };

  // Prevent scrolling when quick view is open
  useEffect(() => {
    if (showQuickView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showQuickView]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Meta title="ProMayouf - Premium Men's Fashion & Suits" />
      {/* Toast notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={2500}
        autohide
        className='position-fixed bottom-0 end-0 m-4'
        style={{ zIndex: 1000 }}
      >
        <Toast.Header>
          <strong className='me-auto'>Notification</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      {/* Quick View Modal */}
      <Modal
        show={showQuickView}
        onHide={closeQuickView}
        centered
        size='lg'
        className='quick-view-modal'
      >
        {quickViewProduct && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Quick View</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Image
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    fluid
                    className='quick-view-image'
                  />
                </Col>
                <Col md={6}>
                  <h3 className='quick-view-title'>{quickViewProduct.name}</h3>
                  <div className='d-flex align-items-center mb-2'>
                    <div className='quick-view-rating me-2'>
                      {renderRatingStars(quickViewProduct.rating)}
                    </div>
                    <span className='text-muted'>
                      ({quickViewProduct.numReviews} reviews)
                    </span>
                  </div>
                  <div className='quick-view-price mb-3'>
                    <h4>${quickViewProduct.price.toFixed(2)}</h4>
                    {quickViewProduct.regularPrice > quickViewProduct.price && (
                      <span className='original-price'>
                        ${quickViewProduct.regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className='quick-view-description mb-3'>
                    <p>{quickViewProduct.description}</p>
                  </div>
                  <div className='quick-view-stock mb-3'>
                    <Badge
                      bg={
                        quickViewProduct.countInStock > 0 ? 'success' : 'danger'
                      }
                    >
                      {quickViewProduct.countInStock > 0
                        ? 'In Stock'
                        : 'Out of Stock'}
                    </Badge>
                  </div>

                  {quickViewProduct.countInStock > 0 && (
                    <div className='d-flex align-items-center mb-3'>
                      <div className='quantity-selector me-3'>
                        <Button
                          variant='light'
                          className='qty-btn'
                          onClick={handleDecreaseQty}
                          disabled={quickViewQty === 1}
                        >
                          <FaMinus />
                        </Button>
                        <span className='qty-value'>{quickViewQty}</span>
                        <Button
                          variant='light'
                          className='qty-btn'
                          onClick={handleIncreaseQty}
                          disabled={
                            quickViewQty === quickViewProduct.countInStock
                          }
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className='quick-view-actions'>
                    <Button
                      className='add-to-cart-btn'
                      onClick={addToCartFromQuickView}
                      disabled={quickViewProduct.countInStock === 0}
                      style={{ backgroundColor: '#003b5c', border: 'none' }}
                    >
                      <FaShoppingCart className='me-2' /> Add to Cart
                    </Button>
                    <Button
                      variant='outline-secondary'
                      onClick={() =>
                        navigate(`/product/${quickViewProduct._id}`)
                      }
                      className='ms-2 view-details-btn'
                    >
                      View Full Details
                    </Button>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

      {subcategory ? (
        <Container className='py-3'>
          {location.state?.from ? (
            <Link
              to={location.state.from}
              className='btn btn-outline-dark mb-4'
            >
              <FaArrowLeft className='me-2' /> Back to{' '}
              {urlCategory
                ? urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)
                : 'Results'}
            </Link>
          ) : (
            <Link to='/' className='btn btn-outline-dark mb-4'>
              <FaArrowLeft className='me-2' /> Back to Home
            </Link>
          )}

          <h2>
            {urlCategory
              ? urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)
              : ''}{' '}
            {' > '}
            {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} Suits
          </h2>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <>
              <div className='d-flex justify-content-between align-items-center mb-4 mt-5'>
                <h3 className='mb-0'>Products ({filteredProducts.length})</h3>
                <Button
                  variant='outline-dark'
                  onClick={() => setFilterOpen(!filterOpen)}
                  className='filter-btn'
                  aria-expanded={filterOpen}
                  aria-controls='filter-panel'
                >
                  <FaFilter className='me-2' /> Filter & Sort
                </Button>
              </div>

              {/* Filter Panel */}
              {filterOpen && (
                <Card className='filter-panel mb-4'>
                  <Card.Body>
                    <Row>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label className='fw-bold'>
                            <FaFilter className='me-2' /> Price Range
                          </Form.Label>
                          <Form.Select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className='form-select-modern'
                          >
                            <option value='all'>All Prices</option>
                            <option value='under100'>Under $100</option>
                            <option value='between100and200'>
                              $100 - $200
                            </option>
                            <option value='over200'>Over $200</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label className='fw-bold'>
                            <FaSortAmountDown className='me-2' /> Sort By
                          </Form.Label>
                          <Form.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='form-select-modern'
                          >
                            <option value='newest'>Newest First</option>
                            <option value='priceAsc'>Price: Low to High</option>
                            <option value='priceDesc'>
                              Price: High to Low
                            </option>
                            <option value='name'>Name: A to Z</option>
                            <option value='rating'>Best Rated</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className='d-flex align-items-end'>
                        <Button
                          variant='outline-secondary'
                          className='w-100 reset-btn'
                          onClick={() => {
                            setPriceFilter('all');
                            setSortBy('newest');
                          }}
                        >
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <Row>
                {filteredProducts.length === 0 ? (
                  <Message>No products found</Message>
                ) : (
                  filteredProducts.map((product) => (
                    <Col
                      xl={3}
                      lg={4}
                      md={6}
                      key={product._id}
                      className='mb-4'
                    >
                      <Card className='product-card h-100'>
                        <div className='position-relative product-image-container'>
                          <Link
                            to={`/product/${product._id}`}
                            state={{
                              from: `${location.pathname}${location.search}`,
                            }}
                          >
                            <Card.Img
                              src={product.image}
                              alt={product.name}
                              className='product-image'
                            />
                            {product.isNew && (
                              <Badge className='product-badge new-badge'>
                                New
                              </Badge>
                            )}
                            {product.regularPrice > product.price && (
                              <Badge className='product-badge sale-badge'>
                                Sale
                              </Badge>
                            )}
                          </Link>
                          <div className='product-actions'>
                            <Button
                              variant='light'
                              className='action-btn'
                              onClick={() => handleAddToCart(product)}
                              title='Add to Cart'
                            >
                              <FaShoppingCart />
                            </Button>
                            <Button
                              variant='light'
                              className={`action-btn ${
                                wishlist.includes(product._id)
                                  ? 'text-danger'
                                  : ''
                              }`}
                              onClick={() => toggleWishlist(product._id)}
                              title={
                                wishlist.includes(product._id)
                                  ? 'Remove from Wishlist'
                                  : 'Add to Wishlist'
                              }
                            >
                              {wishlist.includes(product._id) ? (
                                <FaHeart />
                              ) : (
                                <FaRegHeart />
                              )}
                            </Button>
                            <Button
                              variant='light'
                              className='action-btn'
                              onClick={() => handleQuickView(product)}
                              title='Quick View'
                            >
                              <FaEye />
                            </Button>
                          </div>
                        </div>
                        <Card.Body>
                          <Link
                            to={`/product/${product._id}`}
                            state={{
                              from: `${location.pathname}${location.search}`,
                            }}
                            className='text-decoration-none'
                          >
                            <h3 className='product-title'>{product.name}</h3>
                          </Link>
                          <div className='product-price'>
                            ${product.price.toFixed(2)}
                            {product.regularPrice > product.price && (
                              <span className='original-price'>
                                ${product.regularPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant='link'
                            className='view-btn p-2'
                            onClick={() =>
                              navigate(`/product/${product._id}`, {
                                state: {
                                  from: `${location.pathname}${location.search}`,
                                },
                              })
                            }
                          >
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              <div className='d-flex justify-content-center mt-5'>
                <Paginate
                  pages={data.pages}
                  page={data.page}
                  keyword={keyword}
                />
              </div>
            </>
          )}
        </Container>
      ) : !keyword ? (
        <>
          {/* Hero Section */}
          <section className='hero-section'>
            <Carousel
              fade
              interval={6000}
              pause='hover'
              className='hero-slider'
            >
              {heroSlides.map((slide, index) => (
                <Carousel.Item key={index}>
                  <div
                    className='hero-slide'
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <Container>
                      <div className='hero-content'>
                        <div className='hero-badge'>{slide.badge}</div>
                        <h1 className='hero-title'>{slide.title}</h1>
                        <p className='hero-description'>{slide.description}</p>
                        <Link to={slide.link}>
                          <Button
                            variant='light'
                            size='lg'
                            className='hero-btn'
                            onClick={() => navigate(slide.link)}
                          >
                            Shop Now <FaArrowRight className='ms-2' />
                          </Button>
                        </Link>
                      </div>
                    </Container>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </section>

          {/* Category Showcase */}
          <section
            id='categoryShowcase'
            className={`category-showcase ${
              animatedElements.categoryShowcase ? 'section-visible' : ''
            }`}
          >
            <Container>
              <div className='section-title text-center mb-5'>
                <h2 className='section-heading'>Shop Our Collections</h2>
                <div className='fancy-divider'>
                  <span></span>
                </div>
                <p className='text-muted mx-auto' style={{ maxWidth: '700px' }}>
                  Discover our premium selection of suits, shoes, and
                  accessories crafted for the modern gentleman.
                </p>
              </div>
              <Row>
                {categories.map((category, index) => (
                  <Col lg={4} md={6} key={category.id} className='mb-5'>
                    <Card
                      className='category-card h-100'
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className='category-image-wrapper'>
                        <Card.Img
                          src={category.image}
                          alt={category.name}
                          className='category-image'
                        />
                        <div className='category-badge'>{category.count}</div>
                        <div className='category-overlay'>
                          <Button
                            className='category-overlay-btn'
                            onClick={() => navigateToCategory(category.link)}
                          >
                            Explore Collection
                          </Button>
                        </div>
                      </div>
                      <Card.Body>
                        <h3 className='card-title'>{category.name}</h3>
                        <p className='category-description text-muted'>
                          {category.description}
                        </p>
                        <div className='category-subcategories mb-3'>
                          <h6 className='subcategory-heading'>
                            Popular Categories
                          </h6>
                          <Row>
                            {category.subcategories.map((subcategory, idx) => (
                              <Col xs={6} key={idx}>
                                <Button
                                  variant='link'
                                  className='subcategory-link p-0 mb-2'
                                  onClick={() =>
                                    navigateToCategory(subcategory.link)
                                  }
                                >
                                  <i className='fas fa-angle-right me-1'></i>{' '}
                                  {subcategory.name}
                                </Button>
                              </Col>
                            ))}
                          </Row>
                        </div>
                        <Button
                          className='category-btn w-100'
                          onClick={() => navigateToCategory(category.link)}
                        >
                          Shop All {category.name}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>

          {/* Featured Products */}
          <section
            id='featuredProducts'
            className={`featured-products ${
              animatedElements.featuredProducts ? 'section-visible' : ''
            }`}
          >
            <Container>
              <div className='section-title'>
                <h2>Featured Products</h2>
                <p>
                  Our most popular items, carefully selected for superior
                  quality and style.
                </p>
              </div>
              {isLoading ? (
                <Loader />
              ) : error ? (
                <Message variant='danger'>
                  {error?.data?.message || error.error}
                </Message>
              ) : (
                <>
                  <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div>
                      <span className='text-muted'>
                        Showing {filteredProducts.length} products
                      </span>
                    </div>
                    <div className='d-flex align-items-center'>
                      <span className='me-2'>Sort by:</span>
                      <Form.Select
                        style={{ maxWidth: '200px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className='sort-select'
                      >
                        <option value='newest'>Newest</option>
                        <option value='priceAsc'>Price: Low to High</option>
                        <option value='priceDesc'>Price: High to Low</option>
                        <option value='rating'>Best Rated</option>
                        <option value='name'>Name</option>
                      </Form.Select>
                    </div>
                  </div>
                  <div className='featured-products-grid'>
                    {filteredProducts.slice(0, 8).map((product) => (
                      <div key={product._id} className='product-grid-item'>
                        <Card className='product-card h-100 border-0 modern-card'>
                          <div className='position-relative product-image-container'>
                            <Link
                              to={`/product/${product._id}`}
                              state={{
                                from: `${location.pathname}${location.search}`,
                              }}
                            >
                              <Card.Img
                                src={product.image}
                                alt={product.name}
                                className='product-image'
                              />
                              {product.isNew && (
                                <Badge
                                  bg='primary'
                                  className='product-badge new-badge'
                                  style={{ backgroundColor: '#003b5c' }}
                                >
                                  New
                                </Badge>
                              )}
                              {product.regularPrice > product.price && (
                                <Badge
                                  bg='danger'
                                  className='product-badge sale-badge'
                                >
                                  Sale
                                </Badge>
                              )}
                            </Link>
                            <div className='product-actions'>
                              <Button
                                variant='light'
                                className='action-btn'
                                onClick={() => handleAddToCart(product)}
                                title='Add to Cart'
                                aria-label='Add to Cart'
                              >
                                <FaShoppingCart />
                              </Button>
                              <Button
                                variant='light'
                                className={`action-btn ${
                                  wishlist.includes(product._id)
                                    ? 'text-danger'
                                    : ''
                                }`}
                                onClick={() => toggleWishlist(product._id)}
                                title={
                                  wishlist.includes(product._id)
                                    ? 'Remove from Wishlist'
                                    : 'Add to Wishlist'
                                }
                                aria-label={
                                  wishlist.includes(product._id)
                                    ? 'Remove from Wishlist'
                                    : 'Add to Wishlist'
                                }
                              >
                                {wishlist.includes(product._id) ? (
                                  <FaHeart />
                                ) : (
                                  <FaRegHeart />
                                )}
                              </Button>
                              <Button
                                variant='light'
                                className='action-btn'
                                onClick={() => handleQuickView(product)}
                                title='Quick View'
                                aria-label='Quick View'
                              >
                                <FaEye />
                              </Button>
                            </div>
                          </div>
                          <Card.Body>
                            <Link
                              to={`/product/${product._id}`}
                              state={{
                                from: `${location.pathname}${location.search}`,
                              }}
                              className='text-decoration-none'
                            >
                              <h3 className='product-title'>{product.name}</h3>
                            </Link>
                            <div className='product-rating'>
                              {renderRatingStars(product.rating)}
                              <span className='review-count'>
                                ({product.numReviews})
                              </span>
                            </div>
                            <div className='product-price'>
                              ${product.price.toFixed(2)}
                              {product.regularPrice > product.price && (
                                <span className='original-price'>
                                  ${product.regularPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className='product-action-btn'>
                              <Button
                                className='view-btn'
                                onClick={() =>
                                  navigate(`/product/${product._id}`, {
                                    state: {
                                      from: `${location.pathname}${location.search}`,
                                    },
                                  })
                                }
                              >
                                View Details
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                  <div className='text-center mt-5'>
                    <p className='mb-3 text-muted'>
                      Browse our complete collection of premium men's fashion
                    </p>
                    <Button
                      variant='outline-dark'
                      size='lg'
                      className='view-all-btn'
                      onClick={navigateToViewAll}
                    >
                      View All Products
                    </Button>
                  </div>
                </>
              )}
            </Container>
          </section>

          {/* Special Offers */}
          <section
            id='specialOffers'
            className={`special-offers-section ${
              animatedElements.specialOffers ? 'section-visible' : ''
            }`}
          >
            <Container>
              <div className='section-title'>
                <h2>Special Offers</h2>
                <p>
                  Take advantage of these limited-time deals on our premium
                  collections.
                </p>
              </div>
              <Row>
                {specialOffers.map((offer, index) => (
                  <Col md={6} key={index}>
                    <div className='offer-card'>
                      <div className='offer-content'>
                        <h3 className='offer-title'>{offer.title}</h3>
                        <p className='offer-description'>{offer.description}</p>
                        <Button
                          className='offer-btn'
                          onClick={() => navigate(offer.link)}
                        >
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>

          {/* Testimonials */}
          <section
            id='testimonials'
            className={`testimonials-section ${
              animatedElements.testimonials ? 'section-visible' : ''
            }`}
          >
            <Container>
              <div className='section-title'>
                <h2>Customer Testimonials</h2>
                <p>
                  Hear what our satisfied customers have to say about their
                  ProMayouf experience.
                </p>
              </div>
              <Row>
                {testimonials.map((testimonial, index) => (
                  <Col md={4} key={index}>
                    <div className='testimonial-card'>
                      <div className='testimonial-rating'>
                        {renderRatingStars(testimonial.rating)}
                      </div>
                      <p className='testimonial-content'>
                        "{testimonial.content}"
                      </p>
                      <h4 className='testimonial-author'>
                        {testimonial.author}
                      </h4>
                      <p className='testimonial-location'>
                        {testimonial.location}
                      </p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>

          {/* Brand Logos Section */}
          <section
            className={`brands-section ${
              animatedElements.brandLogos ? 'section-visible' : ''
            }`}
            id='brandLogos'
          >
            <Container>
              <div className='brand-title'>
                <h3>Our Trusted Partners</h3>
              </div>
              <Row className='align-items-center'>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-1.png'
                    alt='Brand 1'
                    className='brand-logo'
                  />
                </Col>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-2.png'
                    alt='Brand 2'
                    className='brand-logo'
                  />
                </Col>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-3.png'
                    alt='Brand 3'
                    className='brand-logo'
                  />
                </Col>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-4.png'
                    alt='Brand 4'
                    className='brand-logo'
                  />
                </Col>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-5.png'
                    alt='Brand 5'
                    className='brand-logo'
                  />
                </Col>
                <Col xs={6} md={2} className='mb-4 mb-md-0'>
                  <img
                    src='/images/brand-6.png'
                    alt='Brand 6'
                    className='brand-logo'
                  />
                </Col>
              </Row>
            </Container>
          </section>

          {/* Featured Category Spotlight */}
          <section
            id='categorySpotlight'
            className={`category-spotlight ${
              animatedElements.categorySpotlight ? 'section-visible' : ''
            }`}
          >
            <Container>
              <div className='section-title'>
                <h2>Category Spotlight</h2>
                <p>Explore our hand-picked selections from each category</p>
              </div>
              <Row className='mb-5'>
                {categories.map((category) => (
                  <Col md={4} key={`spotlight-${category.id}`} className='mb-4'>
                    <div className='category-spotlight-card'>
                      <div className='spotlight-header'>
                        <h3>{category.name}</h3>
                        <span className='spotlight-count'>
                          {category.count}
                        </span>
                      </div>
                      <div className='spotlight-featured'>
                        <h4>{category.featured.title}</h4>
                        <p>{category.featured.description}</p>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          className='spotlight-btn'
                          onClick={() =>
                            navigateToCategory(category.featured.link)
                          }
                        >
                          Explore Collection
                        </Button>
                      </div>
                      <div className='spotlight-subcategories'>
                        <ul className='list-unstyled'>
                          {category.subcategories.map((sub, idx) => (
                            <li key={idx}>
                              <Button
                                variant='link'
                                className='subcategory-link'
                                onClick={() => navigateToCategory(sub.link)}
                              >
                                {sub.name}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        variant='primary'
                        className='w-100 spotlight-main-btn'
                        onClick={() => navigateToCategory(category.link)}
                      >
                        View All {category.name}
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>

          {/* Chatbot toggle button that opens the chatbot */}
          <div
            className='position-fixed bottom-0 end-0 m-4'
            style={{ zIndex: 1200 }}
          >
            <SizeRecommenderChatbot
              onRecommendationComplete={handleSizeRecommendation}
              productType='General'
              open={chatbotOpen}
              setOpen={setChatbotOpen}
            />
            {!chatbotOpen && (
              <Button
                onClick={() => setChatbotOpen(true)}
                className='rounded-circle shadow-lg chatbot-toggle-btn'
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#003b5c',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
                aria-label='Open Size Assistant Chatbot'
              >
                <div className='pulse-ring'></div>
                <FaRobot size={24} />
              </Button>
            )}
          </div>

          {/* Scroll to top button - always accessible */}
          {scrollPosition > 300 && (
            <Button
              className='position-fixed scroll-to-top'
              style={{ zIndex: 1000, bottom: '20px', right: '20px' }}
              variant='dark'
              onClick={scrollToTop}
              aria-label='Scroll to top'
            >
              <FaArrowUp />
            </Button>
          )}
        </>
      ) : (
        // Search results view
        <Container className='py-3'>
          <Link to='/' className='btn btn-outline-dark mb-4'>
            <FaArrowLeft className='me-2' /> Back to Home
          </Link>

          <h2>Search Results for "{keyword}"</h2>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <>
              <div className='d-flex justify-content-between align-items-center mb-4 mt-5'>
                <h3 className='mb-0'>Products ({filteredProducts.length})</h3>
                <Button
                  variant='outline-dark'
                  onClick={() => setFilterOpen(!filterOpen)}
                  className='filter-btn'
                  aria-expanded={filterOpen}
                  aria-controls='filter-panel'
                >
                  <FaFilter className='me-2' /> Filter & Sort
                </Button>
              </div>

              {/* Filter Panel */}
              {filterOpen && (
                <Card className='filter-panel mb-4'>
                  <Card.Body>
                    <Row>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label className='fw-bold'>
                            <FaFilter className='me-2' /> Price Range
                          </Form.Label>
                          <Form.Select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className='form-select-modern'
                          >
                            <option value='all'>All Prices</option>
                            <option value='under100'>Under $100</option>
                            <option value='between100and200'>
                              $100 - $200
                            </option>
                            <option value='over200'>Over $200</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label className='fw-bold'>
                            <FaSortAmountDown className='me-2' /> Sort By
                          </Form.Label>
                          <Form.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='form-select-modern'
                          >
                            <option value='newest'>Newest First</option>
                            <option value='priceAsc'>Price: Low to High</option>
                            <option value='priceDesc'>
                              Price: High to Low
                            </option>
                            <option value='name'>Name: A to Z</option>
                            <option value='rating'>Best Rated</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className='d-flex align-items-end'>
                        <Button
                          variant='outline-secondary'
                          className='w-100 reset-btn'
                          onClick={() => {
                            setPriceFilter('all');
                            setSortBy('newest');
                          }}
                        >
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <Row>
                {filteredProducts.length === 0 ? (
                  <Message>No products found</Message>
                ) : (
                  filteredProducts.map((product) => (
                    <Col
                      xl={3}
                      lg={4}
                      md={6}
                      key={product._id}
                      className='mb-4'
                    >
                      <Card className='product-card h-100'>
                        <div className='position-relative product-image-container'>
                          <Link
                            to={`/product/${product._id}`}
                            state={{
                              from: `${location.pathname}${location.search}`,
                            }}
                          >
                            <Card.Img
                              src={product.image}
                              alt={product.name}
                              className='product-image'
                            />
                            {product.isNew && (
                              <Badge className='product-badge new-badge'>
                                New
                              </Badge>
                            )}
                            {product.regularPrice > product.price && (
                              <Badge className='product-badge sale-badge'>
                                Sale
                              </Badge>
                            )}
                          </Link>
                          <div className='product-actions'>
                            <Button
                              variant='light'
                              className='action-btn'
                              onClick={() => handleAddToCart(product)}
                              title='Add to Cart'
                            >
                              <FaShoppingCart />
                            </Button>
                            <Button
                              variant='light'
                              className={`action-btn ${
                                wishlist.includes(product._id)
                                  ? 'text-danger'
                                  : ''
                              }`}
                              onClick={() => toggleWishlist(product._id)}
                              title={
                                wishlist.includes(product._id)
                                  ? 'Remove from Wishlist'
                                  : 'Add to Wishlist'
                              }
                            >
                              {wishlist.includes(product._id) ? (
                                <FaHeart />
                              ) : (
                                <FaRegHeart />
                              )}
                            </Button>
                            <Button
                              variant='light'
                              className='action-btn'
                              onClick={() => handleQuickView(product)}
                              title='Quick View'
                            >
                              <FaEye />
                            </Button>
                          </div>
                        </div>
                        <Card.Body>
                          <Link
                            to={`/product/${product._id}`}
                            state={{
                              from: `${location.pathname}${location.search}`,
                            }}
                            className='text-decoration-none'
                          >
                            <h3 className='product-title'>{product.name}</h3>
                          </Link>
                          <div className='product-price'>
                            ${product.price.toFixed(2)}
                            {product.regularPrice > product.price && (
                              <span className='original-price'>
                                ${product.regularPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant='link'
                            className='view-btn p-2'
                            onClick={() =>
                              navigate(`/product/${product._id}`, {
                                state: {
                                  from: `${location.pathname}${location.search}`,
                                },
                              })
                            }
                          >
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
              <div className='d-flex justify-content-center mt-5'>
                <Paginate
                  pages={data.pages}
                  page={data.page}
                  keyword={keyword}
                />
              </div>
            </>
          )}
        </Container>
      )}
    </>
  );
};

export default HomeScreen;
