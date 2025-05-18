import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

// NOTE: code here has changed to handle when our JWT and Cookie expire.
// We need to customize the baseQuery to be able to intercept any 401 responses
// and log the user out
// https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#customizing-queries-with-basequery

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies in requests
  prepareHeaders: (headers, { getState }) => {
    // You can add any default headers here
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

async function baseQueryWithAuth(args, api, extra) {
  try {
    console.log('API request:', args);
    const result = await baseQuery(args, api, extra);
    console.log('API response:', result);
    
    // Handle 401 Unauthorized errors
    if (result.error && result.error.status === 401) {
      console.error('Authentication error:', result.error);
      api.dispatch(logout());
      return {
        error: {
          status: 401,
          data: { message: 'Your session has expired. Please log in again.' }
        }
      };
    }
    
    // Handle network errors
    if (result.error && !result.error.status) {
      console.error('Network error:', result.error);
      return {
        error: {
          status: 'FETCH_ERROR',
          data: { message: 'Network error. Please check your connection.' }
        }
      };
    }
    
    return result;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      error: {
        status: 'FETCH_ERROR',
        data: { message: 'An unexpected error occurred. Please try again.' }
      }
    };
  }
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});
