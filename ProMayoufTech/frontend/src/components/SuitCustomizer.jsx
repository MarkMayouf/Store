import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import {
  FaRuler,
  FaPencilAlt,
  FaSave,
  FaInfoCircle,
  FaShoppingCart,
  FaExclamationTriangle,
} from 'react-icons/fa';

const SuitCustomizer = ({
  product,
  onComplete,
  initialCustomizations,
  isEditingCartItem = false,
  onOpenGuide,
}) => {
  const [customizations, setCustomizations] = useState(
    initialCustomizations || {
      pants: {
        length: '',
        waist: '',
        taper: 'No',
        cuff: 'None',
      },
      additionalNotes: '',
      customizationPrice: 0,
    }
  );

  const [validationErrors, setValidationErrors] = useState({});

  const calculateCustomizationPrice = useCallback(() => {
    // New pricing structure:
    // $10 for length alteration only
    // $25 for any other alterations (waist, taper, cuff)

    const hasLength = customizations.pants.length !== '';
    const hasOtherAlterations =
      customizations.pants.waist !== '' ||
      customizations.pants.taper === 'Yes' ||
      customizations.pants.cuff !== 'None';

    if (!hasLength && !hasOtherAlterations) {
      return 0;
    } else if (hasLength && !hasOtherAlterations) {
      return 10; // Only length alteration
    } else {
      return 25; // Any combination of alterations
    }
  }, [customizations.pants]);

  const handleInputChange = (field, value) => {
    setCustomizations((prev) => {
      const newCustomizations = {
        ...prev,
        pants: {
          ...prev.pants,
          [field]: value,
        },
      };

      // Handle additionalNotes separately
      if (field === 'additionalNotes') {
        newCustomizations.additionalNotes = value;
        delete newCustomizations.pants.additionalNotes;
      }

      // Update customization price
      newCustomizations.customizationPrice = calculateCustomizationPrice();

      return newCustomizations;
    });

    // Clear validation errors when user makes changes
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Require at least one alteration
    if (
      customizations.pants.length === '' &&
      customizations.pants.waist === '' &&
      customizations.pants.taper === 'No' &&
      customizations.pants.cuff === 'None'
    ) {
      errors.general = 'Please specify at least one alteration';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (typeof onComplete === 'function') {
        onComplete(customizations);
      } else {
        console.error('Error: onComplete prop is not a function');
        setValidationErrors({
          general:
            'Technical error: Unable to save customizations. Please try again.',
        });
      }
    }
  };

  const handleOpenGuide = () => {
    if (typeof onOpenGuide === 'function') {
      onOpenGuide();
    } else {
      console.error('Error: onOpenGuide prop is not a function');
    }
  };

  // Calculate initial price if there are initial customizations
  useEffect(() => {
    const price = calculateCustomizationPrice();
    setCustomizations((prev) => ({
      ...prev,
      customizationPrice: price,
    }));
  }, [calculateCustomizationPrice]);

  return (
    <Card className='suit-customizer'>
      <Card.Header as='h4'>
        <Row className='align-items-center'>
          <Col>
            <FaPencilAlt className='me-2' />
            {isEditingCartItem ? 'Edit Suit Customization' : 'Pants Alteration'}
          </Col>
          <Col xs='auto'>
            <Button
              variant='primary'
              onClick={handleSubmit}
              className='save-customization-btn'
            >
              <FaSave className='me-2' />
              {isEditingCartItem ? 'Update Customization' : 'Save Alterations'}
            </Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        {isEditingCartItem && (
          <Alert variant='info' className='mb-3'>
            <FaShoppingCart className='me-2' />
            You are editing customization for a suit in your cart. After saving,
            you'll need to update your cart item.
          </Alert>
        )}

        <Alert variant='info' className='customization-price-alert'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <strong>Alteration price:</strong>
              <Badge bg='primary' className='ms-2 price-badge'>
                ${customizations.customizationPrice}
              </Badge>
              <div className='mt-1 small text-muted'>
                Length only: $10 | Any other alterations: $25
              </div>
            </div>
            <Button
              variant='link'
              className='p-0 text-decoration-none'
              onClick={handleOpenGuide}
            >
              <FaInfoCircle className='me-1' />
              View Alteration Guide
            </Button>
          </div>
        </Alert>

        {validationErrors.general && (
          <Alert variant='danger'>{validationErrors.general}</Alert>
        )}

        <div className='pants-alterations'>
          <h5 className='section-title'>
            <FaRuler className='me-2' />
            Pants Alterations
          </h5>

          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Length Adjustment (inches)</Form.Label>
                <Form.Control
                  type='number'
                  step='0.25'
                  value={customizations.pants.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  placeholder='e.g. 1.5 (shorten) or -1.5 (lengthen)'
                  isInvalid={validationErrors.length}
                />
                <Form.Text className='text-muted'>
                  Positive value will shorten, negative will lengthen
                </Form.Text>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Waist Adjustment (inches)</Form.Label>
                <Form.Control
                  type='number'
                  step='0.25'
                  value={customizations.pants.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                  placeholder='e.g. 1 (take in) or -1 (let out)'
                  isInvalid={validationErrors.waist}
                />
                <Form.Text className='text-muted'>
                  Positive value will take in, negative will let out
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Taper Legs</Form.Label>
                <Form.Select
                  value={customizations.pants.taper}
                  onChange={(e) => handleInputChange('taper', e.target.value)}
                >
                  <option value='No'>No Tapering</option>
                  <option value='Yes'>Yes, Taper Legs</option>
                </Form.Select>
                <Form.Text className='text-muted'>
                  Tapers legs for a slimmer fit
                </Form.Text>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Cuff Style</Form.Label>
                <Form.Select
                  value={customizations.pants.cuff}
                  onChange={(e) => handleInputChange('cuff', e.target.value)}
                >
                  <option value='None'>No Cuff (Plain Hem)</option>
                  <option value='Single'>Single Cuff</option>
                  <option value='Double'>Double Cuff</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className='mt-3'>
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={customizations.additionalNotes}
              onChange={(e) =>
                handleInputChange('additionalNotes', e.target.value)
              }
              placeholder='Any special requests or notes for your alterations'
            />
            <Form.Text className='text-muted'>
              Please include any specific requirements not covered above
            </Form.Text>
          </Form.Group>
        </div>

        <div className='return-policy-note mt-4'>
          <h6 className='mb-2'>
            <FaExclamationTriangle className='me-2' />
            Return Policy Notice
          </h6>
          <p className='mb-0'>
            <strong>Please Note:</strong> Items with custom alterations are not
            eligible for standard returns. However, we offer{' '}
            <strong>free in-store adjustments</strong> within 30 days of
            purchase at any ProMayouf location.
          </p>
        </div>

        <div className='d-flex justify-content-end mt-4'>
          <Button variant='primary' onClick={handleSubmit}>
            <FaSave className='me-2' />
            {isEditingCartItem ? 'Update Customization' : 'Save Alterations'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SuitCustomizer;
