import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import Meta from '../components/Meta';

import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Handle account lockout timer
  useEffect(() => {
    let interval;

    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prevTime) => {
          if (prevTime <= 1) {
            setIsLocked(false);
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockTimer]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(
        `Account is temporarily locked. Try again in ${Math.ceil(
          lockTimer / 60
        )} minutes.`
      );
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      // Reset attempts on successful login
      setLoginAttempts(0);
      navigate(redirect);
    } catch (err) {
      // Increment failed login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // After 3 failed attempts, lock the account temporarily
      if (newAttempts >= 3) {
        setIsLocked(true);
        const lockoutTime = 60 * 5; // 5 minutes in seconds
        setLockTimer(lockoutTime);
        toast.error(
          `Too many failed login attempts. Your account is locked for 5 minutes.`
        );
      } else {
        toast.error(
          err?.data?.message || err.error || 'Invalid email or password'
        );
      }
    }
  };

  return (
    <FormContainer>
      <Meta title='Sign In' />
      <h1>Sign In</h1>

      {isLocked && (
        <Alert variant='danger'>
          Account temporarily locked due to multiple failed attempts. Please try
          again in {Math.floor(lockTimer / 60)}:
          {(lockTimer % 60).toString().padStart(2, '0')} minutes.
        </Alert>
      )}

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Password</Form.Label>
          <div className='position-relative'>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            ></Form.Control>
            <Button
              variant='link'
              className='position-absolute end-0 top-0 text-decoration-none'
              onClick={() => setShowPassword(!showPassword)}
              style={{ padding: '0.4rem' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </Form.Group>

        <Button
          disabled={isLoading || isLocked}
          type='submit'
          variant='primary'
          className='mt-3'
        >
          Sign In
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-3'>
        <Col>
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            Register
          </Link>
        </Col>
      </Row>

      <Row>
        <Col>
          <Link to='/forgot-password' className='text-decoration-none'>
            Forgot Password?
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
