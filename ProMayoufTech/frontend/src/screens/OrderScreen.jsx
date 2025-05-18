import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Tab,
  Nav,
  Accordion,
  Badge,
  Form,
} from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import StripePaymentForm from '../components/StripePaymentForm';
import InvoiceGenerator from '../components/InvoiceGenerator';
import ShippingTracker from '../components/ShippingTracker';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  FaFileInvoice,
  FaTruck,
  FaReceipt,
  FaDownload,
  FaEnvelope,
  FaEdit,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaShippingFast,
  FaBoxOpen,
  FaCreditCard,
  FaCommentDots,
} from 'react-icons/fa';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
  useUpdateOrderTrackingMutation,
  useUpdateOrderNotesMutation,
  useRefundOrderMutation,
  useResendOrderConfirmationMutation,
  // We need a way to get the Stripe publishable key, let's assume it's added to ordersApiSlice or a new slice
  // For now, let's mock it or fetch it directly if an endpoint exists
} from '../slices/ordersApiSlice'; // Assuming new mutations for tracking, notes, refunds and email resending

// Placeholder for fetching Stripe publishable key - replace with actual implementation
// This might involve creating a new endpoint or a new slice query
const useGetStripePublishableKeyQuery = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/config/stripe/publishablekey');
        if (!res.ok) {
          throw new Error('Failed to fetch Stripe publishable key');
        }
        const keyData = await res.json();
        setData(keyData);
      } catch (e) {
        setError(e.message);
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKey();
  }, []);

  return { data, isLoading, error };
};

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const [updateTracking, { isLoading: loadingTracking }] =
    useUpdateOrderTrackingMutation();
  const [updateNotes, { isLoading: loadingNotes }] =
    useUpdateOrderNotesMutation();
  const [refundOrder, { isLoading: loadingRefund }] = useRefundOrderMutation();
  const [resendConfirmation, { isLoading: loadingResend }] =
    useResendOrderConfirmationMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending: loadingPayPalUI }, paypalDispatch] =
    usePayPalScriptReducer();

  const {
    data: paypalConfig,
    isLoading: loadingPayPalConfig,
    error: errorPayPalConfig,
  } = useGetPaypalClientIdQuery();

  // Stripe state
  const {
    data: stripeConfig,
    isLoading: loadingStripeConfig,
    error: errorStripeConfig,
  } = useGetStripePublishableKeyQuery();
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    if (order && userInfo && userInfo.isAdmin) {
      setAdminNotes(order.adminNotes || '');
      if (order.refundAmount) {
        setRefundAmount(order.refundAmount);
      } else {
        setRefundAmount(order.totalPrice);
      }
    }
  }, [order, userInfo]);

  useEffect(() => {
    if (stripeConfig && stripeConfig.publishableKey) {
      setStripePromise(loadStripe(stripeConfig.publishableKey));
    }
  }, [stripeConfig]);

  useEffect(() => {
    if (!errorPayPalConfig && !loadingPayPalConfig && paypalConfig?.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypalConfig.clientId,
            currency: 'USD', // Should ideally come from order.currency or a config
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      if (order && !order.isPaid && order.paymentMethod === 'PayPal') {
        if (!window.paypal) {
          loadPaypalScript();
        }
      }
    }
  }, [
    errorPayPalConfig,
    loadingPayPalConfig,
    order,
    paypalConfig,
    paypalDispatch,
  ]);

  function onApprovePayPal(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details, paymentSource: 'PayPal' }).unwrap();
        refetch();
        toast.success('Order is paid via PayPal');
      } catch (err) {
        toast.error(err?.data?.message || err.error || 'PayPal payment failed');
      }
    });
  }

  function onErrorPayPal(err) {
    toast.error(err.message || 'PayPal payment error');
  }

  function createPayPalOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice }, // Ensure currency matches what PayPal expects
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  const handleStripePaymentSuccess = async (paymentResult) => {
    try {
      await payOrder({
        orderId,
        details: paymentResult,
        paymentSource: 'Stripe',
      }).unwrap();
      refetch();
      toast.success('Order is paid via Stripe');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Stripe payment failed to record'
      );
    }
  };

  const handleStripePaymentError = (errorMsg) => {
    toast.error(errorMsg || 'Stripe payment failed');
  };

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      refetch();
      toast.success('Order marked as delivered');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleUpdateTrackingInfo = async (orderId, trackingInfo) => {
    try {
      await updateTracking({ orderId, trackingInfo }).unwrap();
      refetch();
      toast.success('Tracking information updated successfully');
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err.error ||
          'Failed to update tracking information'
      );
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await updateNotes({ orderId, adminNotes }).unwrap();
      refetch();
      toast.success('Admin notes updated successfully');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Failed to update admin notes'
      );
    }
  };

  const handleProcessRefund = async () => {
    if (!refundReason) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    try {
      await refundOrder({
        orderId,
        refundAmount,
        refundReason,
      }).unwrap();
      refetch();
      setShowRefundConfirm(false);
      toast.success(
        `Refund of $${refundAmount.toFixed(2)} processed successfully`
      );
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Failed to process refund'
      );
    }
  };

  const handleResendOrderConfirmation = async () => {
    try {
      await resendConfirmation(orderId).unwrap();
      toast.success('Order confirmation email resent successfully');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Failed to resend confirmation email'
      );
    }
  };

  const handleSendInvoiceEmail = async (orderId) => {
    // This would be implemented with a backend endpoint
    toast.info(
      `Sending invoice email for order ${orderId}. Feature coming soon.`
    );
  };

  if (isLoading || loadingPayPalConfig || loadingStripeConfig)
    return <Loader />;
  if (error)
    return (
      <Message variant='danger'>{error?.data?.message || error.error}</Message>
    );
  if (errorPayPalConfig)
    return <Message variant='danger'>Could not load PayPal config.</Message>;

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1>
          Order {order._id.substring(order._id.length - 6)}
          {order.isPaid && (
            <Badge bg='success' className='ms-2'>
              Paid
            </Badge>
          )}
          {order.isDelivered && (
            <Badge bg='success' className='ms-2'>
              Delivered
            </Badge>
          )}
          {!order.isPaid && (
            <Badge bg='danger' className='ms-2'>
              Unpaid
            </Badge>
          )}
          {order.isPaid && !order.isDelivered && (
            <Badge bg='warning' className='ms-2'>
              Pending Delivery
            </Badge>
          )}
        </h1>

        {userInfo && userInfo.isAdmin && (
          <div>
            <Button
              variant='outline-primary'
              className='me-2'
              onClick={handleResendOrderConfirmation}
              disabled={loadingResend}
            >
              <FaEnvelope className='me-1' />
              {loadingResend ? 'Sending...' : 'Resend Confirmation'}
            </Button>

            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Nav variant='pills' className='d-inline-flex'>
                <Nav.Item>
                  <Nav.Link eventKey='details' className='px-3 py-1'>
                    <FaBoxOpen className='me-1' /> Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='invoice' className='px-3 py-1'>
                    <FaFileInvoice className='me-1' /> Invoice
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='tracking' className='px-3 py-1'>
                    <FaTruck className='me-1' /> Tracking
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Tab.Container>
          </div>
        )}
      </div>

      {userInfo && userInfo.isAdmin && (
        <Tab.Content>
          <Tab.Pane eventKey='details' active={activeTab === 'details'}>
            {/* Order details content - will show by default below */}
          </Tab.Pane>

          <Tab.Pane eventKey='invoice' active={activeTab === 'invoice'}>
            <InvoiceGenerator
              order={order}
              onSendEmail={handleSendInvoiceEmail}
              invoiceType='Invoice'
            />
          </Tab.Pane>

          <Tab.Pane eventKey='tracking' active={activeTab === 'tracking'}>
            <ShippingTracker
              order={order}
              isAdmin={userInfo.isAdmin}
              onUpdateTracking={handleUpdateTrackingInfo}
            />
          </Tab.Pane>
        </Tab.Content>
      )}

      {/* Only show the main order details if we're not viewing invoice or tracking tabs */}
      {(!userInfo || !userInfo.isAdmin || activeTab === 'details') && (
        <Row>
          <Col md={8}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Shipping</h2>
                <p>
                  <strong>Name: </strong> {order.user.name}
                </p>
                <p>
                  <strong>Email: </strong>
                  <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                </p>
                <p>
                  <strong>Address:</strong>
                  {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <Message variant='success'>
                    Delivered on{' '}
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </Message>
                ) : (
                  <Message variant='danger'>Not Delivered</Message>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <h2>Payment Method</h2>
                <p>
                  <strong>Method: </strong>
                  {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <Message variant='success'>
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </Message>
                ) : (
                  <Message variant='danger'>Not Paid</Message>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <h2>Order Items</h2>
                {order.orderItems.length === 0 ? (
                  <Message>Order is empty</Message>
                ) : (
                  <ListGroup variant='flush'>
                    {order.orderItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col>
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                            {item.color && (
                              <span className='ms-2 small text-muted'>
                                Color: {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className='ms-2 small text-muted'>
                                Size: {item.size}
                              </span>
                            )}
                          </Col>
                          <Col md={4}>
                            {item.qty} x ${item.price.toFixed(2)} = $
                            {(item.qty * item.price).toFixed(2)}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </ListGroup.Item>

              {/* Admin notes section - only visible to admins */}
              {userInfo && userInfo.isAdmin && (
                <ListGroup.Item>
                  <Accordion>
                    <Accordion.Item eventKey='0'>
                      <Accordion.Header>
                        <FaCommentDots className='me-2' /> Admin Notes
                      </Accordion.Header>
                      <Accordion.Body>
                        <Form>
                          <Form.Group className='mb-3'>
                            <Form.Control
                              as='textarea'
                              rows={3}
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder='Add internal notes about this order (not visible to customer)'
                            />
                          </Form.Group>
                          <Button
                            variant='primary'
                            size='sm'
                            onClick={handleUpdateNotes}
                            disabled={loadingNotes}
                          >
                            {loadingNotes ? 'Saving...' : 'Save Notes'}
                          </Button>
                        </Form>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>
          <Col md={4}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Order Summary</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                {order.discountAmount > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Discount</Col>
                      <Col className='text-danger'>
                        -${order.discountAmount.toFixed(2)}
                      </Col>
                    </Row>
                    {order.couponCode && (
                      <Row>
                        <Col className='text-muted small'>
                          Coupon: {order.couponCode}
                        </Col>
                      </Row>
                    )}
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>${order.totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                {!order.isPaid && (
                  <ListGroup.Item>
                    {loadingPay && <Loader />}
                    {order.paymentMethod === 'PayPal' &&
                      (loadingPayPalUI ? (
                        <Loader />
                      ) : (
                        <div>
                          <PayPalButtons
                            createOrder={createPayPalOrder}
                            onApprove={onApprovePayPal}
                            onError={onErrorPayPal}
                          ></PayPalButtons>
                        </div>
                      ))}
                    {order.paymentMethod === 'Stripe' &&
                      stripePromise &&
                      stripeConfig &&
                      !errorStripeConfig && (
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            amount={order.totalPrice}
                            currency={order.currency || 'USD'} // Assuming USD, ideally from order data
                            onSuccess={handleStripePaymentSuccess}
                            onError={handleStripePaymentError}
                          />
                        </Elements>
                      )}
                    {order.paymentMethod === 'Stripe' &&
                      (loadingStripeConfig || errorStripeConfig) && (
                        <Message variant='danger'>
                          Stripe is currently unavailable. {errorStripeConfig}
                        </Message>
                      )}
                  </ListGroup.Item>
                )}

                {/* Admin actions section */}
                {userInfo && userInfo.isAdmin && (
                  <>
                    {loadingDeliver && <Loader />}

                    {order.isPaid && !order.isDelivered && (
                      <ListGroup.Item>
                        <Button
                          type='button'
                          className='btn btn-block w-100'
                          onClick={deliverHandler}
                        >
                          <FaShippingFast className='me-1' /> Mark As Delivered
                        </Button>
                      </ListGroup.Item>
                    )}

                    {order.isPaid && !order.refundProcessed && (
                      <ListGroup.Item>
                        {showRefundConfirm ? (
                          <div>
                            <h6 className='mb-3'>Process Refund</h6>
                            <Form.Group className='mb-3'>
                              <Form.Label>Refund Amount ($)</Form.Label>
                              <Form.Control
                                type='number'
                                step='0.01'
                                min='0.01'
                                max={order.totalPrice}
                                value={refundAmount}
                                onChange={(e) =>
                                  setRefundAmount(Number(e.target.value))
                                }
                              />
                            </Form.Group>
                            <Form.Group className='mb-3'>
                              <Form.Label>Reason for Refund</Form.Label>
                              <Form.Control
                                as='textarea'
                                rows={2}
                                value={refundReason}
                                onChange={(e) =>
                                  setRefundReason(e.target.value)
                                }
                                placeholder='Required: Explain reason for refund'
                              />
                            </Form.Group>
                            <div className='d-flex justify-content-between'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => setShowRefundConfirm(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant='danger'
                                size='sm'
                                onClick={handleProcessRefund}
                                disabled={loadingRefund}
                              >
                                {loadingRefund
                                  ? 'Processing...'
                                  : 'Process Refund'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type='button'
                            className='btn btn-danger btn-block w-100'
                            onClick={() => setShowRefundConfirm(true)}
                          >
                            <FaCreditCard className='me-1' /> Process Refund
                          </Button>
                        )}
                      </ListGroup.Item>
                    )}

                    {order.refundProcessed && (
                      <ListGroup.Item>
                        <div className='text-danger'>
                          <FaExclamationTriangle className='me-1' />
                          Refunded: ${order.refundAmount?.toFixed(2) || 'N/A'}
                          <p className='small text-muted mt-1 mb-0'>
                            {order.refundReason}
                          </p>
                        </div>
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item>
                      <div className='d-grid gap-2'>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() => setActiveTab('invoice')}
                        >
                          <FaFileInvoice className='me-1' /> View Invoice
                        </Button>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() => setActiveTab('tracking')}
                        >
                          <FaTruck className='me-1' /> View/Update Tracking
                        </Button>
                      </div>
                    </ListGroup.Item>
                  </>
                )}

                {/* Show receipt button to customer */}
                {userInfo && order.isPaid && !userInfo.isAdmin && (
                  <ListGroup.Item>
                    <Link
                      to={`/order/${order._id}/receipt`}
                      className='btn btn-outline-primary btn-sm w-100'
                    >
                      <FaReceipt className='me-1' /> View Receipt
                    </Link>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrderScreen;
