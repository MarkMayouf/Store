import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
  useCreateCouponMutation,
} from '../../slices/couponsApiSlice';

const CouponListScreen = () => {
  const { data: coupons, isLoading, error, refetch } = useGetCouponsQuery();

  const [deleteCoupon, { isLoading: loadingDelete }] =
    useDeleteCouponMutation();

  const [createCoupon, { isLoading: loadingCreate }] =
    useCreateCouponMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        refetch();
        toast.success('Coupon deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createCouponHandler = async () => {
    if (window.confirm('Are you sure you want to create a new coupon?')) {
      try {
        // Add default values for required fields
        const defaultCoupon = {
          code: 'NEW' + Date.now(),
          discountType: 'percentage',
          discountValue: 10,
          validFrom: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          isActive: true,
          minimumPurchaseAmount: 0,
          description: 'New Coupon',
        };

        await createCoupon(defaultCoupon);
        refetch();
        toast.success('Coupon created successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row>
      <Col md={3} lg={2}>
        <AdminSidebar activeKey='coupons' />
      </Col>
      <Col md={9} lg={10}>
        <Row className='align-items-center'>
          <Col>
            <h1>Coupons</h1>
          </Col>
          <Col className='text-end'>
            <Button className='my-3' onClick={createCouponHandler}>
              <FaPlus /> Create Coupon
            </Button>
          </Col>
        </Row>

        {loadingCreate && <Loader />}
        {loadingDelete && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className='table-sm admin-table'
          >
            <thead>
              <tr>
                <th>CODE</th>
                <th>TYPE</th>
                <th>VALUE</th>
                <th>MIN. AMOUNT</th>
                <th>VALID UNTIL</th>
                <th>STATUS</th>
                <th>USES</th>
                <th className='table-action'></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountType}</td>
                  <td>
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </td>
                  <td>${coupon.minimumPurchaseAmount}</td>
                  <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                  <td>
                    {coupon.isActive ? (
                      <span className='text-success'>Active</span>
                    ) : (
                      <span className='text-danger'>Inactive</span>
                    )}
                  </td>
                  <td>{coupon.timesUsed}</td>
                  <td>
                    <LinkContainer to={`/admin/coupon/${coupon._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2'>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(coupon._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default CouponListScreen;
