import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [regularPrice, setRegularPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [fit, setFit] = useState('');
  const [style, setStyle] = useState('');
  const [pieces, setPieces] = useState(2);
  const [isOnSale, setIsOnSale] = useState(false);
  const [saleEndDate, setSaleEndDate] = useState('');

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        regularPrice,
        image,
        brand,
        category,
        subCategory,
        description,
        countInStock,
        color,
        material,
        fit,
        style,
        pieces: Number(pieces),
        isOnSale,
        saleEndDate: saleEndDate || undefined,
      }).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success('Product updated');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setRegularPrice(product.regularPrice || product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setSubCategory(product.subCategory || '');
      setCountInStock(product.countInStock);
      setDescription(product.description);
      setColor(product.color || '');
      setMaterial(product.material || '');
      setFit(product.fit || 'Regular');
      setStyle(product.style || 'Business');
      setPieces(product.pieces || 2);
      setIsOnSale(product.isOnSale || false);
      setSaleEndDate(product.saleEndDate ? product.saleEndDate.substring(0, 10) : '');
    }
  }, [product]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const categoryOptions = ['Suits', 'Tuxedos', 'Blazers', 'Dress Shirts', 'Accessories'];
  const fitOptions = ['Slim', 'Regular', 'Classic', 'Modern'];
  const styleOptions = ['Business', 'Wedding', 'Formal', 'Casual'];
  const piecesOptions = [2, 3];

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error.data.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId='price'>
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Enter price'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  ></Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='regularPrice'>
                  <Form.Label>Regular Price</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Enter regular price'
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId='image'>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter image url'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              ></Form.Control>
              <Form.Control
                label='Choose File'
                onChange={uploadFileHandler}
                type='file'
              ></Form.Control>
              {loadingUpload && <Loader />}
            </Form.Group>

            <Form.Group controlId='brand'>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='countInStock'>
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter countInStock'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId='category'>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value=''>Select Category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='subCategory'>
                  <Form.Label>Sub-Category</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter sub-category'
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId='color'>
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter color'
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                  ></Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='material'>
                  <Form.Label>Material</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter material'
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    required
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group controlId='fit'>
                  <Form.Label>Fit</Form.Label>
                  <Form.Select
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    required
                  >
                    <option value=''>Select Fit</option>
                    {fitOptions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId='style'>
                  <Form.Label>Style</Form.Label>
                  <Form.Select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    required
                  >
                    <option value=''>Select Style</option>
                    {styleOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId='pieces'>
                  <Form.Label>Pieces</Form.Label>
                  <Form.Select
                    value={pieces}
                    onChange={(e) => setPieces(e.target.value)}
                    required
                  >
                    <option value=''>Select Pieces</option>
                    {piecesOptions.map((p) => (
                      <option key={p} value={p}>{p}-piece</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId='isOnSale'>
                  <Form.Check
                    type='checkbox'
                    label='On Sale'
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                  ></Form.Check>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='saleEndDate'>
                  <Form.Label>Sale End Date</Form.Label>
                  <Form.Control
                    type='date'
                    value={saleEndDate}
                    onChange={(e) => setSaleEndDate(e.target.value)}
                    disabled={!isOnSale}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Enter description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
            >
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
