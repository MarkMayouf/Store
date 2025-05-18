import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, ListGroup } from 'react-bootstrap';
import {
  FaChartBar,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaTags,
  FaTachometerAlt,
  FaArrowLeft,
} from 'react-icons/fa';

const AdminSidebar = ({ activeKey = 'dashboard' }) => {
  return (
    <Card className='admin-sidebar border-0 shadow-sm mb-4'>
      <Card.Header className='bg-dark text-white'>
        <h4 className='mb-0 d-flex align-items-center'>
          <FaTachometerAlt className='me-2' /> Admin Panel
        </h4>
      </Card.Header>
      <ListGroup variant='flush'>
        <ListGroup.Item
          as={NavLink}
          to='/admin/dashboard'
          active={activeKey === 'dashboard'}
          className='d-flex align-items-center py-3'
        >
          <FaChartBar className='me-3' /> Dashboard
        </ListGroup.Item>

        <ListGroup.Item
          as={NavLink}
          to='/admin/productlist'
          active={activeKey === 'products'}
          className='d-flex align-items-center py-3'
        >
          <FaBox className='me-3' /> Products
        </ListGroup.Item>

        <ListGroup.Item
          as={NavLink}
          to='/admin/orderlist'
          active={activeKey === 'orders'}
          className='d-flex align-items-center py-3'
        >
          <FaClipboardList className='me-3' /> Orders
        </ListGroup.Item>

        <ListGroup.Item
          as={NavLink}
          to='/admin/userlist'
          active={activeKey === 'users'}
          className='d-flex align-items-center py-3'
        >
          <FaUsers className='me-3' /> Users
        </ListGroup.Item>

        <ListGroup.Item
          as={NavLink}
          to='/admin/couponlist'
          active={activeKey === 'coupons'}
          className='d-flex align-items-center py-3'
        >
          <FaTags className='me-3' /> Coupons
        </ListGroup.Item>

        <ListGroup.Item
          as={NavLink}
          to='/'
          className='d-flex align-items-center py-3 text-primary'
        >
          <FaArrowLeft className='me-3' /> Back to Shop
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default AdminSidebar;
