import {
  apiSlice
} from './apiSlice';
import {
  ORDERS_URL,
  PAYPAL_URL
} from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({
        orderId,
        details
      }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),
    updateOrderTracking: builder.mutation({
      query: ({
        orderId,
        trackingInfo
      }) => ({
        url: `${ORDERS_URL}/${orderId}/tracking`,
        method: 'PUT',
        body: trackingInfo,
      }),
    }),
    updateOrderNotes: builder.mutation({
      query: ({
        orderId,
        adminNotes
      }) => ({
        url: `${ORDERS_URL}/${orderId}/notes`,
        method: 'PUT',
        body: {
          adminNotes
        },
      }),
    }),
    refundOrder: builder.mutation({
      query: ({
        orderId,
        refundAmount,
        refundReason
      }) => ({
        url: `${ORDERS_URL}/${orderId}/refund`,
        method: 'PUT',
        body: {
          refundAmount,
          refundReason
        },
      }),
    }),
    resendOrderConfirmation: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/resend-confirmation`,
        method: 'POST',
      }),
    }),
    bulkUpdateOrders: builder.mutation({
      query: ({
        orderIds,
        action
      }) => ({
        url: `${ORDERS_URL}/bulk-update`,
        method: 'PUT',
        body: {
          orderIds,
          action
        },
      }),
    }),
    generateInvoice: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/invoice`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    sendInvoiceEmail: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/send-invoice`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useUpdateOrderTrackingMutation,
  useUpdateOrderNotesMutation,
  useRefundOrderMutation,
  useResendOrderConfirmationMutation,
  useBulkUpdateOrdersMutation,
  useGenerateInvoiceMutation,
  useSendInvoiceEmailMutation,
} = orderApiSlice;