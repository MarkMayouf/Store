import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
  InputGroup,
  Accordion,
  Container,
  Alert,
  Badge,
} from 'react-bootstrap';
import {
  FaTrash,
  FaShoppingCart,
  FaArrowRight,
  FaShoppingBag,
  FaTag,
  FaRegSadTear,
  FaCircle,
  FaCheck,
  FaRuler,
  FaComments,
} from 'react-icons/fa';
import Message from '../components/Message';
import {
  addToCart,
  removeFromCart,
  applyCouponToCart,
  clearCouponFromCart,
  applyCoupon,
  removeCoupon,
  updateCartItemColor,
} from '../slices/cartSlice';
import { useApplyCouponMutation } from '../slices/couponsApiSlice';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import '../assets/styles/product.css';
import CustomizationChatbot from '../components/CustomizationChatbot';

// Available colors for suits (this would normally come from a database or API)
const availableColors = [
  { id: 'navy', name: 'Navy Blue', hex: '#1a2c42' },
  { id: 'black', name: 'Black', hex: '#1c1c1c' },
  { id: 'charcoal', name: 'Charcoal', hex: '#3b3b3b' },
  { id: 'brown', name: 'Brown', hex: '#4f3222' },
];

const CustomizationDetails = ({ customizations }) => {
  if (!customizations) return null;

  const {
    pants = {},
    measurements = {},
    additionalNotes = '',
    customizationPrice = 0,
  } = customizations;

  return (
    <Accordion className='mt-2 customization-details'>
      <Accordion.Item eventKey='0'>
        <Accordion.Header>
          View Customization Details
          {customizationPrice > 0 && (
            <span className='ms-2 customization-price'>
              (+ ${customizationPrice} for customization)
            </span>
          )}
        </Accordion.Header>
        <Accordion.Body>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h6>Pants Measurements</h6>
              <ul className='list-unstyled'>
                <li>Length: {measurements.pantsLength || 'Not specified'}</li>
                <li>Waist: {measurements.waist || 'Not specified'}</li>
                <li>Inseam: {measurements.inseam || 'Not specified'}</li>
                <li>Outseam: {measurements.outseam || 'Not specified'}</li>
                <li>Type: {pants.fit || 'Not specified'}</li>
              </ul>
            </ListGroup.Item>
            <ListGroup.Item>
              <h6>Jacket Measurements</h6>
              <ul className='list-unstyled'>
                <li>Sleeves: {measurements.sleeve || 'Not specified'}</li>
                <li>
                  Back Length: {measurements.backLength || 'Not specified'}
                </li>
                <li>Chest: {measurements.chest || 'Not specified'}</li>
                <li>Shoulders: {measurements.shoulder || 'Not specified'}</li>
              </ul>
            </ListGroup.Item>
            {additionalNotes && (
              <ListGroup.Item>
                <h6>Additional Notes</h6>
                <p className='mb-0'>{additionalNotes}</p>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const {
    cartItems,
    itemsPrice,
    discountedItemsPrice,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice,
    appliedCoupon,
  } = cart;

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [showCustomizationChatbot, setShowCustomizationChatbot] =
    useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] =
    useState(null);

  const [applyCoupon, { isLoading: isLoadingApplyCoupon }] =
    useApplyCouponMutation();

  const customizationTotal = cartItems.reduce((total, item) => {
    return total + (item.customizations?.customizationPrice || 0);
  }, 0);

  const subtotalWithCustomizations =
    parseFloat(itemsPrice) + customizationTotal;

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    if (appliedCoupon) {
      dispatch(clearCouponFromCart());
      toast.info(
        'Coupon removed due to cart change. Please re-apply if needed.'
      );
      setCouponCode('');
    }
  };

  const removeFromCartHandler = (id, size, customizations) => {
    dispatch(removeFromCart({ id, size, customizations }));
    if (appliedCoupon) {
      dispatch(clearCouponFromCart());
      toast.info(
        'Coupon removed due to cart change. Please re-apply if needed.'
      );
      setCouponCode('');
    }
  };

  const changeColorHandler = (item, colorId) => {
    const newColor = availableColors.find((c) => c.id === colorId);
    if (newColor) {
      dispatch(
        updateCartItemColor({
          id: item._id,
          size: item.selectedSize,
          customizations: item.customizations,
          color: newColor,
        })
      );
      toast.success(`Color changed to ${newColor.name}`);
    }
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode || '';
    if (!code.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }
    try {
      const res = await applyCoupon({
        couponCode: code,
        cartTotal: subtotalWithCustomizations,
      }).unwrap();
      dispatch(applyCouponToCart(res));
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to apply coupon');
      dispatch(clearCouponFromCart());
      setCouponCode('');
    }
  };

  const handleClearCoupon = () => {
    dispatch(clearCouponFromCart());
    setCouponCode('');
    toast.info('Coupon removed.');
  };

  const openCustomizationChatbot = (item) => {
    setSelectedItemForCustomization(item);
    setShowCustomizationChatbot(true);
  };

  const handleCustomizationComplete = (customizationData) => {
    if (selectedItemForCustomization) {
      // Update the cart item with new customizations
      const updatedItem = {
        ...selectedItemForCustomization,
        customizations: customizationData,
      };

      dispatch(
        addToCart({
          ...updatedItem,
          qty: updatedItem.qty,
        })
      );

      toast.success('Customization saved successfully!');
      setSelectedItemForCustomization(null);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <Container>
      <div className='cart-header py-4 mb-4 border-bottom'>
        <Row className='align-items-center'>
          <Col>
            <div className='d-flex align-items-center'>
              <FaShoppingCart
                className='me-3'
                style={{ fontSize: '2rem', color: '#003b5c' }}
              />
              <h1 className='mb-0'>Shopping Cart</h1>
            </div>
          </Col>
          <Col xs='auto'>
            <Link to='/' className='btn btn-outline-primary'>
              <FaArrowRight className='me-2' />
              Continue Shopping
            </Link>
          </Col>
        </Row>
      </div>

      {cartItems.length === 0 ? (
        <div className='empty-cart-container text-center py-5 my-4'>
          <FaRegSadTear style={{ fontSize: '4rem', color: '#003b5c' }} />
          <h2 className='mt-4'>Your cart is empty</h2>
          <p className='text-muted mb-4'>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to='/' className='btn btn-primary btn-lg px-4 shadow-sm'>
            Start Shopping
          </Link>
        </div>
      ) : (
        <Row>
          <Col md={8}>
            <div className='cart-items-container bg-white p-4 rounded shadow-sm mb-4'>
              <h2 className='cart-section-title h5 mb-4 pb-3 border-bottom'>
                Items In Your Cart (
                {cartItems.reduce((acc, item) => acc + item.qty, 0)})
              </h2>

              {cartItems.map((item) => (
                <div
                  key={`${item._id}-${item.selectedSize}-${
                    item.customizations ? 'custom' : 'standard'
                  }`}
                  className='cart-item mb-4 pb-4 border-bottom'
                >
                  <Row className='align-items-center'>
                    <Col xs={12} md={3}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fluid
                        rounded
                        className='product-image-cart'
                      />
                    </Col>
                    <Col xs={12} md={9}>
                      <div className='d-flex justify-content-between align-items-start mb-2'>
                        <div>
                          <h3 className='h5 mb-1'>
                            <Link
                              to={`/product/${item._id}`}
                              className='product-name'
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <div className='product-details mb-2'>
                            <span className='text-muted'>
                              Size: {item.selectedSize}
                            </span>
                            {item.selectedColor && (
                              <span className='ms-3 d-inline-flex align-items-center'>
                                <span className='text-muted me-2'>Color:</span>
                                <span
                                  className='color-dot'
                                  style={{
                                    backgroundColor: item.selectedColor.hex,
                                    display: 'inline-block',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    marginRight: '5px',
                                  }}
                                ></span>
                                {item.selectedColor.name}
                              </span>
                            )}
                          </div>
                          {item.customizations && (
                            <div className='customization-badge-container mb-2'>
                              <Badge
                                bg='info'
                                className='p-2 customized-badge'
                                style={{
                                  backgroundColor: '#e8f4f8',
                                  color: '#003b5c',
                                  fontWeight: 'normal',
                                }}
                              >
                                <FaRuler className='me-1' /> Custom Alterations
                                Applied
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className='item-price text-end'>
                          <div className='price fw-bold'>
                            ${item.price.toFixed(2)}
                          </div>
                          {item.customizations?.customizationPrice > 0 && (
                            <div className='customization-price text-muted small'>
                              + $
                              {item.customizations.customizationPrice.toFixed(
                                2
                              )}{' '}
                              alterations
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='d-flex flex-wrap justify-content-between align-items-center mt-3'>
                        <div className='d-flex align-items-center me-3 mb-2 mb-md-0'>
                          <Form.Label className='me-2 mb-0'>Qty:</Form.Label>
                          <Form.Control
                            as='select'
                            value={item.qty}
                            onChange={(e) =>
                              addToCartHandler(
                                { ...item, selectedSize: item.selectedSize },
                                Number(e.target.value)
                              )
                            }
                            className='form-select-sm quantity-select'
                            style={{ width: '70px' }}
                          >
                            {[...Array(item.countInStock).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </div>

                        <div className='d-flex flex-wrap'>
                          {item.category === 'Suits' && (
                            <Button
                              variant='outline-secondary'
                              size='sm'
                              className='me-2 mb-2 mb-md-0 customize-btn'
                              onClick={() => openCustomizationChatbot(item)}
                              style={{
                                borderColor: '#003b5c',
                                color: '#003b5c',
                                transition: 'all 0.2s ease',
                                borderRadius: '4px',
                                padding: '0.4rem 0.8rem',
                              }}
                            >
                              <FaRuler className='me-1' />
                              {item.customizations
                                ? 'Edit Customization'
                                : 'Customize Suit'}
                            </Button>
                          )}

                          {item.category === 'Suits' && (
                            <Form.Group
                              controlId={`color-select-${item._id}`}
                              className='me-2 mb-2 mb-md-0'
                            >
                              <Form.Select
                                size='sm'
                                value={item.selectedColor?.id || ''}
                                onChange={(e) =>
                                  changeColorHandler(item, e.target.value)
                                }
                                style={{ minWidth: '120px' }}
                              >
                                <option value='' disabled>
                                  Select Color
                                </option>
                                {availableColors.map((color) => (
                                  <option key={color.id} value={color.id}>
                                    {color.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          )}

                          <Button
                            type='button'
                            variant='outline-danger'
                            size='sm'
                            onClick={() =>
                              removeFromCartHandler(
                                item._id,
                                item.selectedSize,
                                item.customizations
                              )
                            }
                            className='remove-btn'
                            style={{
                              transition: 'all 0.2s ease',
                              borderRadius: '4px',
                              padding: '0.4rem 0.8rem',
                            }}
                          >
                            <FaTrash className='me-1' /> Remove
                          </Button>
                        </div>
                      </div>

                      {item.customizations && (
                        <CustomizationDetails
                          customizations={item.customizations}
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Col>
          <Col md={4}>
            <div className='cart-summary bg-white p-4 rounded shadow-sm mb-4'>
              <h2 className='cart-section-title h5 mb-4 pb-2 border-bottom'>
                Order Summary
              </h2>

              <div className='price-breakdown mb-4'>
                <div className='d-flex justify-content-between mb-2'>
                  <span>Subtotal</span>
                  <span>${itemsPrice}</span>
                </div>
                {customizationTotal > 0 && (
                  <div className='d-flex justify-content-between mb-2'>
                    <span>Alterations</span>
                    <span>${customizationTotal.toFixed(2)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className='d-flex justify-content-between mb-2 text-success'>
                    <span>
                      <FaTag className='me-1' />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-${discountAmount}</span>
                  </div>
                )}
                <div className='d-flex justify-content-between mb-2'>
                  <span>Shipping</span>
                  <span>${shippingPrice}</span>
                </div>
                <div className='d-flex justify-content-between mb-2'>
                  <span>Tax</span>
                  <span>${taxPrice}</span>
                </div>
                <div className='d-flex justify-content-between fw-bold mt-3 pt-3 border-top'>
                  <span>Total</span>
                  <span className='order-total'>${totalPrice}</span>
                </div>
              </div>

              <div className='coupon-section mb-4'>
                <Accordion defaultActiveKey='0'>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Apply Coupon</Accordion.Header>
                    <Accordion.Body>
                      {appliedCoupon ? (
                        <div className='applied-coupon p-3 bg-light rounded'>
                          <div className='d-flex justify-content-between align-items-center'>
                            <div>
                              <div className='fw-bold'>
                                {appliedCoupon.code}
                              </div>
                              <div className='small text-muted'>
                                {appliedCoupon.discountType === 'percentage'
                                  ? `${appliedCoupon.discountValue}% off`
                                  : `$${appliedCoupon.discountValue} off`}
                              </div>
                            </div>
                            <Button
                              variant='outline-secondary'
                              size='sm'
                              onClick={handleClearCoupon}
                              style={{
                                transition: 'all 0.2s ease',
                                borderRadius: '4px',
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Form onSubmit={handleApplyCoupon}>
                          <InputGroup>
                            <Form.Control
                              type='text'
                              placeholder='Enter coupon code'
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <Button
                              variant='outline-secondary'
                              type='submit'
                              disabled={isLoadingApplyCoupon}
                              style={{
                                borderColor: '#003b5c',
                                color: '#003b5c',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              Apply
                            </Button>
                          </InputGroup>
                        </Form>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>

              <div
                className='alteration-policy p-3 mb-4 rounded'
                style={{ backgroundColor: '#e8f4f8' }}
              >
                <div className='fw-bold mb-2'>Alteration Policy</div>
                <p className='mb-0 small'>
                  <strong>Note:</strong> Altered orders are not subject to
                  return but include free alteration in our stores.
                </p>
              </div>

              <Button
                type='button'
                className='btn btn-primary btn-block w-100 py-3 checkout-btn'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
                style={{
                  backgroundColor: '#003b5c',
                  borderColor: '#003b5c',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 59, 92, 0.1)',
                }}
              >
                <FaShoppingBag className='me-2' /> Proceed To Checkout
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Suit Customization Chatbot */}
      {cartItems.length > 0 && (
        <>
          <CustomizationChatbot
            open={showCustomizationChatbot}
            setOpen={setShowCustomizationChatbot}
            onCustomizationComplete={handleCustomizationComplete}
            initialCustomizations={selectedItemForCustomization?.customizations}
          />

          {!showCustomizationChatbot &&
            cartItems.some((item) => item.category === 'Suits') && (
              <div
                className='chatbot-toggle'
                onClick={() => setShowCustomizationChatbot(true)}
              >
                <FaComments size={24} />
                <span>Customize Your Suit</span>
              </div>
            )}
        </>
      )}
    </Container>
  );
};

export default CartScreen;
