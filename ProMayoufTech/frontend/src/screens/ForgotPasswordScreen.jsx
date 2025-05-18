import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useRequestPasswordResetMutation } from '../slices/usersApiSlice';
import Meta from '../components/Meta';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await requestPasswordReset({ email }).unwrap();
      toast.success('Password reset instructions sent to your email');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <Meta title='Forgot Password' />
      <h1>Forgot Password</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-3' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button
          type='submit'
          variant='primary'
          className='mt-2'
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Reset Password'}
        </Button>

        {isLoading && <Loader />}

        <Row className='py-3'>
          <Col>
            Remember your password?{' '}
            <Button
              variant='link'
              className='p-0'
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Col>
        </Row>
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
