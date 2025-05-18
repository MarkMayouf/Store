import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Table,
  Button,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Badge,
  Dropdown,
  Alert,
} from 'react-bootstrap';
import {
  FaTimes,
  FaEdit,
  FaFileInvoice,
  FaTruck,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArchive,
  FaCaretDown,
  FaFileExport,
  FaShippingFast,
  FaRegClock,
  FaCheckDouble,
  FaBoxOpen,
  FaRegCalendarAlt,
} from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import AdminSidebar from '../../components/AdminSidebar';
import { CSVLink } from 'react-csv';
import {
  useGetOrdersQuery,
  useBulkUpdateOrdersMutation,
} from '../../slices/ordersApiSlice';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const OrderListScreen = () => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ordersPerPage] = useState(10);

  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();

  const [bulkUpdateOrders, { isLoading: isUpdating }] =
    useBulkUpdateOrdersMutation();

  // Filter and sort orders when data changes
  useEffect(() => {
    if (orders) {
      let result = [...orders];

      // Apply status filter
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'paid':
            result = result.filter(
              (order) => order.isPaid && !order.isDelivered
            );
            break;
          case 'unpaid':
            result = result.filter((order) => !order.isPaid);
            break;
          case 'delivered':
            result = result.filter((order) => order.isDelivered);
            break;
          case 'processing':
            result = result.filter(
              (order) => order.isPaid && !order.isDelivered
            );
            break;
          default:
            break;
        }
      }

      // Apply date range filter
      if (dateRange.startDate && dateRange.endDate) {
        result = result.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate >= dateRange.startDate && orderDate <= dateRange.endDate
          );
        });
      }

      // Apply search filter
      if (searchTerm.trim()) {
        result = result.filter(
          (order) =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user &&
              order.user.name &&
              order.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (order.user &&
              order.user.email &&
              order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply sorting
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties like user.name
        if (sortConfig.key === 'user.name') {
          aValue = a.user ? a.user.name : '';
          bValue = b.user ? b.user.name : '';
        }

        // Convert dates to timestamps for comparison
        if (
          sortConfig.key === 'createdAt' ||
          sortConfig.key === 'paidAt' ||
          sortConfig.key === 'deliveredAt'
        ) {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      // Calculate total pages
      setTotalPages(Math.ceil(result.length / ordersPerPage));

      // Apply pagination
      const startIndex = (currentPage - 1) * ordersPerPage;
      const paginatedOrders = result.slice(
        startIndex,
        startIndex + ordersPerPage
      );

      setFilteredOrders(paginatedOrders);
    }
  }, [
    orders,
    searchTerm,
    statusFilter,
    dateRange,
    sortConfig,
    currentPage,
    ordersPerPage,
  ]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order._id));
    }
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select at least one order');
      return;
    }

    try {
      await bulkUpdateOrders({
        orderIds: selectedOrders,
        action,
      }).unwrap();

      setSelectedOrders([]);
      refetch();

      toast.success(`${selectedOrders.length} orders updated successfully`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to update orders');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setSortConfig({
      key: 'createdAt',
      direction: 'desc',
    });
    setCurrentPage(1);
  };

  // Prepare data for CSV export
  const exportData = orders
    ? orders.map((order) => ({
        'Order ID': order._id,
        Customer: order.user ? order.user.name : 'N/A',
        Email: order.user ? order.user.email : 'N/A',
        Date: new Date(order.createdAt).toLocaleDateString(),
        Total: `$${order.totalPrice.toFixed(2)}`,
        'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
        'Paid Date': order.isPaid
          ? new Date(order.paidAt).toLocaleDateString()
          : 'N/A',
        'Delivery Status': order.isDelivered ? 'Delivered' : 'Not Delivered',
        'Delivered Date': order.isDelivered
          ? new Date(order.deliveredAt).toLocaleDateString()
          : 'N/A',
        'Shipping Address': `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
      }))
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (order) => {
    if (order.isDelivered) {
      return (
        <Badge bg='success'>
          <FaCheckDouble className='me-1' /> Delivered
        </Badge>
      );
    } else if (order.isPaid) {
      return (
        <Badge bg='warning'>
          <FaRegClock className='me-1' /> Processing
        </Badge>
      );
    } else {
      return (
        <Badge bg='danger'>
          <FaTimes className='me-1' /> Unpaid
        </Badge>
      );
    }
  };

  return (
    <Row>
      <Col md={3} lg={2}>
        <AdminSidebar activeKey='orders' />
      </Col>
      <Col md={9} lg={10}>
        <Card className='mb-4 border-0 shadow-sm'>
          <Card.Header className='bg-primary text-white d-flex justify-content-between align-items-center'>
            <h5 className='mb-0'>Orders Management</h5>
            <div>
              <Button
                variant='light'
                size='sm'
                className='me-2'
                onClick={refetch}
                disabled={isLoading}
              >
                <FaSyncAlt className={isLoading ? 'fa-spin me-1' : 'me-1'} />{' '}
                Refresh
              </Button>
              <CSVLink
                data={exportData}
                filename={'orders-export.csv'}
                className='btn btn-light btn-sm'
              >
                <FaFileExport className='me-1' /> Export
              </CSVLink>
            </div>
          </Card.Header>
          <Card.Body>
            {/* Filters */}
            <Row className='mb-3 gx-3'>
              <Col md={6} lg={3} className='mb-3 mb-lg-0'>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder='Search orders...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} lg={3} className='mb-3 mb-lg-0'>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value='all'>All Orders</option>
                    <option value='unpaid'>Unpaid</option>
                    <option value='paid'>Paid</option>
                    <option value='processing'>Processing</option>
                    <option value='delivered'>Delivered</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={6} lg={4} className='mb-3 mb-lg-0'>
                <InputGroup>
                  <InputGroup.Text>
                    <FaRegCalendarAlt />
                  </InputGroup.Text>
                  <DatePicker
                    selectsRange
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={(update) => {
                      setDateRange({
                        startDate: update[0],
                        endDate: update[1],
                      });
                    }}
                    className='form-control'
                    placeholderText='Filter by date range'
                  />
                </InputGroup>
              </Col>
              <Col md={6} lg={2} className='mb-3 mb-lg-0'>
                <Button
                  variant='outline-secondary'
                  className='w-100'
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>

            {/* Bulk actions for selected orders */}
            {selectedOrders.length > 0 && (
              <Alert
                variant='info'
                className='d-flex justify-content-between align-items-center'
              >
                <span>
                  <strong>{selectedOrders.length}</strong> orders selected
                </span>
                <div>
                  <Button
                    variant='outline-primary'
                    size='sm'
                    className='me-2'
                    onClick={() => handleBulkAction('markDelivered')}
                    disabled={isUpdating}
                  >
                    <FaShippingFast className='me-1' /> Mark as Delivered
                  </Button>
                  <Button
                    variant='outline-danger'
                    size='sm'
                    onClick={() => handleBulkAction('archive')}
                    disabled={isUpdating}
                  >
                    <FaArchive className='me-1' /> Archive
                  </Button>
                </div>
              </Alert>
            )}

            {isLoading ? (
              <Loader />
            ) : error ? (
              <Message variant='danger'>
                {error?.data?.message || error.error}
              </Message>
            ) : (
              <>
                <Table
                  striped
                  hover
                  responsive
                  className='table-sm admin-table'
                >
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type='checkbox'
                          onChange={handleSelectAll}
                          checked={
                            selectedOrders.length === filteredOrders.length &&
                            filteredOrders.length > 0
                          }
                        />
                      </th>
                      <th
                        onClick={() => handleSort('_id')}
                        style={{ cursor: 'pointer' }}
                      >
                        ID{' '}
                        {sortConfig.key === '_id' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('user.name')}
                        style={{ cursor: 'pointer' }}
                      >
                        CUSTOMER{' '}
                        {sortConfig.key === 'user.name' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('createdAt')}
                        style={{ cursor: 'pointer' }}
                      >
                        DATE{' '}
                        {sortConfig.key === 'createdAt' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('totalPrice')}
                        style={{ cursor: 'pointer' }}
                      >
                        TOTAL{' '}
                        {sortConfig.key === 'totalPrice' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('isPaid')}
                        style={{ cursor: 'pointer' }}
                      >
                        PAID{' '}
                        {sortConfig.key === 'isPaid' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('isDelivered')}
                        style={{ cursor: 'pointer' }}
                      >
                        STATUS{' '}
                        {sortConfig.key === 'isDelivered' &&
                          (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Form.Check
                            type='checkbox'
                            onChange={() => handleSelectOrder(order._id)}
                            checked={selectedOrders.includes(order._id)}
                          />
                        </td>
                        <td>{order._id.substring(order._id.length - 8)}</td>
                        <td>{order.user ? order.user.name : 'N/A'}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>${order.totalPrice.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? (
                            <span className='text-success'>
                              <FaCheckCircle className='me-1' />{' '}
                              {formatDate(order.paidAt)}
                            </span>
                          ) : (
                            <span className='text-danger'>
                              <FaTimes /> Not Paid
                            </span>
                          )}
                        </td>
                        <td>{getStatusBadge(order)}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle
                              variant='light'
                              size='sm'
                              className='border'
                            >
                              Actions <FaCaretDown />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <LinkContainer to={`/order/${order._id}`}>
                                <Dropdown.Item>
                                  <FaEdit className='me-2' /> View Details
                                </Dropdown.Item>
                              </LinkContainer>
                              <LinkContainer
                                to={`/order/${order._id}?tab=invoice`}
                              >
                                <Dropdown.Item>
                                  <FaFileInvoice className='me-2' /> Invoice
                                </Dropdown.Item>
                              </LinkContainer>
                              <LinkContainer
                                to={`/order/${order._id}?tab=tracking`}
                              >
                                <Dropdown.Item>
                                  <FaTruck className='me-2' /> Shipping
                                </Dropdown.Item>
                              </LinkContainer>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan='8' className='text-center py-3'>
                          <FaExclamationTriangle className='me-2 text-warning' />
                          No orders match your filter criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='d-flex justify-content-center mt-4'>
                    <ul className='pagination'>
                      <li
                        className={`page-item ${
                          currentPage === 1 ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className='page-link'
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages).keys()].map((page) => (
                        <li
                          key={page + 1}
                          className={`page-item ${
                            currentPage === page + 1 ? 'active' : ''
                          }`}
                        >
                          <button
                            className='page-link'
                            onClick={() => setCurrentPage(page + 1)}
                          >
                            {page + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className='page-link'
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default OrderListScreen;
