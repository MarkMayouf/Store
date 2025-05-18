import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  ListGroup,
  Badge,
  Form,
  InputGroup,
} from 'react-bootstrap';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaWarehouse,
  FaShippingFast,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaEdit,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * ShippingTracker component - Displays tracking information for an order's shipment
 * @param {Object} order - The order object containing shipment information
 * @param {Boolean} isAdmin - Whether the current user is an admin
 * @param {Function} onUpdateTracking - Callback for updating tracking information
 */
const ShippingTracker = ({ order, isAdmin = false, onUpdateTracking }) => {
  const [editMode, setEditMode] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ''
  );
  const [carrier, setCarrier] = useState(order.shippingCarrier || 'FedEx');
  const [shippingStatus, setShippingStatus] = useState(
    order.shippingStatus || 'processing'
  );

  // Use these shipping statuses to track the delivery progress
  const shippingStatuses = [
    {
      id: 'processing',
      label: 'Processing',
      icon: <FaBoxOpen />,
      description: 'Order has been received and is being processed',
    },
    {
      id: 'packed',
      label: 'Packed',
      icon: <FaWarehouse />,
      description: 'Order has been packed and is ready for pickup',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      icon: <FaShippingFast />,
      description: 'Order has been shipped and is on its way',
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: <FaTruck />,
      description: 'Order is out for delivery today',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: <FaCheckCircle />,
      description: 'Order has been delivered successfully',
    },
  ];

  // Get current status index
  const currentStatusIndex = shippingStatuses.findIndex(
    (status) => status.id === shippingStatus
  );

  // Mock tracking updates - in a real app, this would come from the shipping API
  const trackingUpdates = order.trackingUpdates || [
    {
      status: 'processing',
      location: 'New York Warehouse',
      timestamp: new Date(order.createdAt).getTime() + 86400000, // 1 day after order
      message: 'Order has been processed and is ready for packing',
    },
  ];

  const handleUpdateTracking = () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a valid tracking number');
      return;
    }

    const updatedTracking = {
      trackingNumber,
      shippingCarrier: carrier,
      shippingStatus,
    };

    // Call the parent component's update function
    if (onUpdateTracking) {
      onUpdateTracking(order._id, updatedTracking);
    }

    setEditMode(false);
    toast.success('Tracking information updated successfully');
  };

  const getCarrierUrl = () => {
    // Return tracking URL based on carrier
    switch (carrier) {
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'FedEx':
        return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <Card className='mb-4 shipping-tracker border-0 shadow-sm'>
      <Card.Header
        className={`d-flex justify-content-between align-items-center ${
          order.isDelivered ? 'bg-success' : 'bg-primary'
        } text-white`}
      >
        <h5 className='mb-0'>
          <FaTruck className='me-2' />
          Shipping Information
          {order.isDelivered && (
            <Badge bg='light' text='dark' className='ms-2'>
              Delivered
            </Badge>
          )}
        </h5>
        {isAdmin && !editMode && (
          <Button variant='light' size='sm' onClick={() => setEditMode(true)}>
            <FaEdit className='me-1' /> Update
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {editMode ? (
          <Row className='mb-4'>
            <Col md={12}>
              <Form>
                <Form.Group className='mb-3'>
                  <Form.Label>Shipping Carrier</Form.Label>
                  <Form.Select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                  >
                    <option value='FedEx'>FedEx</option>
                    <option value='UPS'>UPS</option>
                    <option value='USPS'>USPS</option>
                    <option value='DHL'>DHL</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Tracking Number</Form.Label>
                  <Form.Control
                    type='text'
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder='Enter tracking number'
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Shipping Status</Form.Label>
                  <Form.Select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value)}
                  >
                    {shippingStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className='d-flex justify-content-end'>
                  <Button
                    variant='secondary'
                    className='me-2'
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant='primary' onClick={handleUpdateTracking}>
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        ) : (
          <>
            {/* Shipping Details */}
            <Row className='mb-4'>
              <Col md={6}>
                <h6 className='mb-3'>Delivery Address</h6>
                <address className='mb-0'>
                  <strong>{order.user.name}</strong>
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </Col>

              <Col md={6}>
                <h6 className='mb-3'>Tracking Information</h6>
                {trackingNumber ? (
                  <>
                    <p className='mb-1'>
                      <strong>Carrier:</strong> {carrier}
                    </p>
                    <p className='mb-3'>
                      <strong>Tracking Number:</strong> {trackingNumber}
                    </p>
                    <a
                      href={getCarrierUrl()}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-sm btn-outline-primary'
                    >
                      <FaArrowRight className='me-1' /> Track on {carrier}
                    </a>
                  </>
                ) : (
                  <div className='text-muted'>
                    <FaExclamationTriangle className='me-2' />
                    No tracking information available yet
                  </div>
                )}
              </Col>
            </Row>

            {/* Shipping Status Timeline */}
            <h6 className='mb-3'>Delivery Status</h6>
            <div className='shipping-timeline mb-4'>
              {shippingStatuses.map((status, index) => {
                // Determine if this status is active, completed or pending
                const isActive = index === currentStatusIndex;
                const isCompleted = index < currentStatusIndex;
                const isPending = index > currentStatusIndex;

                return (
                  <div
                    key={status.id}
                    className={`shipping-status-item d-flex ${
                      isActive ? 'active' : ''
                    } ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className='status-icon'>
                      <div
                        className={`icon-wrapper ${isActive ? 'active' : ''} ${
                          isCompleted ? 'completed' : ''
                        }`}
                      >
                        {status.icon}
                      </div>
                      {index < shippingStatuses.length - 1 && (
                        <div
                          className={`status-line ${
                            isCompleted ? 'completed' : ''
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className='status-content ms-3'>
                      <h6
                        className={`mb-1 ${
                          isActive ? 'text-primary fw-bold' : ''
                        } ${isCompleted ? 'text-success' : ''}`}
                      >
                        {status.label}
                        {isActive && (
                          <Badge bg='primary' className='ms-2'>
                            Current
                          </Badge>
                        )}
                      </h6>
                      <p className={`mb-1 ${isPending ? 'text-muted' : ''}`}>
                        {status.description}
                      </p>
                      {isCompleted &&
                        trackingUpdates.find(
                          (update) => update.status === status.id
                        ) && (
                          <p className='small text-muted mb-0'>
                            {formatDate(
                              trackingUpdates.find(
                                (update) => update.status === status.id
                              ).timestamp
                            )}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tracking History */}
            {trackingUpdates && trackingUpdates.length > 0 && (
              <>
                <h6 className='mb-3'>Tracking History</h6>
                <ListGroup variant='flush' className='mb-3'>
                  {trackingUpdates
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((update, index) => (
                      <ListGroup.Item
                        key={index}
                        className='px-0 py-2 border-start border-3 border-primary ps-3'
                      >
                        <div className='d-flex justify-content-between'>
                          <div>
                            <p className='mb-1 fw-bold'>
                              {shippingStatuses.find(
                                (status) => status.id === update.status
                              )?.label || update.status}
                            </p>
                            <p className='mb-1'>{update.message}</p>
                            <p className='mb-0 small text-muted'>
                              <FaMapMarkerAlt className='me-1' />{' '}
                              {update.location}
                            </p>
                          </div>
                          <div className='text-end'>
                            <span className='text-muted small'>
                              {formatDate(update.timestamp)}
                            </span>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </>
            )}

            {isAdmin && (
              <div className='text-center mt-4'>
                <p className='text-muted small'>
                  Admin functions: You can update tracking information by
                  clicking the update button above.
                </p>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

// Add some CSS styles for the timeline
const styles = `
.shipping-timeline {
  position: relative;
  padding: 1rem 0;
}

.shipping-status-item {
  margin-bottom: 1.5rem;
  position: relative;
}

.status-icon {
  position: relative;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #dee2e6;
  z-index: 2;
  position: relative;
}

.icon-wrapper.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.icon-wrapper.completed {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.status-line {
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: -30px;
  width: 2px;
  background-color: #dee2e6;
  z-index: 1;
}

.status-line.completed {
  background-color: #28a745;
}

.shipping-status-item:last-child .status-line {
  display: none;
}
`;

// Create a style element and inject the CSS
const styleElement = document.createElement('style');
styleElement.type = 'text/css';

if (styleElement.styleSheet) {
  styleElement.styleSheet.cssText = styles;
} else {
  styleElement.appendChild(document.createTextNode(styles));
}

// Append the style to the head when the component mounts
document.head.appendChild(styleElement);

export default ShippingTracker;
