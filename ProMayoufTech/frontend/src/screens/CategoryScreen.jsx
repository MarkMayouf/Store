import React, { useEffect } from 'react';
import { Row, Col, Card, Container, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaAngleRight, FaArrowLeft } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import '../assets/styles/category.css';

const CategoryScreen = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const categoryLower = category ? category.toLowerCase() : '';

  // Fetch products for the category
  const { data: productsData, isLoading, error, refetch } = useGetProductsQuery({
    category: category,
    pageNumber: 1
  });

  // Retry fetching if there's an error
  useEffect(() => {
    if (error) {
      const retryTimeout = setTimeout(() => {
        refetch();
      }, 3000); // Retry after 3 seconds
      return () => clearTimeout(retryTimeout);
    }
  }, [error, refetch]);

  const categories = {
    suits: {
      title: 'Luxury Suits Collection',
      description:
        'Discover our exquisite collection of handcrafted suits, tailored to perfection for every occasion.',
      items: [
        {
          id: 'formal',
          name: 'Formal Suits',
          description:
            'Classic formal suits for business and special occasions',
          image: '/images/categories/formal-suits.jpg',
        },
        {
          id: 'wedding',
          name: 'Wedding Suits',
          description: 'Elegant wedding suits for your special day',
          image: '/images/categories/wedding-suits.jpg',
        },
        {
          id: 'business',
          name: 'Business Suits',
          description: 'Professional suits for the modern businessman',
          image: '/images/categories/business-suits.jpg',
        },
        {
          id: 'tuxedos',
          name: 'Tuxedos',
          description: 'Sophisticated tuxedos for black-tie events',
          image: '/images/categories/tuxedos.jpg',
        },
      ],
    },
    shoes: {
      title: 'Premium Footwear Collection',
      description:
        'Step into luxury with our handcrafted shoes, designed for comfort and style.',
      items: [
        {
          id: 'oxford',
          name: 'Oxford Shoes',
          description: 'Classic Oxford shoes for formal occasions',
          image: '/images/categories/oxford-shoes.jpg',
        },
        {
          id: 'derby',
          name: 'Derby Shoes',
          description: 'Versatile Derby shoes for any occasion',
          image: '/images/categories/derby-shoes.jpg',
        },
        {
          id: 'loafers',
          name: 'Loafers',
          description: 'Comfortable and stylish loafers',
          image: '/images/categories/loafers.jpg',
        },
        {
          id: 'boots',
          name: 'Dress Boots',
          description: 'Elegant dress boots for a sophisticated look',
          image: '/images/categories/dress-boots.jpg',
        },
      ],
    },
    accessories: {
      title: 'Fine Accessories Collection',
      description:
        'Complete your look with our premium accessories, crafted with attention to detail.',
      items: [
        {
          id: 'ties',
          name: 'Ties & Bow Ties',
          description: 'Elegant ties and bow ties to complement your outfit',
          image: '/images/categories/ties.jpg',
        },
        {
          id: 'belts',
          name: 'Premium Belts',
          description: 'Quality leather belts for a refined look',
          image: '/images/categories/belts.jpg',
        },
        {
          id: 'cufflinks',
          name: 'Cufflinks & Tie Clips',
          description:
            'Sophisticated cufflinks and tie clips for special occasions',
          image: '/images/categories/cufflinks.jpg',
        },
        {
          id: 'pocketsquares',
          name: 'Pocket Squares',
          description: 'Stylish pocket squares to elevate your suit',
          image: '/images/categories/pocket-squares.jpg',
        },
      ],
    },
  };

  const currentCategory = categories[categoryLower];

  if (!currentCategory) {
    return (
      <Container className='py-5 text-center category-not-found'>
        <div className='mb-4'>
          <i
            className='fas fa-exclamation-circle'
            style={{ fontSize: '3rem', color: '#003b5c' }}
          ></i>
        </div>
        <h2>Category Not Found</h2>
        <p className='text-muted'>
          We couldn't find the category you're looking for.
        </p>
        <Button
          variant='primary'
          className='mt-3'
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#003b5c', border: 'none' }}
        >
          <FaArrowLeft className='me-2' /> Return to Home
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container>
      <Helmet>
        <title>{currentCategory.title} | ProMayouf</title>
        <meta name='description' content={currentCategory.description} />
      </Helmet>

      <div className='category-breadcrumb'>
        <Link to='/'>Home</Link> <span>/</span> <span>{category}</span>
      </div>

      <div className='category-header'>
        <h1 className='category-title'>{currentCategory.title}</h1>
        <p className='category-description'>{currentCategory.description}</p>
      </div>

      {error && (
        <Message variant='danger'>
          {error?.data?.message || 'Error loading products. Please try again later.'}
        </Message>
      )}

      <div className='category-description-box'>
        <h2>
          Why Choose Our{' '}
          {category.charAt(0).toUpperCase() + categoryLower.slice(1)}?
        </h2>
        <p>
          At ProMayouf, we take pride in delivering exceptional quality and
          craftsmanship. Each piece in our {categoryLower} collection is
          carefully selected and crafted using the finest materials to ensure
          both style and durability.
        </p>
      </div>

      <Row className='category-grid'>
        {currentCategory.items.map((item, index) => (
          <Col key={item.id} sm={12} md={6} lg={3} className='mb-4'>
            <Card
              className='h-100 category-card'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className='card-img-container'>
                <Card.Img
                  variant='top'
                  src={item.image}
                  alt={item.name}
                  className='category-card-img'
                />
              </div>
              <Card.Body className='d-flex flex-column'>
                <Card.Title>{item.name}</Card.Title>
                <p className='text-muted'>{item.description}</p>
                <Link
                  to={`/page/1?category=${categoryLower}&subcategory=${item.id}`}
                  state={{ from: `/category/${category}` }}
                  className='btn btn-primary mt-auto category-card-btn'
                  style={{ backgroundColor: '#003b5c', border: 'none' }}
                >
                  Browse {item.name} <FaAngleRight />
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CategoryScreen;
