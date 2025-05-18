import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import './assets/styles/product.css';
import './assets/styles/admin.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import store from './store';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PayPalScriptProvider deferLoading={true}>
          <Router>
            <App />
          </Router>
        </PayPalScriptProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();