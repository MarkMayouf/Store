import React, { useRef } from 'react';
import { Button, Card, Row, Col, ListGroup, Table } from 'react-bootstrap';
import { FaFilePdf, FaPrint, FaDownload, FaEnvelope } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

/**
 * InvoiceGenerator component - Creates a printable/downloadable invoice from order data
 * @param {Object} order - The order object containing all order details
 * @param {Function} onSendEmail - Optional callback to send invoice via email
 * @param {String} invoiceType - Type of document (invoice, receipt, etc.)
 */
const InvoiceGenerator = ({ order, onSendEmail, invoiceType = 'Invoice' }) => {
  const invoiceRef = useRef();

  // Generate invoice number with prefix INV followed by order id
  const invoiceNumber = `INV-${order._id.substring(order._id.length - 6)}`;

  // Format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `ProMayouf_${invoiceType}_${order._id}`,
    onBeforePrint: () => toast.info('Preparing document for printing...'),
    onAfterPrint: () => toast.success('Document printed successfully!'),
  });

  // Handle email functionality
  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail(order._id);
    } else {
      toast.info('Email functionality will be implemented soon.');
    }
  };

  // Handle download functionality (uses print to PDF)
  const handleDownload = () => {
    toast.info('Preparing PDF download...');
    handlePrint();
  };

  return (
    <div className='invoice-generator'>
      <Card className='mb-4 border-0 shadow-sm'>
        <Card.Header className='bg-primary text-white d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>
            {invoiceType} #{invoiceNumber}
          </h5>
          <div>
            <Button
              variant='light'
              size='sm'
              className='me-2'
              onClick={handlePrint}
              title={`Print ${invoiceType}`}
            >
              <FaPrint className='me-1' /> Print
            </Button>
            <Button
              variant='light'
              size='sm'
              className='me-2'
              onClick={handleDownload}
              title={`Download ${invoiceType} as PDF`}
            >
              <FaDownload className='me-1' /> Download
            </Button>
            <Button
              variant='light'
              size='sm'
              onClick={handleSendEmail}
              title={`Email ${invoiceType}`}
            >
              <FaEnvelope className='me-1' /> Email
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Printable invoice content */}
          <div className='invoice-content' ref={invoiceRef}>
            <div className='p-4'>
              {/* Invoice Header */}
              <Row className='mb-4'>
                <Col md={6}>
                  <div className='d-flex align-items-center mb-3'>
                    <img
                      src={logo}
                      alt='ProMayouf'
                      style={{ height: '40px', marginRight: '10px' }}
                    />
                    <div>
                      <h4 className='mb-0'>ProMayouf</h4>
                      <p className='text-muted mb-0'>Premium Men's Fashion</p>
                    </div>
                  </div>
                  <div>
                    <p className='mb-1'>123 Fashion Street, Suite 100</p>
                    <p className='mb-1'>New York, NY 10001</p>
                    <p className='mb-1'>Phone: 1-800-PROMAYOUF</p>
                    <p className='mb-1'>Email: support@promayouf.com</p>
                  </div>
                </Col>
                <Col md={6} className='text-md-end'>
                  <h5 className='text-uppercase text-primary mb-2'>
                    {invoiceType}
                  </h5>
                  <p className='mb-1'>
                    <strong>{invoiceType} #:</strong> {invoiceNumber}
                  </p>
                  <p className='mb-1'>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p className='mb-1'>
                    <strong>Date:</strong> {formatDate(order.createdAt)}
                  </p>
                  <p className='mb-1'>
                    <strong>Payment Status:</strong>{' '}
                    <span
                      className={order.isPaid ? 'text-success' : 'text-danger'}
                    >
                      {order.isPaid
                        ? `Paid (${formatDate(order.paidAt)})`
                        : 'Unpaid'}
                    </span>
                  </p>
                  <p className='mb-1'>
                    <strong>Delivery Status:</strong>{' '}
                    <span
                      className={
                        order.isDelivered ? 'text-success' : 'text-warning'
                      }
                    >
                      {order.isDelivered
                        ? `Delivered (${formatDate(order.deliveredAt)})`
                        : 'Pending'}
                    </span>
                  </p>
                </Col>
              </Row>

              {/* Customer Information */}
              <Row className='mb-4'>
                <Col md={6}>
                  <h5 className='mb-2'>Bill To:</h5>
                  <div className='p-2 border-start border-primary border-3'>
                    <p className='mb-1'>
                      <strong>Name:</strong> {order.user.name}
                    </p>
                    <p className='mb-1'>
                      <strong>Email:</strong> {order.user.email}
                    </p>
                    <p className='mb-1'>
                      <strong>Address:</strong>
                      <br />
                      {order.shippingAddress.address}
                      <br />
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className='mb-2'>Payment Details:</h5>
                  <div className='p-2 border-start border-primary border-3'>
                    <p className='mb-1'>
                      <strong>Method:</strong> {order.paymentMethod}
                    </p>
                    {order.isPaid && (
                      <>
                        <p className='mb-1'>
                          <strong>Paid On:</strong> {formatDate(order.paidAt)}
                        </p>
                        <p className='mb-1'>
                          <strong>Transaction ID:</strong>{' '}
                          {order.paymentResult?.id || 'N/A'}
                        </p>
                      </>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Order Items */}
              <h5 className='mb-3'>Order Items:</h5>
              <Table striped bordered className='mb-4'>
                <thead className='bg-light'>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th className='text-center'>Quantity</th>
                    <th className='text-end'>Price</th>
                    <th className='text-end'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '40px', marginRight: '10px' }}
                            className='img-thumbnail'
                          />
                          <div>
                            {item.name}
                            {item.color && (
                              <span className='ms-2 text-muted small'>
                                Color: {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className='ms-2 text-muted small'>
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='text-center'>{item.qty}</td>
                      <td className='text-end'>${item.price.toFixed(2)}</td>
                      <td className='text-end'>
                        ${(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Order Summary */}
              <Row>
                <Col md={7}>
                  <div className='mb-4'>
                    <h6 className='mb-2'>Notes:</h6>
                    <div className='p-3 bg-light rounded'>
                      <p className='mb-0'>
                        Thank you for shopping with ProMayouf. We appreciate
                        your business!
                        <br />
                        {order.isCustomized && (
                          <span className='text-primary mt-2 d-block'>
                            This order includes custom alterations. Altered
                            items cannot be returned.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className='mt-3'>
                      <h6 className='mb-2'>Return Policy:</h6>
                      <p className='small text-muted mb-0'>
                        Items may be returned within 30 days of purchase with
                        receipt. Custom-tailored items are not eligible for
                        return. Please visit our website for complete return
                        policy details.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={5}>
                  <div className='bg-light p-3 rounded'>
                    <ListGroup variant='flush'>
                      <ListGroup.Item className='bg-light d-flex justify-content-between px-0'>
                        <span>Subtotal:</span>
                        <span>${order.itemsPrice.toFixed(2)}</span>
                      </ListGroup.Item>
                      {order.discountAmount > 0 && (
                        <ListGroup.Item className='bg-light d-flex justify-content-between px-0'>
                          <span>Discount:</span>
                          <span className='text-danger'>
                            -${order.discountAmount.toFixed(2)}
                          </span>
                        </ListGroup.Item>
                      )}
                      <ListGroup.Item className='bg-light d-flex justify-content-between px-0'>
                        <span>Shipping:</span>
                        <span>${order.shippingPrice.toFixed(2)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className='bg-light d-flex justify-content-between px-0'>
                        <span>Tax:</span>
                        <span>${order.taxPrice.toFixed(2)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className='bg-light d-flex justify-content-between px-0 fw-bold'>
                        <span>Total:</span>
                        <span>${order.totalPrice.toFixed(2)}</span>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Col>
              </Row>

              {/* Footer */}
              <div className='text-center mt-4 pt-4 border-top'>
                <p className='mb-0'>Thank you for your purchase!</p>
                <p className='small text-muted'>
                  If you have any questions about this{' '}
                  {invoiceType.toLowerCase()}, please contact our customer
                  support at support@promayouf.com
                </p>
                <div className='mt-2 d-flex justify-content-center align-items-center'>
                  <FaFilePdf className='text-danger me-1' />
                  <span className='small text-muted'>
                    This document was generated automatically and is valid
                    without a signature.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
