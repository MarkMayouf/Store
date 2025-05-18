import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import {
  FaRobot,
  FaArrowRight,
  FaTimes,
  FaRegCheckCircle,
  FaPaperPlane,
  FaComments,
  FaRegSmile,
  FaChevronDown,
  FaUser,
} from 'react-icons/fa';

const SizeRecommenderChatbot = ({
  onRecommendationComplete,
  productType,
  open,
  setOpen,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userResponses, setUserResponses] = useState({
    height: '',
    weight: '',
    bodyType: '',
    fitPreference: '',
  });
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: `Hi there! I can help you find the perfect ${
        productType || 'item'
      } size.`,
    },
  ]);
  const [minimized, setMinimized] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const questions = [
    {
      id: 'height',
      text: 'What is your height? (in inches or cm)',
      type: 'text',
      placeholder: 'e.g., 5\'10" or 178cm',
    },
    {
      id: 'weight',
      text: 'What is your weight? (in pounds or kg)',
      type: 'text',
      placeholder: 'e.g., 170lbs or 77kg',
    },
    {
      id: 'bodyType',
      text: 'How would you describe your body type?',
      type: 'select',
      options: [
        { value: 'slim', label: 'Slim/Athletic' },
        { value: 'average', label: 'Average' },
        { value: 'muscular', label: 'Muscular/Broad' },
        { value: 'full', label: 'Full/Round' },
      ],
    },
    {
      id: 'fitPreference',
      text: 'What fit do you prefer?',
      type: 'select',
      options: [
        { value: 'slim', label: 'Slim Fit' },
        { value: 'regular', label: 'Regular Fit' },
        { value: 'relaxed', label: 'Relaxed Fit' },
      ],
    },
  ];

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [open, currentStep]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start the conversation when chat opens
  useEffect(() => {
    if (open && currentStep === 0 && messages.length === 1) {
      setTimeout(() => {
        addBotMessage(questions[0].text);
      }, 500);
    }
  }, [open]);

  // Add bot typing effect
  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text }]);
      setIsTyping(false);
    }, 800); // Simulate typing delay
  };

  // Process user response and move to next step
  const handleResponse = (response) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: response.displayText || response },
    ]);

    // Update responses
    setUserResponses((prev) => ({
      ...prev,
      [questions[currentStep].id]: response.value || response,
    }));

    // Move to next step or finish
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        addBotMessage(questions[currentStep + 1].text);
        setCurrentStep((prev) => prev + 1);
      }, 500);
    } else {
      // Calculate recommendation
      setTimeout(() => {
        const recommendation = calculateSizeRecommendation(
          userResponses,
          productType
        );
        setRecommendedSize(recommendation);
        addBotMessage(
          `Based on your information, I recommend size ${recommendation.size}.`
        );
        if (recommendation.notes) {
          addBotMessage(recommendation.notes);
        }
        addBotMessage('Would you like to select this size?');

        // Pass recommendation to parent component
        onRecommendationComplete(recommendation);
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentQuestion = questions[currentStep];
    let response;

    if (currentQuestion.type === 'select') {
      const selectedOption = currentQuestion.options.find(
        (opt) => opt.value === e.target.value
      );
      response = {
        value: selectedOption.value,
        displayText: selectedOption.label,
      };
    } else {
      response = e.target.elements.response.value;
    }

    if (!response || (typeof response === 'string' && !response.trim())) {
      return; // Don't process empty responses
    }

    handleResponse(response);

    // Reset form
    if (currentQuestion.type !== 'select') {
      e.target.reset();
    }
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const resetChat = () => {
    setCurrentStep(0);
    setUserResponses({
      height: '',
      weight: '',
      bodyType: '',
      fitPreference: '',
    });
    setRecommendedSize(null);
    setMessages([
      {
        type: 'bot',
        text: `Hi there! I can help you find the perfect ${
          productType || 'item'
        } size.`,
      },
    ]);
    setTimeout(() => {
      addBotMessage(questions[0].text);
    }, 500);
  };

  const selectRecommendedSize = () => {
    // Inform parent about selection
    if (recommendedSize) {
      onRecommendationComplete({
        ...recommendedSize,
        selected: true,
      });
      addBotMessage(`Great! Size ${recommendedSize.size} has been selected.`);
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    }
  };

  // Size recommendation algorithm
  const calculateSizeRecommendation = (data, productType) => {
    // Extract and normalize height
    let heightInInches;
    if (data.height.includes('cm')) {
      // Convert cm to inches
      heightInInches = parseFloat(data.height) / 2.54;
    } else {
      // Parse height like 5'10" or convert direct inch value
      if (data.height.includes("'")) {
        const parts = data.height.split("'");
        const feet = parseFloat(parts[0]);
        const inches = parseFloat(parts[1].replace('"', ''));
        heightInInches = feet * 12 + inches;
      } else {
        heightInInches = parseFloat(data.height);
      }
    }

    // Extract and normalize weight
    let weightInLbs;
    if (data.weight.includes('kg')) {
      // Convert kg to pounds
      weightInLbs = parseFloat(data.weight) * 2.205;
    } else {
      weightInLbs = parseFloat(data.weight);
    }

    let size = '';
    let notes = '';

    // Basic size calculation based on height, weight, body type and fit preference
    if (productType === 'Suits' || productType === 'Jackets') {
      // Chest size approximation (very simplified)
      let baseSize = Math.round(
        (heightInInches * 0.5 + weightInLbs * 0.15) / 2
      );

      // Adjust for body type
      switch (data.bodyType) {
        case 'slim':
          baseSize -= 1;
          break;
        case 'muscular':
          baseSize += 1;
          break;
        case 'full':
          baseSize += 2;
          break;
        default:
          break;
      }

      // Adjust for fit preference
      switch (data.fitPreference) {
        case 'slim':
          notes = 'For a truly slim fit, consider tailoring.';
          break;
        case 'regular':
          baseSize += 1;
          break;
        case 'relaxed':
          baseSize += 2;
          notes = 'For a more comfortable fit.';
          break;
        default:
          break;
      }

      size = `${baseSize}`;
    } else if (productType === 'Shoes') {
      // Shoe size approximation (very simplified)
      let baseSize = Math.round(heightInInches * 0.15);

      // Slight adjustment based on weight for width considerations
      let width = 'Medium';
      if (weightInLbs / heightInInches > 2.5) {
        width = 'Wide';
        notes = 'You might prefer a wide fit for more comfort.';
      } else if (weightInLbs / heightInInches < 1.7) {
        width = 'Narrow';
        notes =
          'Regular fit should work, but you could try narrow styles if available.';
      }

      size = `${baseSize} (${width})`;
    } else {
      // Generic clothing
      let sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      let index = 2; // Start with Medium

      // Basic height adjustment
      if (heightInInches < 64) index = 0;
      else if (heightInInches < 67) index = 1;
      else if (heightInInches < 70) index = 2;
      else if (heightInInches < 73) index = 3;
      else if (heightInInches < 76) index = 4;
      else index = 5;

      // Weight adjustments
      let bmi = (weightInLbs * 703) / (heightInInches * heightInInches);
      if (bmi < 18.5) index = Math.max(0, index - 1);
      else if (bmi > 25) index = Math.min(5, index + 1);
      if (bmi > 30) index = Math.min(5, index + 1);

      // Fit preference adjustments
      if (data.fitPreference === 'slim') index = Math.max(0, index - 1);
      if (data.fitPreference === 'relaxed') index = Math.min(5, index + 1);

      size = sizes[index];
      notes = bmi > 30 ? 'Consider size up for more comfort.' : '';
    }

    return {
      size,
      notes,
      heightUsed: `${Math.round(heightInInches)}in`,
      weightUsed: `${Math.round(weightInLbs)}lbs`,
      bodyType: data.bodyType,
      fitPreference: data.fitPreference,
    };
  };

  // Adjust sizing
  const getNextSize = (currentSize) => {
    // Simplified just as an example
    const sizes = {
      Suits: ['36', '38', '40', '42', '44', '46', '48', '50'],
      Shoes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
      default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    };

    const sizeList = sizes[productType] || sizes.default;
    const currentIndex = sizeList.indexOf(currentSize);
    if (currentIndex < sizeList.length - 1) {
      return sizeList[currentIndex + 1];
    }
    return currentSize;
  };

  const getPrevSize = (currentSize) => {
    const sizes = {
      Suits: ['36', '38', '40', '42', '44', '46', '48', '50'],
      Shoes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
      default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    };

    const sizeList = sizes[productType] || sizes.default;
    const currentIndex = sizeList.indexOf(currentSize);
    if (currentIndex > 0) {
      return sizeList[currentIndex - 1];
    }
    return currentSize;
  };

  if (!open) return null;

  return (
    <div
      className='chatbot-container'
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1050,
        width: minimized ? '300px' : '350px',
        maxWidth: '90vw',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        borderRadius: '12px',
      }}
    >
      {/* Chatbot Header */}
      <div
        className='chat-header'
        style={{
          backgroundColor: '#003b5c',
          color: 'white',
          padding: '15px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={toggleMinimize}
      >
        <div className='d-flex align-items-center'>
          <FaRobot className='me-2' size={18} />
          <h5 className='mb-0'>Size Assistant</h5>
          {isTyping && (
            <Badge
              bg='light'
              text='dark'
              pill
              className='ms-2 typing-indicator'
            >
              typing...
            </Badge>
          )}
        </div>
        <div className='d-flex'>
          <Button
            variant='link'
            className='p-0 text-white'
            onClick={(e) => {
              e.stopPropagation();
              resetChat();
            }}
            title='Reset Chat'
          >
            <FaRegSmile size={18} />
          </Button>
          <Button
            variant='link'
            className='p-0 ms-2 text-white'
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
          >
            <FaChevronDown
              size={18}
              style={{
                transform: minimized ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            />
          </Button>
          <Button
            variant='link'
            className='p-0 ms-2 text-white'
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <FaTimes size={18} />
          </Button>
        </div>
      </div>

      {/* Chatbot Body - Show only if not minimized */}
      {!minimized && (
        <>
          <div
            className='chat-messages'
            style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              height: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.type === 'bot' ? 'bot' : 'user'}`}
                style={{
                  alignSelf: msg.type === 'bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  marginBottom: '10px',
                  animation: `fadeIn 0.3s ease ${idx * 0.1}s both`,
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.type === 'bot' ? 'white' : '#003b5c',
                    color: msg.type === 'bot' ? '#212529' : 'white',
                    padding: '10px 15px',
                    borderRadius:
                      msg.type === 'bot'
                        ? '0 12px 12px 12px'
                        : '12px 0 12px 12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    border: msg.type === 'bot' ? '1px solid #e9ecef' : 'none',
                  }}
                >
                  {msg.type === 'bot' && (
                    <div
                      className='bot-icon'
                      style={{ position: 'absolute', left: '-24px', top: '0' }}
                    >
                      <FaRobot
                        size={16}
                        style={{
                          backgroundColor: '#003b5c',
                          color: 'white',
                          padding: '4px',
                          borderRadius: '50%',
                        }}
                      />
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                className='message bot'
                style={{ alignSelf: 'flex-start', marginBottom: '10px' }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '10px 15px',
                    borderRadius: '0 12px 12px 12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <span className='typing-animation'>
                    <span className='dot'></span>
                    <span className='dot'></span>
                    <span className='dot'></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chatbot Input */}
          <div
            className='chat-input'
            style={{
              padding: '15px',
              borderTop: '1px solid #e9ecef',
              backgroundColor: 'white',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
            }}
          >
            <Form onSubmit={handleSubmit}>
              {currentStep < questions.length ? (
                <>
                  {questions[currentStep].type === 'select' ? (
                    <Form.Select
                      name='response'
                      className='mb-2'
                      defaultValue=''
                      ref={inputRef}
                      style={{
                        borderRadius: '50px',
                        padding: '10px 15px',
                        border: '1px solid #ced4da',
                      }}
                    >
                      <option value='' disabled>
                        Select an option
                      </option>
                      {questions[currentStep].options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type='text'
                      name='response'
                      placeholder={questions[currentStep].placeholder}
                      ref={inputRef}
                      style={{
                        borderRadius: '50px',
                        padding: '10px 15px',
                        paddingRight: '50px',
                      }}
                    />
                  )}
                  <Button
                    type='submit'
                    style={{
                      position: 'absolute',
                      right: '25px',
                      bottom: '25px',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#003b5c',
                      border: 'none',
                    }}
                  >
                    <FaPaperPlane />
                  </Button>
                </>
              ) : recommendedSize ? (
                <div className='d-flex justify-content-between'>
                  <Button
                    variant='outline-secondary'
                    onClick={resetChat}
                    className='me-2'
                  >
                    Try Again
                  </Button>
                  <Button
                    variant='primary'
                    onClick={selectRecommendedSize}
                    style={{ backgroundColor: '#003b5c', border: 'none' }}
                  >
                    <FaRegCheckCircle className='me-2' />
                    Select {recommendedSize.size}
                  </Button>
                </div>
              ) : null}
            </Form>
          </div>
        </>
      )}

      <style jsx='true'>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .typing-animation .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #adb5bd;
          border-radius: 50%;
          margin-right: 3px;
          animation: bounce 1.5s infinite ease-in-out;
        }
        .typing-animation .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-animation .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-animation .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-5px);
          }
        }
        .typing-indicator {
          display: inline-block;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default SizeRecommenderChatbot;
