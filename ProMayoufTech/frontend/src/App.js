import React from 'react';
import {
  Outlet,
  Route,
  Routes
} from 'react-router-dom';
import {
  ToastContainer
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container
} from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ShippingScreen from './screens/ShippingScreen';
import PrivateRoute from './components/PrivateRoute';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import AdminRoute from './components/AdminRoute';
import CategoryScreen from './screens/CategoryScreen';
import CouponListScreen from './screens/admin/CouponListScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';

const App = () => {
  return ( <
    >
    <
    Header / >
    <
    main className = 'py-3' >
    <
    Container >
    <
    Routes >
    <
    Route path = '/'
    element = {
      <
      HomeScreen / >
    }
    /> <
    Route path = '/search/:keyword'
    element = {
      <
      HomeScreen / >
    }
    /> <
    Route path = '/page/:pageNumber'
    element = {
      <
      HomeScreen / >
    }
    /> <
    Route path = '/search/:keyword/page/:pageNumber'
    element = {
      <
      HomeScreen / >
    }
    /> <
    Route path = '/product/:id'
    element = {
      <
      ProductScreen / >
    }
    /> <
    Route path = '/cart'
    element = {
      <
      CartScreen / >
    }
    /> <
    Route path = '/login'
    element = {
      <
      LoginScreen / >
    }
    /> <
    Route path = '/register'
    element = {
      <
      RegisterScreen / >
    }
    /> <
    Route path = '/forgot-password'
    element = {
      <
      ForgotPasswordScreen / >
    }
    /> <
    Route path = '/reset-password/:token'
    element = {
      <
      ResetPasswordScreen / >
    }
    /> <
    Route path = '/category/:category'
    element = {
      <
      CategoryScreen / >
    }
    /> <
    Route path = '/category/:category/:subcategory'
    element = {
      <
      CategoryScreen / >
    }
    />

    <
    Route path = ''
    element = {
      <
      PrivateRoute / >
    } >
    <
    Route path = '/shipping'
    element = {
      <
      ShippingScreen / >
    }
    /> <
    Route path = '/payment'
    element = {
      <
      PaymentScreen / >
    }
    /> <
    Route path = '/placeorder'
    element = {
      <
      PlaceOrderScreen / >
    }
    /> <
    Route path = '/order/:id'
    element = {
      <
      OrderScreen / >
    }
    /> <
    Route path = '/order/:id/receipt'
    element = {
      <
      ReceiptScreen / >
    }
    /> <
    Route path = '/profile'
    element = {
      <
      ProfileScreen / >
    }
    /> < /
    Route >

    <
    Route path = ''
    element = {
      <
      AdminRoute / >
    } >
    <
    Route path = '/admin/dashboard'
    element = {
      <
      AdminDashboardScreen / >
    }
    /> <
    Route path = '/admin/orderlist'
    element = {
      <
      OrderListScreen / >
    }
    /> <
    Route path = '/admin/productlist'
    element = {
      <
      ProductListScreen / >
    }
    /> <
    Route path = '/admin/productlist/:pageNumber'
    element = {
      <
      ProductListScreen / >
    }
    /> <
    Route path = '/admin/userlist'
    element = {
      <
      UserListScreen / >
    }
    /> <
    Route path = '/admin/product/:id/edit'
    element = {
      <
      ProductEditScreen / >
    }
    /> <
    Route path = '/admin/user/:id/edit'
    element = {
      <
      UserEditScreen / >
    }
    /> <
    Route path = '/admin/couponlist'
    element = {
      <
      CouponListScreen / >
    }
    /> < /
    Route > <
    /Routes> < /
    Container > <
    Outlet / >
    <
    /main> <
    Footer / >
    <
    ToastContainer / >
    <
    />
  );
};

export default App;