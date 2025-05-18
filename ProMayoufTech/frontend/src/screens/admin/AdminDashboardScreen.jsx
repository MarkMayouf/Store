import React, { useEffect, useState, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  ListGroup,
  Table,
  Button,
  Dropdown,
  Alert,
  Badge,
  Container,
  Nav,
  Tab,
  Form,
  ProgressBar,
  Modal
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaExclamationTriangle,
  FaPrint,
  FaDownload,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaRegCalendarAlt,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaBoxOpen,
  FaUserPlus,
  FaShoppingBag,
  FaChartArea,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaPercentage,
  FaUserCheck
} from 'react-icons/fa';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetUsersQuery } from '../../slices/usersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useReactToPrint } from 'react-to-print';
import {
  format,
  subDays,
  isWithinInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  getMonth,
  getYear,
  addMonths,
  startOfDay,
  endOfDay,
} from 'date-fns';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardScreen = () => {
  const componentRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const salesChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const [dataPeriod, setDataPeriod] = useState('monthly');
  const [comparisonMetrics, setComparisonMetrics] = useState({
    sales: { current: 0, previous: 0, percentChange: 0 },
    orders: { current: 0, previous: 0, percentChange: 0 },
    customers: { current: 0, previous: 0, percentChange: 0 },
    avgOrderValue: { current: 0, previous: 0, percentChange: 0 },
  });

  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useGetOrdersQuery();

  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
  } = useGetProductsQuery({ pageNumber: 1, limit: 1000 });

  const {
    data: users,
    isLoading: loadingUsers,
    error: errorUsers,
  } = useGetUsersQuery();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    salesData: [],
    topProducts: [],
    lowStockProducts: [],
    categoryDistribution: {},
    revenueByCategory: {},
    orderStatusDistribution: {},
    averageOrderValue: 0,
    customerRetentionRate: 0,
    criticalStockProducts: [],
    pendingOrders: [],
    todayRevenue: 0,
    salesTrend: [],
    customerGrowth: [],
    productPerformance: [],
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [analyticsView, setAnalyticsView] = useState('basic'); // 'basic' or 'advanced'

  // Enhanced stats state
  const [enhancedStats, setEnhancedStats] = useState({
    customerLifetimeValue: 0,
    averageOrderFrequency: 0,
    cartAbandonmentRate: 0,
    customerSatisfactionScore: 0,
    topSellingCategories: [],
    geographicalDistribution: {},
    peakOrderTimes: [],
    promotionEffectiveness: [],
    customerSegments: [],
    inventoryTurnoverRate: 0
  });

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      toast.info('Preparing document for printing...');
    },
    onAfterPrint: () => {
      toast.success('Document printed successfully!');
    },
  });

  const exportToExcel = async (data, fileName) => {
    try {
      setIsExporting(true);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportSalesData = () => {
    const data = stats.salesData.map(([month, amount]) => ({
      Month: month,
      Sales: amount,
    }));
    exportToExcel(data, 'sales_report');
  };

  const exportTopProducts = () => {
    const data = stats.topProducts.map((product) => ({
      Name: product.name,
      Quantity: product.quantity,
      Revenue: product.revenue,
    }));
    exportToExcel(data, 'top_products_report');
  };

  useEffect(() => {
    if (orders && products && users) {
      calculateStats();
      calculateEnhancedMetrics(orders, users, products);
      
      // Calculate comparison metrics
      const currentDate = new Date();
      const previousPeriodEnd = subDays(currentDate, 30);
      const previousPeriodStart = subDays(previousPeriodEnd, 30);

      const currentPeriodOrders = orders.filter(order => 
        isWithinInterval(parseISO(order.createdAt), { 
          start: previousPeriodEnd, 
          end: currentDate 
        })
      );

      const previousPeriodOrders = orders.filter(order => 
        isWithinInterval(parseISO(order.createdAt), { 
          start: previousPeriodStart, 
          end: previousPeriodEnd 
        })
      );

      const currentSales = currentPeriodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const previousSales = previousPeriodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const salesPercentChange = previousSales === 0 ? 100 : ((currentSales - previousSales) / previousSales) * 100;

      const currentOrderCount = currentPeriodOrders.length;
      const previousOrderCount = previousPeriodOrders.length;
      const ordersPercentChange = previousOrderCount === 0 ? 100 : ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100;

      const currentCustomers = new Set(currentPeriodOrders.map(order => order.user)).size;
      const previousCustomers = new Set(previousPeriodOrders.map(order => order.user)).size;
      const customersPercentChange = previousCustomers === 0 ? 100 : ((currentCustomers - previousCustomers) / previousCustomers) * 100;

      const currentAvgOrder = currentPeriodOrders.length > 0 ? currentSales / currentPeriodOrders.length : 0;
      const previousAvgOrder = previousPeriodOrders.length > 0 ? previousSales / previousPeriodOrders.length : 0;
      const avgOrderPercentChange = previousAvgOrder === 0 ? 100 : ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100;

      setComparisonMetrics({
        sales: {
          current: currentSales,
          previous: previousSales,
          percentChange: salesPercentChange
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          percentChange: ordersPercentChange
        },
        customers: {
          current: currentCustomers,
          previous: previousCustomers,
          percentChange: customersPercentChange
        },
        avgOrderValue: {
          current: currentAvgOrder,
          previous: previousAvgOrder,
          percentChange: avgOrderPercentChange
        }
      });
    }
  }, [orders, products, users, dateRange]);

  const calculateStats = () => {
    const filteredOrders = orders.filter(order => 
      isWithinInterval(new Date(order.createdAt), {
        start: dateRange.startDate,
        end: dateRange.endDate,
      })
    );

    // Calculate total sales
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Calculate today's revenue
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const todayOrders = orders.filter(order =>
      isWithinInterval(new Date(order.createdAt), {
        start: todayStart,
        end: todayEnd,
      })
    );
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Calculate sales trend
    const salesTrend = calculateSalesTrend(filteredOrders);

    // Calculate customer growth
    const customerGrowth = calculateCustomerGrowth(users);

    // Calculate product performance
    const productPerformance = calculateProductPerformance(filteredOrders);

    setStats({
      ...stats,
      totalSales,
      totalOrders: filteredOrders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      todayRevenue,
      salesTrend,
      customerGrowth,
      productPerformance,
    });
  };

  const calculateSalesTrend = (orders) => {
    // Group orders by date and calculate daily sales
    const dailySales = {};
    orders.forEach(order => {
      const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
      dailySales[date] = (dailySales[date] || 0) + order.totalPrice;
    });

    return Object.entries(dailySales).map(([date, amount]) => ({
      date,
      amount,
    }));
  };

  const calculateCustomerGrowth = (users) => {
    // Group users by registration date
    const usersByDate = {};
    users.forEach(user => {
      const date = format(new Date(user.createdAt), 'yyyy-MM-dd');
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    return Object.entries(usersByDate).map(([date, count]) => ({
      date,
      count,
    }));
  };

  const calculateProductPerformance = (orders) => {
    // Calculate product sales and revenue
    const productStats = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productStats[item.name]) {
          productStats[item.name] = {
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[item.name].quantity += item.qty;
        productStats[item.name].revenue += item.price * item.qty;
      });
    });

    return Object.entries(productStats).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  };

  const calculateEnhancedMetrics = (orders = [], users = [], products = []) => {
    // Calculate Customer Lifetime Value (CLV)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const customerLifetimeValue = users.length > 0 ? totalRevenue / users.length : 0;

    // Calculate Average Order Frequency
    const ordersByUser = orders.reduce((acc, order) => {
      acc[order.user] = (acc[order.user] || 0) + 1;
      return acc;
    }, {});
    const averageOrderFrequency = users.length > 0 ? 
      Object.values(ordersByUser).reduce((sum, count) => sum + count, 0) / users.length : 0;

    // Mock data for metrics that need real implementation
    const cartAbandonmentRate = 25; // Example: 25%
    const customerSatisfactionScore = 4.2; // Example: 4.2/5

    // Calculate Top Selling Categories
    const categorySales = orders.reduce((acc, order) => {
      order.orderItems.forEach(item => {
        const product = products.find(p => p._id === item.product);
        if (product && product.category) {
          acc[product.category] = (acc[product.category] || 0) + item.qty;
        }
      });
      return acc;
    }, {});

    const topSellingCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Mock geographical distribution data
    const geographicalDistribution = {
      'North America': 45,
      'Europe': 30,
      'Asia': 15,
      'Others': 10
    };

    // Mock peak order times data
    const peakOrderTimes = {
      '9': 15,
      '12': 25,
      '15': 20,
      '18': 30,
      '21': 10
    };

    // Mock promotion effectiveness data
    const promotionEffectiveness = [
      { name: 'Summer Sale', conversionRate: 28, revenue: 12500 },
      { name: 'Holiday Special', conversionRate: 35, revenue: 18900 },
      { name: 'Flash Sale', conversionRate: 42, revenue: 8700 }
    ];

    // Calculate Customer Segments
    const customerSegments = [
      { name: 'New', percentage: 30 },
      { name: 'Regular', percentage: 45 },
      { name: 'VIP', percentage: 25 }
    ];

    // Calculate Inventory Turnover Rate safely
    const inventoryTurnoverRate = products.length > 0 ? 
      products.reduce((acc, product) => {
        const productSales = orders.reduce((sum, order) => {
          const orderItem = order.orderItems.find(item => item.product === product._id);
          return sum + (orderItem ? orderItem.qty : 0);
        }, 0);
        return acc + (productSales / (product.countInStock || 1));
      }, 0) / products.length : 0;

    setEnhancedStats({
      customerLifetimeValue,
      averageOrderFrequency,
      cartAbandonmentRate,
      customerSatisfactionScore,
      topSellingCategories,
      geographicalDistribution,
      peakOrderTimes,
      promotionEffectiveness,
      customerSegments,
      inventoryTurnoverRate
    });
  };

  const renderAdvancedAnalytics = () => (
    <Row className="mt-4">
      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaChartPie className="me-2" /> Customer Segments</h5>
          </Card.Header>
          <Card.Body>
            <Doughnut
              data={{
                labels: enhancedStats.customerSegments.map(segment => segment.name),
                datasets: [{
                  data: enhancedStats.customerSegments.map(segment => segment.percentage),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaClock className="me-2" /> Peak Order Times</h5>
          </Card.Header>
          <Card.Body>
            <Bar
              data={{
                labels: Object.keys(enhancedStats.peakOrderTimes).map(hour => `${hour}:00`),
                datasets: [{
                  label: 'Orders',
                  data: Object.values(enhancedStats.peakOrderTimes),
                  backgroundColor: '#4CAF50'
                }]
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaMapMarkerAlt className="me-2" /> Geographical Distribution</h5>
          </Card.Header>
          <Card.Body>
            <Pie
              data={{
                labels: Object.keys(enhancedStats.geographicalDistribution),
                datasets: [{
                  data: Object.values(enhancedStats.geographicalDistribution),
                  backgroundColor: ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0']
                }]
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaPercentage className="me-2" /> Promotion Performance</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Conversion</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {enhancedStats.promotionEffectiveness.map((promo, index) => (
                  <tr key={index}>
                    <td>{promo.name}</td>
                    <td>{promo.conversionRate}%</td>
                    <td>${promo.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaUserCheck className="me-2" /> Customer Metrics</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Lifetime Value</span>
                  <strong>${enhancedStats.customerLifetimeValue.toFixed(2)}</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Order Frequency</span>
                  <strong>{enhancedStats.averageOrderFrequency.toFixed(1)} orders/customer</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Cart Abandonment</span>
                  <strong>{enhancedStats.cartAbandonmentRate}%</strong>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Satisfaction Score</span>
                  <strong>{enhancedStats.customerSatisfactionScore}/5</strong>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={4}>
        <Card className="mb-4 analytics-card">
          <Card.Header>
            <h5><FaBoxOpen className="me-2" /> Top Categories</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              {enhancedStats.topSellingCategories.map(([category, sales], index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{category}</span>
                    <Badge bg={index < 3 ? 'success' : 'secondary'}>{sales} units</Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderOverviewTab = () => (
    <div className="dashboard-overview">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Dashboard Overview</h2>
            <div>
              <Button variant="outline-secondary" className="me-2" onClick={handlePrint}>
                <FaPrint /> Print Report
              </Button>
              <Button variant="outline-primary" onClick={() => refetchOrders()}>
                <FaSyncAlt /> Refresh Data
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Date Range Selector */}
      <Row className="mb-4">
        <Col>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="date-picker-wrapper">
                  <DatePicker
                    selectsRange
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={(update) => {
                      setDateRange({
                        startDate: update[0],
                        endDate: update[1]
                      });
                    }}
                    className="form-control"
                  />
                </div>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setDataPeriod('daily')}>
                    Daily
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setDataPeriod('weekly')}>
                    Weekly
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => setDataPeriod('monthly')}>
                    Monthly
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Sales</h6>
                  <h3>${stats.totalSales.toFixed(2)}</h3>
                </div>
                <FaDollarSign className="dashboard-icon text-success" />
              </div>
              <div className="mt-2">
                {comparisonMetrics.sales.percentChange > 0 ? (
                  <small className="text-success">
                    <FaArrowUp /> {comparisonMetrics.sales.percentChange}% from last period
                  </small>
                ) : (
                  <small className="text-danger">
                    <FaArrowDown /> {Math.abs(comparisonMetrics.sales.percentChange)}% from last period
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* Add similar cards for Orders, Customers, and Average Order Value */}
      </Row>

      {/* Advanced Metrics */}
      {analyticsView === 'advanced' && renderAdvancedAnalytics()}

      {/* Charts and Tables */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="dashboard-card">
            <Card.Header>Sales Trend</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Line
                  ref={salesChartRef}
                  data={{
                    labels: stats.salesTrend.map(data => data.period),
                    datasets: [{
                      label: 'Sales',
                      data: stats.salesTrend.map(data => data.amount),
                      fill: true,
                      borderColor: '#36A2EB',
                      backgroundColor: 'rgba(54, 162, 235, 0.1)',
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Header>Customer Growth</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: stats.customerGrowth.map(data => data.period),
                    datasets: [{
                      label: 'New Customers',
                      data: stats.customerGrowth.map(data => data.count),
                      backgroundColor: '#4BC0C0'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {renderMetricDetailsModal()}
    </div>
  );

  const renderMetricDetailsModal = () => (
    <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{selectedMetric?.title || 'Metric Details'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedMetric?.content}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Print Report
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loadingOrders || loadingProducts || loadingUsers) {
    return <Loader />;
  }

  if (errorOrders || errorProducts || errorUsers) {
    return (
      <Message variant="danger">
        {errorOrders?.message || errorProducts?.message || errorUsers?.message}
      </Message>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="admin-sidebar">
          <AdminSidebar />
        </Col>
        <Col md={10} className="admin-main-content">
          <div className="dashboard-header">
            <h2>Admin Dashboard</h2>
            <div className="dashboard-actions">
              <Button variant="outline-primary" size="sm" onClick={handlePrint} className="me-2">
                <FaPrint className="me-1" /> Print Report
              </Button>
              <Button variant="outline-success" size="sm" onClick={exportSalesData} disabled={isExporting}>
                <FaDownload className="me-1" /> Export Data
              </Button>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="date-picker-wrapper mb-4">
            <DatePicker
              selectsRange
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(update) => setDateRange({ startDate: update[0], endDate: update[1] })}
              className="form-control"
            />
          </div>

          {/* Main Content */}
          <div ref={componentRef}>
            {loadingOrders || loadingProducts || loadingUsers ? (
              <Loader />
            ) : errorOrders || errorProducts || errorUsers ? (
              <Message variant="danger">
                {errorOrders?.message || errorProducts?.message || errorUsers?.message}
              </Message>
            ) : (
              <>
                {renderOverviewTab()}
                {renderAdvancedAnalytics()}
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardScreen;
