import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
  Container,
  Modal,
  Alert,
  Tabs,
  Tab,
  Nav,
  Badge,
  ProgressBar,
  Accordion,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactImageMagnify from 'react-image-magnify';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetProductsQuery,
} from '../slices/productsApiSlice';
import {
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaShare,
  FaRuler,
  FaTruck,
  FaExchangeAlt,
  FaInfoCircle,
  FaCheck,
  FaMinus,
  FaPlus,
  FaRegClock,
  FaArrowLeft,
  FaRobot,
  FaExclamationTriangle,
} from 'react-icons/fa';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';
import SuitCustomizer from '../components/SuitCustomizer';
import CustomizationGuide from '../components/CustomizationGuide';
import CustomizationChatbot from '../components/CustomizationChatbot';
import '../assets/styles/customization.css';
import '../assets/styles/product.css';
import BreadcrumbNav from '../components/BreadcrumbNav';

// Add error handling for WebSocket connections
const handleWebSocketError = () => {
  console.error('WebSocket connection failed. This may affect live updates and hot reloading.');
  // This only affects development environment hot reloading, not functionality
};

// If running in browser environment, add global error handler for WebSockets
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('WebSocket connection')) {
      handleWebSocketError();
      // Prevent the error from showing in console
      event.preventDefault();
    }
  });
}

const ProductScreen = () => {
  const { id: productId } = useParams();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reviewsRef = useRef(null);
  const addToCartRef = useRef(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizations, setCustomizations] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [highlightRecommended, setHighlightRecommended] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [stickyVisible, setStickyVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState({
    id: 'navy',
    name: 'Navy Blue',
    hex: '#1a2c42',
  });
  const [showCustomizationChatbot, setShowCustomizationChatbot] =
    useState(false);
  const [customizerError, setCustomizerError] = useState(null);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  // Get related products based on category
  const { data: productsData } = useGetProductsQuery({
    pageSize: 4,
    category: product?.category,
  });

  const relatedProducts =
    productsData?.products?.filter((p) => p._id !== productId).slice(0, 4) ||
    [];

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  // Get query parameters for breadcrumb navigation
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const subcategoryParam = queryParams.get('subcategory');
  const customizeParam = queryParams.get('customize');
  const cartItemId = queryParams.get('cartItemId');

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // Find cart item if editing from cart
  const cartItem = cartItemId
    ? cartItems.find((item) => item._id === productId)
    : null;
  const isEditingCartItem = Boolean(cartItem && customizeParam === 'true');

  // Track scroll for sticky add to cart
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setStickyVisible(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open customizer automatically if customize=true in URL
  useEffect(() => {
    if (customizeParam === 'true' && product?.category === 'Suits') {
      setShowCustomizer(true);
      setActiveTab('customize');

      // If editing from cart, set the existing customizations
      if (cartItem && cartItem.customizations) {
        setCustomizations(cartItem.customizations);
      }

      // Scroll to customizer after a short delay to ensure the component is rendered
      setTimeout(() => {
        const customiserSection = document.getElementById('customizer-section');
        if (customiserSection) {
          customiserSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          setCustomizerError('Cannot find customizer section.');
        }
      }, 500);
    }
  }, [customizeParam, product, cartItem]);

  const handleCustomizationComplete = (customizationData) => {
    setCustomizations(customizationData);
    setShowCustomizer(false);
    setCustomizerError(null);

    // If we came from cart and have a cart item, update the cart with new customizations
    if (isEditingCartItem && cartItem) {
      dispatch(
        addToCart({
          ...cartItem,
          customizations: customizationData,
        })
      );
      toast.success('Customization updated successfully!');

      // Navigate back to cart after updating
      setTimeout(() => navigate('/cart'), 1500);
    } else {
      toast.success('Customization saved successfully');
    }
  };

  const addToCartHandler = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    dispatch(
      addToCart({
        ...product,
        qty,
        selectedSize,
        selectedColor,
        customizations: customizations || null,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const buyNowHandler = () => {
    addToCartHandler();
    navigate('/cart');
  };

  const handleSizeRecommendation = (recommendation) => {
    if (recommendation.selected) {
      // User clicked to select the recommended size
      setSelectedSize(recommendation.size);
      toast.success(`Size ${recommendation.size} selected!`);
      setHighlightRecommended(true);

      // Remove highlight after animation completes
      setTimeout(() => setHighlightRecommended(false), 3000);
    } else {
      // Just store the recommendation
      setRecommendedSize(recommendation);
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveTab('reviews');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review submitted');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Calculate rating distribution
  const getRatingCounts = () => {
    if (!product?.reviews) return Array(5).fill(0);

    const counts = Array(5).fill(0);
    product.reviews.forEach((review) => {
      if (review.rating > 0 && review.rating <= 5) {
        counts[5 - review.rating]++;
      }
    });
    return counts;
  };

  // Product images array (main image + additional angles if available)
  const productImages = product
    ? [
        product.image,
        // Use sample image for additional angles until proper images are added
        '/images/sample.jpg',
        '/images/sample.jpg',
        '/images/sample.jpg',
      ]
    : [];

  const carouselResponsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
    },
  };

  const handleCustomizeClick = () => {
    setShowCustomizer(true);
    setActiveTab('customize');
    setCustomizerError(null);
    
    // Add smooth scrolling to the customizer section
    setTimeout(() => {
      const customiserSection = document.getElementById('customizer-section');
      if (customiserSection) {
        customiserSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCustomizerError('Cannot find customizer section. Please try refreshing the page.');
      }
    }, 100);
  };

  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  const toggleCustomizationChatbot = () => {
    setShowCustomizationChatbot(!showCustomizationChatbot);
  };

  // Helper function to check if a size is available
  const isSizeAvailable = (sizeValue) => {
    if (!product?.sizes) return false;
    const sizeObj = product.sizes.find((s) => s.size === sizeValue);
    return sizeObj && sizeObj.quantity > 0;
  };

  // Size guide modal
  const SizeGuideModal = () => (
    <Modal
      show={showSizeGuide}
      onHide={() => setShowSizeGuide(false)}
      size='lg'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Size Guide</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Measurements (inches)</h5>
        <table className='size-table'>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Waist</th>
              <th>Hips</th>
              <th>Shoulder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S</td>
              <td>36-38</td>
              <td>30-32</td>
              <td>36-38</td>
              <td>17</td>
            </tr>
            <tr>
              <td>M</td>
              <td>39-41</td>
              <td>33-34</td>
              <td>39-41</td>
              <td>17.5</td>
            </tr>
            <tr>
              <td>L</td>
              <td>42-44</td>
              <td>35-37</td>
              <td>42-44</td>
              <td>18</td>
            </tr>
            <tr>
              <td>XL</td>
              <td>45-47</td>
              <td>38-40</td>
              <td>45-47</td>
              <td>18.5</td>
            </tr>
          </tbody>
        </table>
        <div className='mt-4 text-center'>
          <p>Not sure about your size?</p>
          <Button
            variant='outline-primary'
            onClick={() => {
              setShowSizeGuide(false);
              setTimeout(
                () => document.querySelector('.size-assistant-btn').click(),
                300
              );
            }}
          >
            <FaRuler className='me-2' /> Use Size Assistant
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );

  // Sticky Add to Cart
  const StickyAddToCart = () => {
    if (!stickyVisible || !product) return null;

    return (
      <div className='sticky-add-to-cart'>
        <Container>
          <Row className='align-items-center'>
            <Col xs={2} sm={1}>
              <Image src={product.image} alt={product.name} thumbnail />
            </Col>
            <Col xs={6} sm={3}>
              <h5 className='product-sticky-title'>{product.name}</h5>
              <div className='product-sticky-price'>
                ${product.price.toFixed(2)}
              </div>
            </Col>
            <Col xs={4} sm={2} className='d-none d-sm-block'>
              <Form.Select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className='form-select-sm me-2'
              >
                <option value=''>Size</option>
                {product.sizes?.map((size) => (
                  <option
                    key={size.size}
                    value={size.size}
                    disabled={size.quantity === 0}
                  >
                    {size.size} {size.quantity === 0 ? '(Out of Stock)' : ''}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={4} sm={2} className='d-none d-sm-block'>
              <div className='d-flex align-items-center'>
                <div className='color-selector-sticky d-flex gap-2'>
                  {/* Only show active color in sticky header */}
                  <div
                    style={{
                      backgroundColor: selectedColor?.hex || '#1a2c42',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                    }}
                  ></div>
                  <small className='text-truncate'>
                    {selectedColor?.name || 'Navy Blue'}
                  </small>
                </div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={4}
              className='d-flex justify-content-end align-items-center'
            >
              <Button
                type='button'
                className='add-to-cart-btn'
                disabled={!selectedSize}
                onClick={addToCartHandler}
              >
                <FaShoppingCart className='me-2' /> Add to Cart
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  return (
    <Container className='product-page-container'>
      <Meta title={product?.name} description={product?.description} />

      {/* Back to results link */}
      {location.state?.from && (
        <Link to={location.state.from} className='back-link'>
          <FaArrowLeft /> Back to results
        </Link>
      )}

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        category={product?.category || categoryParam}
        subcategory={product?.subCategory || subcategoryParam}
        product={product?.name}
      />

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <StickyAddToCart />
          <SizeGuideModal />
          <CustomizationGuide show={showGuide} onHide={toggleGuide} />
          <CustomizationChatbot
            open={showCustomizationChatbot}
            setOpen={setShowCustomizationChatbot}
            onCustomizationComplete={handleCustomizationComplete}
            initialCustomizations={customizations}
          />

          {product?.category === 'Suits' && !showCustomizationChatbot && (
            <div
              className='chatbot-toggle'
              onClick={toggleCustomizationChatbot}
              title='Open Customization Assistant'
            >
              <FaRobot />
            </div>
          )}

          <Row className='product-main-content'>
            {/* Product Images */}
            <Col lg={6} className='product-gallery mb-4'>
              <div className='product-image-container'>
                <div className='product-badges'>
                  {product.isOnSale && (
                    <span className='badge sale-badge'>SALE</span>
                  )}
                  {product.countInStock === 0 && (
                    <span className='badge sold-out-badge'>SOLD OUT</span>
                  )}
                  {product.isNew && (
                    <span className='badge new-badge'>NEW</span>
                  )}
                </div>
                <ReactImageMagnify
                  {...{
                    smallImage: {
                      alt: product.name,
                      isFluidWidth: true,
                      src: productImages[selectedImage],
                    },
                    largeImage: {
                      src: productImages[selectedImage],
                      width: 1200,
                      height: 1800,
                    },
                    enlargedImageContainerStyle: { zIndex: 9 },
                    hoverDelayInMs: 100,
                  }}
                />
                <div className='wishlist-button' onClick={toggleWishlist}>
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                </div>
                <div className='image-share-button'>
                  <FaShare />
                </div>
              </div>

              <div className='mt-3 product-thumbnails'>
                <Carousel
                  responsive={carouselResponsive}
                  infinite={false}
                  itemClass='carousel-thumbnail-item'
                  containerClass='carousel-container'
                >
                  {productImages.map((image, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail-item ${
                        selectedImage === idx ? 'active' : ''
                      }`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={image} alt={`View ${idx + 1}`} />
                    </div>
                  ))}
                </Carousel>
              </div>
            </Col>

            {/* Product Details */}
            <Col lg={6} className='product-info' ref={addToCartRef}>
              <div className='product-info-inner'>
                <div className='breadcrumbs mb-2'>
                  <small>
                    <Link to='/'>Home</Link> /
                    <Link to={`/category/${product.category}`}>
                      {' '}
                      {product.category}
                    </Link>{' '}
                    /<span className='breadcrumb-current'> {product.name}</span>
                  </small>
                </div>

                <h1 className='product-title'>{product.name}</h1>

                {/* Color options right under the product name */}
                <div className='product-colors mb-3'>
                  <div className='d-flex align-items-center'>
                    <span className='me-3 text-muted'>Color:</span>
                    <div className='d-flex gap-2'>
                      <div
                        className='color-option active'
                        style={{
                          backgroundColor: '#1a2c42',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: '2px solid #003b5c',
                        }}
                        title='Navy Blue'
                        onClick={() =>
                          setSelectedColor({
                            id: 'navy',
                            name: 'Navy Blue',
                            hex: '#1a2c42',
                          })
                        }
                      ></div>
                      <div
                        className='color-option'
                        style={{
                          backgroundColor: '#1c1c1c',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                        }}
                        title='Black'
                        onClick={() =>
                          setSelectedColor({
                            id: 'black',
                            name: 'Black',
                            hex: '#1c1c1c',
                          })
                        }
                      ></div>
                      <div
                        className='color-option'
                        style={{
                          backgroundColor: '#3b3b3b',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                        }}
                        title='Charcoal'
                        onClick={() =>
                          setSelectedColor({
                            id: 'charcoal',
                            name: 'Charcoal',
                            hex: '#3b3b3b',
                          })
                        }
                      ></div>
                      <div
                        className='color-option'
                        style={{
                          backgroundColor: '#4f3222',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                        }}
                        title='Brown'
                        onClick={() =>
                          setSelectedColor({
                            id: 'brown',
                            name: 'Brown',
                            hex: '#4f3222',
                          })
                        }
                      ></div>
                    </div>
                    {selectedColor && (
                      <span className='ms-3 small'>{selectedColor.name}</span>
                    )}
                  </div>
                </div>

                <div className='product-meta d-flex align-items-center mb-3'>
                  <div className='product-rating' onClick={scrollToReviews}>
                    <Rating
                      value={product.rating}
                      text={`${product.numReviews} reviews`}
                    />
                  </div>
                </div>

                <div className='product-price-container mb-4'>
                  {product.price < product.regularPrice ? (
                    <>
                      <span className='product-current-price'>
                        ${product.price.toFixed(2)}
                      </span>
                      <span className='product-old-price'>
                        ${product.regularPrice.toFixed(2)}
                      </span>
                      <Badge bg='danger' className='ms-2'>
                        {Math.round(
                          ((product.regularPrice - product.price) /
                            product.regularPrice) *
                            100
                        )}
                        % OFF
                      </Badge>
                    </>
                  ) : (
                    <span className='product-current-price'>
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className='product-description-short mb-4'>
                  <p>{product.description.slice(0, 150)}...</p>
                </div>

                {product.category === 'Suits' && (
                  <div className='customize-option mb-4'>
                    <Button
                      variant='outline-dark'
                      onClick={handleCustomizeClick}
                    >
                      Customize This Suit
                    </Button>
                    <Button
                      variant='link'
                      className='ms-2'
                      onClick={toggleGuide}
                    >
                      Customization Guide
                    </Button>
                    <Button
                      variant='outline-primary'
                      className='ms-2'
                      onClick={toggleCustomizationChatbot}
                    >
                      <FaRobot className='me-2' />
                      Use Customization Assistant
                    </Button>
                  </div>
                )}

                <div className='product-form mb-4'>
                  <Form>
                    <Row className='align-items-center mb-3'>
                      <Col xs={12} sm={3}>
                        <Form.Label className='mb-0'>Size:</Form.Label>
                      </Col>
                      <Col xs={8} sm={6}>
                        <Form.Select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className={`${
                            highlightRecommended ? 'highlight-recommended' : ''
                          }`}
                        >
                          <option value=''>Select Size</option>
                          {product.sizes?.map((size) => (
                            <option
                              key={size.size}
                              value={size.size}
                              disabled={size.quantity === 0}
                            >
                              {size.size}{' '}
                              {size.quantity === 0 ? '(Out of Stock)' : ''}
                              {recommendedSize &&
                              recommendedSize.size === size.size
                                ? ' (Recommended)'
                                : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={4} sm={3}>
                        <Button
                          variant='link'
                          className='size-guide-link p-0'
                          onClick={() => setShowSizeGuide(true)}
                        >
                          Size Guide
                        </Button>
                      </Col>
                    </Row>

                    <Row className='align-items-center mb-4'>
                      <Col xs={12} sm={3}>
                        <Form.Label className='mb-0'>Quantity:</Form.Label>
                      </Col>
                      <Col xs={6} sm={4}>
                        <div className='quantity-selector'>
                          <Button
                            variant='outline-secondary'
                            className='quantity-btn'
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            disabled={qty <= 1}
                          >
                            <FaMinus />
                          </Button>
                          <Form.Control
                            type='number'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            min={1}
                            max={product.countInStock}
                            className='text-center'
                          />
                          <Button
                            variant='outline-secondary'
                            className='quantity-btn'
                            onClick={() =>
                              setQty(Math.min(product.countInStock, qty + 1))
                            }
                            disabled={qty >= product.countInStock}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </Col>
                      <Col xs={6} sm={5}>
                        <small className='text-muted'>
                          {product.countInStock > 0 ? (
                            <>
                              <FaCheck className='text-success me-1' /> In
                              Stock: {product.countInStock} items
                            </>
                          ) : (
                            <span className='text-danger'>Out of Stock</span>
                          )}
                        </small>
                      </Col>
                    </Row>

                    <div className='product-actions'>
                      <Button
                        type='button'
                        className='add-to-cart-btn size-assistant-btn me-2'
                        variant='outline-dark'
                        onClick={() =>
                          document.querySelector('.chatbot-toggle').click()
                        }
                      >
                        <FaRuler className='me-2' /> Size Assistant
                      </Button>

                      <Button
                        type='button'
                        className='add-to-cart-btn'
                        disabled={product.countInStock === 0 || !selectedSize}
                        onClick={addToCartHandler}
                      >
                        <FaShoppingCart className='me-2' /> Add to Cart
                      </Button>

                      <Button
                        type='button'
                        className='buy-now-btn mt-2'
                        disabled={product.countInStock === 0 || !selectedSize}
                        onClick={buyNowHandler}
                        variant='success'
                      >
                        Buy Now
                      </Button>
                    </div>
                  </Form>
                </div>

                <div className='shipping-info'>
                  <div className='shipping-info-item'>
                    <FaTruck />
                    <div>
                      <strong>Free Shipping</strong>
                      <p>Delivery in 3-5 working days</p>
                    </div>
                  </div>
                  <div className='shipping-info-item'>
                    <FaExchangeAlt />
                    <div>
                      <strong>30-Day Returns</strong>
                      <p>Satisfaction guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Row className='product-details-tabs'>
            <Col xs={12}>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className='mb-4 product-tabs'
              >
                <Tab eventKey='description' title='Description'>
                  <div className='product-description'>
                    <p>{product.description}</p>

                    <h5 className='mt-4'>Product Details</h5>
                    <ul className='product-details-list'>
                      <li>
                        <strong>Material:</strong> Premium quality fabric
                      </li>
                      <li>
                        <strong>Style:</strong> Modern fit
                      </li>
                      <li>
                        <strong>Care Instructions:</strong> Dry clean only
                      </li>
                      <li>
                        <strong>SKU:</strong>{' '}
                        {product._id.slice(-6).toUpperCase()}
                      </li>
                    </ul>
                  </div>
                </Tab>

                <Tab
                  eventKey='reviews'
                  title={`Reviews (${product.numReviews})`}
                >
                  <div className='product-reviews' ref={reviewsRef}>
                    <Row>
                      <Col md={4}>
                        <div className='review-summary'>
                          <div className='review-average'>
                            <h3>{product.rating.toFixed(1)}</h3>
                            <div className='large-rating'>
                              <Rating value={product.rating} />
                            </div>
                            <p>{product.numReviews} Reviews</p>
                          </div>

                          <div className='rating-bars'>
                            {getRatingCounts().map((count, idx) => (
                              <div key={idx} className='rating-bar-item'>
                                <div className='rating-label'>
                                  {5 - idx} stars
                                </div>
                                <ProgressBar
                                  now={
                                    product.numReviews > 0
                                      ? (count / product.numReviews) * 100
                                      : 0
                                  }
                                  className='rating-progress'
                                />
                                <div className='rating-count'>{count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Col>

                      <Col md={8}>
                        <h4 className='mb-3'>Customer Reviews</h4>

                        {product.reviews.length === 0 && (
                          <Message>No Reviews</Message>
                        )}

                        <div className='review-list'>
                          {product.reviews.map((review) => (
                            <div key={review._id} className='review-item'>
                              <div className='review-header'>
                                <div className='reviewer-info'>
                                  <strong>{review.name}</strong>
                                  <div className='review-date'>
                                    <FaRegClock className='me-1' />
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <Rating value={review.rating} />
                              </div>
                              <p className='review-comment'>{review.comment}</p>
                            </div>
                          ))}
                        </div>

                        <div className='write-review-container'>
                          <h4 className='mb-3'>Write a Review</h4>

                          {loadingProductReview && <Loader />}

                          {userInfo ? (
                            <Form onSubmit={submitHandler}>
                              <Form.Group controlId='rating' className='mb-3'>
                                <Form.Label>Rating</Form.Label>
                                <div className='rating-select'>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <Button
                                      key={num}
                                      variant='link'
                                      className={`p-0 rating-star ${
                                        rating >= num ? 'selected' : ''
                                      }`}
                                      onClick={() => setRating(num)}
                                    >
                                      {rating >= num ? (
                                        <FaStar />
                                      ) : (
                                        <FaRegStar />
                                      )}
                                    </Button>
                                  ))}
                                </div>
                              </Form.Group>

                              <Form.Group controlId='comment' className='mb-3'>
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                  as='textarea'
                                  rows={3}
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                ></Form.Control>
                              </Form.Group>

                              <Button
                                disabled={loadingProductReview}
                                type='submit'
                                variant='primary'
                              >
                                Submit Review
                              </Button>
                            </Form>
                          ) : (
                            <Message>
                              Please <Link to='/login'>sign in</Link> to write a
                              review
                            </Message>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {product.category === 'Suits' && (
                  <Tab eventKey='customize' title='Customize'>
                    <div
                      id='customizer-section'
                      className='customizer-container'
                    >
                      {customizerError && (
                        <Alert variant='danger' className='mb-3'>
                          {customizerError}
                        </Alert>
                      )}
                      
                      {showCustomizer ? (
                        <SuitCustomizer
                          product={product}
                          onComplete={handleCustomizationComplete}
                          initialCustomizations={customizations}
                          isEditingCartItem={isEditingCartItem}
                          onOpenGuide={toggleGuide}
                        />
                      ) : (
                        <div className='text-center p-5'>
                          <h4>Customize Your Suit</h4>
                          <p>
                            Create a bespoke suit tailored to your preferences
                            and measurements.
                          </p>
                          <div className='d-flex justify-content-center gap-3'>
                            <Button
                              variant='primary'
                              onClick={handleCustomizeClick}
                            >
                              Start Customization
                            </Button>
                            <Button
                              variant='outline-primary'
                              onClick={toggleCustomizationChatbot}
                            >
                              <FaRobot className='me-2' />
                              Use Customization Assistant
                            </Button>
                          </div>
                          <div className='mt-4 alert alert-warning'>
                            <FaExclamationTriangle className='me-2' />
                            <strong>Please Note:</strong> Customized suits are
                            not eligible for returns, but we offer free in-store
                            adjustments.
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab>
                )}
              </Tabs>
            </Col>
          </Row>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className='related-products-section mt-5'>
              <h3 className='mb-4'>You May Also Like</h3>
              <Row>
                {relatedProducts.map((product) => (
                  <Col key={product._id} sm={6} md={3} className='mb-4'>
                    <Card className='product-card h-100 border-0'>
                      <Link
                        to={{
                          pathname: `/product/${product._id}`,
                          state: { from: location.pathname + location.search },
                        }}
                      >
                        <Card.Img
                          src={product.image}
                          variant='top'
                          className='product-image'
                        />
                      </Link>
                      <Card.Body>
                        <Link
                          to={{
                            pathname: `/product/${product._id}`,
                            state: {
                              from: location.pathname + location.search,
                            },
                          }}
                          className='text-decoration-none'
                        >
                          <Card.Title as='h5' className='product-title'>
                            {product.name}
                          </Card.Title>
                        </Link>
                        <Rating
                          value={product.rating}
                          text={`${product.numReviews} reviews`}
                        />
                        <div className='mt-2 product-price'>
                          ${product.price.toFixed(2)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductScreen;
