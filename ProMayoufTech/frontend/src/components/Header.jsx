import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Nav,
  Container,
  Badge,
  Dropdown,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
} from 'react-bootstrap';
import {
  FaShoppingCart,
  FaUser,
  FaHeart,
  FaSearch,
  FaBars,
  FaAngleDown,
  FaPhone,
  FaComments,
  FaUserCog,
  FaChartBar,
  FaBox,
  FaList,
  FaTags,
  FaUsers,
} from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import logo from '../assets/logo.png';
import { resetCart } from '../slices/cartSlice';
import '../assets/styles/home.css';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wishlistCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className='site-header'>
      {/* Top utility bar */}
      <div className='top-bar'>
        <Container>
          <Row className='align-items-center'>
            <Col xs={4} md={4} className='d-flex align-items-center'>
              <FaPhone className='me-2' size={14} />
              <span className='me-4'>1-800-PROMAYOUF</span>
              <a href='#' className='text-white text-decoration-none me-3'>
                Store Locator
              </a>
              <a href='#' className='text-white text-decoration-none'>
                Help
              </a>
            </Col>

            {/* Center Logo Column */}
            <Col xs={4} md={4} className='text-center'>
              <LinkContainer to='/'>
                <div className='d-inline-flex align-items-center mx-auto'>
                  <img
                    src={logo}
                    alt='ProMayouf'
                    className='me-1'
                    style={{
                      height: '28px',
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <div className='text-white fw-bold' style={{ letterSpacing: '0.5px' }}>
                    PROMAYOUF
                  </div>
                </div>
              </LinkContainer>
            </Col>

            {/* Right side - Auth links */}
            <Col xs={4} md={4} className='text-end'>
              {userInfo ? (
                <Dropdown align='end'>
                  <Dropdown.Toggle
                    variant='link'
                    className='text-white text-decoration-none'
                  >
                    <FaUser className='me-1' />
                    {userInfo.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <LinkContainer to='/profile'>
                      <Dropdown.Item>
                        <FaUserCog className='me-2' /> Profile
                      </Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to='/orders'>
                      <Dropdown.Item>
                        <FaList className='me-2' /> Orders
                      </Dropdown.Item>
                    </LinkContainer>
                    {userInfo.isAdmin && (
                      <LinkContainer to='/admin/dashboard'>
                        <Dropdown.Item>
                          <FaChartBar className='me-2' /> Admin
                        </Dropdown.Item>
                      </LinkContainer>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logoutHandler}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <LinkContainer to='/login'>
                    <a className='text-white text-decoration-none me-3'>Sign In</a>
                  </LinkContainer>
                  <LinkContainer to='/register'>
                    <a className='text-white text-decoration-none'>Create Account</a>
                  </LinkContainer>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main navbar */}
      <Navbar
        bg='white'
        variant='light'
        expand='lg'
        className={`py-3 ${isScrolled ? 'scrolled' : ''}`}
      >
        <Container>
          {/* Mobile toggle and icons for small screens */}
          <div className='d-flex d-lg-none align-items-center'>
            <Button
              variant='link'
              className='nav-icon px-2'
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <FaBars size={20} color='#212529' />
            </Button>
            <LinkContainer to='/'>
              <img
                src={logo}
                alt='ProMayouf'
                style={{ height: '30px' }}
                className='ms-2'
              />
            </LinkContainer>
          </div>

          {/* Left side navigation - visible only on large screens */}
          <div className='d-none d-lg-flex flex-grow-1 justify-content-start'>
            <Nav>
              <LinkContainer to='/category/suits'>
                <Nav.Link className='nav-link-josbank'>Suits</Nav.Link>
              </LinkContainer>

              <LinkContainer to='/category/shoes'>
                <Nav.Link className='nav-link-josbank'>Shoes</Nav.Link>
              </LinkContainer>

              <LinkContainer to='/category/accessories'>
                <Nav.Link className='nav-link-josbank'>Accessories</Nav.Link>
              </LinkContainer>

              <LinkContainer to='/sale'>
                <Nav.Link className='nav-link-josbank text-danger'>Sale</Nav.Link>
              </LinkContainer>
            </Nav>
          </div>

          {/* Right side icons */}
          <div className='d-flex align-items-center'>
            <Form onSubmit={handleSearch} className='me-3 search-form d-none d-lg-block'>
              <InputGroup>
                <Form.Control
                  type='text'
                  placeholder='Search...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='search-input'
                />
                <Button variant='link' type='submit' className='search-btn'>
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>

            <LinkContainer to='/wishlist'>
              <Button
                variant='link'
                className='nav-icon px-2 position-relative d-none d-lg-block'
              >
                <FaHeart size={20} color='#212529' />
                {wishlistCount > 0 && (
                  <Badge
                    pill
                    bg='danger'
                    className='position-absolute top-0 start-100 translate-middle badge-sm'
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </LinkContainer>

            <LinkContainer to='/cart'>
              <Button variant='link' className='nav-icon px-2 position-relative'>
                <FaShoppingCart size={20} color='#212529' />
                {cartItems.length > 0 && (
                  <Badge
                    pill
                    bg='danger'
                    className='position-absolute top-0 start-100 translate-middle badge-sm'
                  >
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </Badge>
                )}
              </Button>
            </LinkContainer>
          </div>
        </Container>
      </Navbar>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className='mobile-menu'>
          <Container>
            <Nav className='flex-column'>
              <LinkContainer to='/category/suits'>
                <Nav.Link>Suits</Nav.Link>
              </LinkContainer>
              <LinkContainer to='/category/shoes'>
                <Nav.Link>Shoes</Nav.Link>
              </LinkContainer>
              <LinkContainer to='/category/accessories'>
                <Nav.Link>Accessories</Nav.Link>
              </LinkContainer>
              <LinkContainer to='/sale'>
                <Nav.Link className='text-danger'>Sale</Nav.Link>
              </LinkContainer>
            </Nav>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;
