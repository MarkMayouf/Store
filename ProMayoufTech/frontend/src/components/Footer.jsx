import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPinterest,
  FaYoutube,
  FaCreditCard,
  FaLock,
  FaTruck,
  FaArrowRight,
} from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Newsletter subscription */}
      <section className='newsletter-section py-5 bg-light'>
        <Container>
          <Row className='justify-content-center'>
            <Col md={8} lg={6} className='text-center'>
              <h4 className='mb-2'>Subscribe to Our Newsletter</h4>
              <p className='text-muted mb-4'>
                Get exclusive offers, style tips, and more straight to your
                inbox.
              </p>
              <Form>
                <InputGroup className='mb-3'>
                  <Form.Control
                    placeholder='Your email address'
                    aria-label='Email address'
                    className='py-2'
                  />
                  <Button variant='dark' type='submit' className='px-4'>
                    Subscribe <FaArrowRight className='ms-2' />
                  </Button>
                </InputGroup>
                <Form.Text className='text-muted'>
                  By subscribing, you agree to our Privacy Policy and Terms of
                  Service.
                </Form.Text>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main footer */}
      <footer className='bg-white border-top'>
        <Container className='py-5'>
          <Row className='g-4'>
            <Col md={3} sm={6}>
              <h5 className='fw-bold mb-3'>Shopping</h5>
              <ul className='list-unstyled footer-links'>
                <li className='mb-2'>
                  <LinkContainer to='/category/suits'>
                    <a className='text-decoration-none text-secondary'>Suits</a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/category/Shoes'>
                    <a className='text-decoration-none text-secondary'>Shoes</a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/category/Accessories'>
                    <a className='text-decoration-none text-secondary'>
                      Accessories
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/new-arrivals'>
                    <a className='text-decoration-none text-secondary'>
                      New Arrivals
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/sale'>
                    <a className='text-decoration-none text-secondary'>
                      Sales & Offers
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/gift-cards'>
                    <a className='text-decoration-none text-secondary'>
                      Gift Cards
                    </a>
                  </LinkContainer>
                </li>
              </ul>
            </Col>

            <Col md={3} sm={6}>
              <h5 className='fw-bold mb-3'>Customer Service</h5>
              <ul className='list-unstyled footer-links'>
                <li className='mb-2'>
                  <LinkContainer to='/contact'>
                    <a className='text-decoration-none text-secondary'>
                      Contact Us
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/faq'>
                    <a className='text-decoration-none text-secondary'>FAQ</a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/shipping-policy'>
                    <a className='text-decoration-none text-secondary'>
                      Shipping Information
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/return-policy'>
                    <a className='text-decoration-none text-secondary'>
                      Returns & Exchanges
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/sizing-guide'>
                    <a className='text-decoration-none text-secondary'>
                      Sizing Guide
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/order-tracking'>
                    <a className='text-decoration-none text-secondary'>
                      Order Tracking
                    </a>
                  </LinkContainer>
                </li>
              </ul>
            </Col>

            <Col md={3} sm={6}>
              <h5 className='fw-bold mb-3'>About ProMayouf</h5>
              <ul className='list-unstyled footer-links'>
                <li className='mb-2'>
                  <LinkContainer to='/about'>
                    <a className='text-decoration-none text-secondary'>
                      Our Story
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/careers'>
                    <a className='text-decoration-none text-secondary'>
                      Careers
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/corporate-responsibility'>
                    <a className='text-decoration-none text-secondary'>
                      Corporate Responsibility
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/store-locator'>
                    <a className='text-decoration-none text-secondary'>
                      Store Locator
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/blog'>
                    <a className='text-decoration-none text-secondary'>
                      Style Blog
                    </a>
                  </LinkContainer>
                </li>
                <li className='mb-2'>
                  <LinkContainer to='/press'>
                    <a className='text-decoration-none text-secondary'>
                      Press Releases
                    </a>
                  </LinkContainer>
                </li>
              </ul>
            </Col>

            <Col md={3} sm={6}>
              <h5 className='fw-bold mb-3'>Contact Us</h5>
              <ul className='list-unstyled footer-info'>
                <li className='mb-3'>
                  <FaPhone className='me-2 text-dark' />
                  <span className='text-secondary'>1-800-PROMAYOUF</span>
                </li>
                <li className='mb-3'>
                  <FaEnvelope className='me-2 text-dark' />
                  <span className='text-secondary'>
                    support@promayoufsuits.com
                  </span>
                </li>
                <li className='mb-3'>
                  <FaMapMarkerAlt className='me-2 text-dark' />
                  <span className='text-secondary'>
                    123 Fashion Street, New York, NY 10001
                  </span>
                </li>
              </ul>

              <h5 className='fw-bold mb-3 mt-4'>Follow Us</h5>
              <div className='social-icons'>
                <a
                  href='https://facebook.com'
                  className='me-3 text-dark'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href='https://twitter.com'
                  className='me-3 text-dark'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaTwitter size={20} />
                </a>
                <a
                  href='https://instagram.com'
                  className='me-3 text-dark'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href='https://pinterest.com'
                  className='me-3 text-dark'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaPinterest size={20} />
                </a>
                <a
                  href='https://youtube.com'
                  className='text-dark'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FaYoutube size={20} />
                </a>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Secondary footer */}
        <div className='py-4 border-top bg-light'>
          <Container>
            <Row className='align-items-center'>
              <Col md={4} className='mb-3 mb-md-0'>
                <div className='d-flex gap-3'>
                  <img src='/images/visa.png' alt='Visa' height='25' />
                  <img
                    src='/images/mastercard.png'
                    alt='Mastercard'
                    height='25'
                  />
                  <img
                    src='/images/amex.png'
                    alt='American Express'
                    height='25'
                  />
                  <img src='/images/discover.png' alt='Discover' height='25' />
                  <img src='/images/paypal.png' alt='PayPal' height='25' />
                </div>
              </Col>
              <Col md={4} className='text-center mb-3 mb-md-0'>
                <div className='d-flex flex-column flex-md-row gap-md-3 justify-content-center'>
                  <div className='d-flex align-items-center justify-content-center'>
                    <FaLock className='me-2 text-success' />
                    <span className='small'>Secure Shopping</span>
                  </div>
                  <div className='d-flex align-items-center justify-content-center'>
                    <FaTruck className='me-2 text-success' />
                    <span className='small'>Free Shipping Over $75</span>
                  </div>
                </div>
              </Col>
              <Col md={4} className='text-md-end'>
                <p className='mb-0 small text-secondary'>
                  Copyright &copy; {currentYear} Mayouf Suits. All rights
                  reserved.
                </p>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Legal links */}
        <div className='py-3 bg-dark text-center'>
          <Container>
            <Row>
              <Col>
                <div className='d-flex flex-wrap justify-content-center'>
                  <LinkContainer to='/privacy-policy'>
                    <a className='text-white text-decoration-none mx-2 small'>
                      Privacy Policy
                    </a>
                  </LinkContainer>
                  <span className='text-white mx-1'>|</span>
                  <LinkContainer to='/terms'>
                    <a className='text-white text-decoration-none mx-2 small'>
                      Terms of Service
                    </a>
                  </LinkContainer>
                  <span className='text-white mx-1'>|</span>
                  <LinkContainer to='/accessibility'>
                    <a className='text-white text-decoration-none mx-2 small'>
                      Accessibility
                    </a>
                  </LinkContainer>
                  <span className='text-white mx-1'>|</span>
                  <LinkContainer to='/legal'>
                    <a className='text-white text-decoration-none mx-2 small'>
                      Legal Information
                    </a>
                  </LinkContainer>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>
    </>
  );
};

export default Footer;
