import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaChevronDown,
  FaRegCheckCircle,
  FaRuler,
  FaTshirt,
  FaExchangeAlt,
} from 'react-icons/fa';

const CustomizationChatbot = ({
  onCustomizationComplete,
  open,
  setOpen,
  initialCustomizations,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userResponses, setUserResponses] = useState({
    pantsLength: '',
    waist: '',
    taper: '',
    cuff: '',
    sleeves: '',
    chest: '',
    shoulders: '',
    additionalNotes: '',
  });
  const [customizationData, setCustomizationData] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I can help you customize your suit for the perfect fit.',
    },
  ]);
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-fill user responses if editing existing customization
  useEffect(() => {
    if (initialCustomizations) {
      try {
        setUserResponses({
          pantsLength: initialCustomizations.pants?.length || '',
          waist: initialCustomizations.pants?.waist || '',
          taper: initialCustomizations.pants?.taper || '',
          cuff: initialCustomizations.pants?.cuff || '',
          sleeves: initialCustomizations.measurements?.sleeve || '',
          chest: initialCustomizations.measurements?.chest || '',
          shoulders: initialCustomizations.measurements?.shoulder || '',
          additionalNotes: initialCustomizations.additionalNotes || '',
        });
      } catch (err) {
        console.error('Error initializing customization data:', err);
        setError('Failed to load previous customization data');
      }
    }
  }, [initialCustomizations]);

  const questions = [
    {
      id: 'pantsLength',
      text: 'How much do you want to adjust the pants length? (in inches, positive to shorten, negative to lengthen)',
      type: 'text',
      placeholder: 'e.g., 1.5 or -1.0',
      section: 'pants',
    },
    {
      id: 'waist',
      text: 'How much do you want to adjust the waist? (in inches, positive to take in, negative to let out)',
      type: 'text',
      placeholder: 'e.g., 1.0 or -0.5',
      section: 'pants',
    },
    {
      id: 'taper',
      text: 'Would you like to taper the pant legs?',
      type: 'select',
      options: [
        { value: 'No', label: 'No tapering' },
        { value: 'Yes', label: 'Yes, taper for a slimmer fit' },
      ],
      section: 'pants',
    },
    {
      id: 'cuff',
      text: 'What type of cuff do you prefer?',
      type: 'select',
      options: [
        { value: 'None', label: 'No cuff (plain hem)' },
        { value: 'Single', label: 'Single cuff' },
        { value: 'Double', label: 'Double cuff' },
      ],
      section: 'pants',
    },
    {
      id: 'sleeves',
      text: 'How much do you want to adjust the jacket sleeve length? (in inches, positive to shorten, negative to lengthen)',
      type: 'text',
      placeholder: 'e.g., 0.5 or -0.75',
      section: 'measurements',
    },
    {
      id: 'chest',
      text: 'Do you need any adjustments to the chest? (in inches, positive to take in, negative to let out)',
      type: 'text',
      placeholder: 'e.g., 1.0 or leave blank if no adjustment needed',
      section: 'measurements',
      optional: true,
    },
    {
      id: 'shoulders',
      text: 'Do you need any adjustments to the shoulders? (in inches, specify adjustment)',
      type: 'text',
      placeholder: 'Leave blank if no adjustment needed',
      section: 'measurements',
      optional: true,
    },
    {
      id: 'additionalNotes',
      text: 'Any additional notes or specific requests for your alterations?',
      type: 'textarea',
      placeholder: 'Add any special instructions here...',
      optional: true,
    },
  ];

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      try {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
      } catch (error) {
        console.error('Failed to focus input element:', error);
      }
    }
  }, [open, currentStep]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    try {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to scroll to bottom:', error);
    }
  }, [messages]);

  // Start the conversation when chat opens
  useEffect(() => {
    try {
      if (open && currentStep === 0 && messages.length === 1) {
        setTimeout(() => {
          if (questions && questions.length > 0) {
            addBotMessage(
              "Let's start by customizing your pants. " + questions[0].text
            );
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      addBotMessage(
        "I'm having trouble starting our conversation. Please try again later."
      );
    }
  }, [open, currentStep, messages.length, questions]);

  // Add bot typing effect
  const addBotMessage = (text) => {
    try {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'bot', text }]);
        setIsTyping(false);
      }, 800); // Simulate typing delay
    } catch (error) {
      console.error('Failed to add bot message:', error);
      setError('Failed to process message. Please refresh and try again.');
    }
  };

  // Process user response and move to next step
  const handleResponse = (response) => {
    try {
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
          try {
            // Add transitions between sections
            const currentQuestion = questions[currentStep];
            const nextQuestion = questions[currentStep + 1];

            if (
              currentQuestion.section !== nextQuestion.section &&
              nextQuestion.section === 'measurements'
            ) {
              addBotMessage("Great! Now let's customize your jacket.");
              setTimeout(() => {
                addBotMessage(nextQuestion.text);
              }, 800);
            } else {
              addBotMessage(nextQuestion.text);
            }

            setCurrentStep((prev) => prev + 1);
          } catch (error) {
            console.error('Failed to process next question:', error);
            addBotMessage(
              "I'm having trouble with the next question. Let's try to continue."
            );
            setCurrentStep((prev) => Math.min(prev + 1, questions.length - 1));
          }
        }, 500);
      } else {
        // Calculate customization data
        setTimeout(() => {
          try {
            const customizationData = prepareCustomizationData(userResponses);
            setCustomizationData(customizationData);

            // Show summary
            addBotMessage("Here's a summary of your customization:");

            // Pants summary
            let pantsSummary = 'Pants: ';
            if (userResponses.pantsLength)
              pantsSummary += `Length ${
                userResponses.pantsLength > 0 ? 'shortened' : 'lengthened'
              } by ${Math.abs(userResponses.pantsLength)}″, `;
            if (userResponses.waist)
              pantsSummary += `Waist ${
                userResponses.waist > 0 ? 'taken in' : 'let out'
              } by ${Math.abs(userResponses.waist)}″, `;
            if (userResponses.taper === 'Yes') pantsSummary += `Tapered legs, `;
            if (userResponses.cuff !== 'None')
              pantsSummary += `${userResponses.cuff} cuff, `;
            pantsSummary = pantsSummary.endsWith(', ')
              ? pantsSummary.slice(0, -2)
              : pantsSummary;
            addBotMessage(pantsSummary);

            // Jacket summary
            let jacketSummary = 'Jacket: ';
            if (userResponses.sleeves)
              jacketSummary += `Sleeves ${
                userResponses.sleeves > 0 ? 'shortened' : 'lengthened'
              } by ${Math.abs(userResponses.sleeves)}″, `;
            if (userResponses.chest)
              jacketSummary += `Chest ${
                userResponses.chest > 0 ? 'taken in' : 'let out'
              } by ${Math.abs(userResponses.chest)}″, `;
            if (userResponses.shoulders)
              jacketSummary += `Shoulders adjusted by ${userResponses.shoulders}″, `;
            jacketSummary = jacketSummary.endsWith(', ')
              ? jacketSummary.slice(0, -2)
              : jacketSummary;
            if (jacketSummary !== 'Jacket: ') {
              addBotMessage(jacketSummary);
            }

            // Notes and pricing
            addBotMessage(
              `Alteration Price: $${customizationData.customizationPrice}`
            );

            addBotMessage(
              `Note: Altered orders are not subject to return, but you'll receive free alterations in our stores.`
            );

            // Finish
            addBotMessage(
              'Would you like to save these customizations? Click "Save" to continue.'
            );
          } catch (error) {
            console.error('Failed to calculate customization data:', error);
            addBotMessage(
              "I'm having trouble calculating your customization. Let's try to save what we have so far."
            );
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to handle user response:', error);
      addBotMessage(
        "I'm having trouble processing your response. Let's try to continue."
      );
    }
  };

  const prepareCustomizationData = (responses) => {
    try {
      // Calculate price based on customizations
      // $15 for pant length, $20 for waist, $25 for taper, $10 for cuff
      // $20 for sleeves, $30 for chest, $30 for shoulders
      let price = 0;
      if (responses.pantsLength && responses.pantsLength !== '0') price += 15;
      if (responses.waist && responses.waist !== '0') price += 20;
      if (responses.taper === 'Yes') price += 25;
      if (responses.cuff !== 'None') price += 10;
      if (responses.sleeves && responses.sleeves !== '0') price += 20;
      if (responses.chest && responses.chest !== '0') price += 30;
      if (responses.shoulders && responses.shoulders !== '0') price += 30;

      // Format the customization data
      const customizationData = {
        pants: {
          length: responses.pantsLength || '',
          waist: responses.waist || '',
          taper: responses.taper || 'No',
          cuff: responses.cuff || 'None',
          fit: 'Standard', // Default value
        },
        measurements: {
          sleeve: responses.sleeves || '',
          chest: responses.chest || '',
          shoulder: responses.shoulders || '',
          waist: responses.waist || '',
          inseam: '',
          outseam: '',
          neck: '',
          backLength: '',
        },
        additionalNotes: responses.additionalNotes || '',
        customizationPrice: price,
      };

      return customizationData;
    } catch (error) {
      console.error('Failed to prepare customization data:', error);
      // Return a default empty customization with minimal pricing
      return {
        pants: { length: '', waist: '', taper: 'No', cuff: 'None' },
        measurements: {},
        additionalNotes: 'Error occurred during customization',
        customizationPrice: 0,
      };
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    try {
      const currentQuestion = questions[currentStep];
      if (!currentQuestion) return;

      const input = inputRef.current;
      if (!input) return;

      const value = input.value.trim();

      // Skip optional questions if empty
      if (currentQuestion.optional && value === '') {
        handleResponse('');
        return;
      }

      // Validate numeric inputs
      if (
        ['pantsLength', 'waist', 'sleeves', 'chest', 'shoulders'].includes(
          currentQuestion.id
        ) &&
        value !== ''
      ) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          addBotMessage('Please enter a valid number (e.g., 1.5 or -1.0)');
          return;
        }
      }

      handleResponse(value);
      input.value = '';
    } catch (error) {
      console.error('Error submitting form:', error);
      addBotMessage(
        'I had trouble processing your input. Could you try again?'
      );
    }
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const resetChat = () => {
    try {
      // Reset state values
      setCurrentStep(0);
      setIsTyping(false);
      setUserResponses({
        pantsLength: '',
        waist: '',
        taper: '',
        cuff: '',
        sleeves: '',
        chest: '',
        shoulders: '',
        additionalNotes: '',
      });
      setCustomizationData(null);
      setMessages([
        {
          type: 'bot',
          text: 'Hello! I can help you customize your suit for the perfect fit.',
        },
      ]);

      // Start conversation again
      setTimeout(() => {
        if (questions && questions.length > 0) {
          addBotMessage(
            "Let's start by customizing your pants. " + questions[0].text
          );
        }
      }, 500);
    } catch (error) {
      console.error('Failed to reset chat:', error);
      setMessages([
        {
          type: 'bot',
          text: 'Hello! I can help you customize your suit for the perfect fit.',
        },
        {
          type: 'bot',
          text: 'I had trouble resetting our conversation. Please close and reopen the chat.',
        },
      ]);
    }
  };

  const saveCustomization = () => {
    try {
      if (typeof onCustomizationComplete === 'function' && customizationData) {
        onCustomizationComplete(customizationData);
        addBotMessage('Great! Your customization has been saved.');

        // Close chat after a delay
        setTimeout(() => {
          if (typeof setOpen === 'function') {
            setOpen(false);
          }
        }, 2000);
      } else {
        console.error('Cannot save customization: missing callback or data');
        addBotMessage(
          "I'm having trouble saving your customization. Please try again."
        );
      }
    } catch (error) {
      console.error('Failed to save customization:', error);
      addBotMessage(
        "I'm having trouble saving your customization. Please try again."
      );
    }
  };

  // If there's an error, show an error message
  if (error) {
    return (
      <div className={`chatbot-container ${open ? 'open' : ''}`}>
        <div className='chatbot-header'>
          <div className='d-flex align-items-center'>
            <FaRobot className='me-2' />
            <span>Customization Assistant</span>
          </div>
          <div>
            <Button
              variant='link'
              className='chatbot-btn p-0 text-white'
              onClick={() => setOpen(false)}
            >
              <FaTimes />
            </Button>
          </div>
        </div>
        <div className='chatbot-body p-3 text-center'>
          <div className='alert alert-danger'>{error}</div>
          <Button
            variant='primary'
            onClick={() => {
              setError(null);
              resetChat();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`chatbot-container ${open ? 'open' : ''} ${
        minimized ? 'minimized' : ''
      }`}
    >
      <div className='chatbot-header'>
        <div className='d-flex align-items-center'>
          <FaRobot className='me-2' />
          <span>Customization Assistant</span>
        </div>
        <div>
          <Button
            variant='link'
            className='chatbot-btn p-0 text-white'
            onClick={toggleMinimize}
          >
            <FaChevronDown />
          </Button>
          <Button
            variant='link'
            className='chatbot-btn p-0 text-white ms-3'
            onClick={() => {
              if (setOpen) setOpen(false);
            }}
          >
            <FaTimes />
          </Button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className='chatbot-body'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type === 'bot' ? 'bot' : 'user'}`}
              >
                {message.type === 'bot' && (
                  <div className='bot-avatar'>
                    <FaRobot />
                  </div>
                )}
                <div className='message-content'>{message.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className='message bot'>
                <div className='bot-avatar'>
                  <FaRobot />
                </div>
                <div className='message-content typing'>
                  <span className='dot'></span>
                  <span className='dot'></span>
                  <span className='dot'></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {currentStep < questions.length && !customizationData ? (
            <div className='chatbot-input'>
              <Form onSubmit={handleSubmit}>
                {questions[currentStep]?.type === 'select' ? (
                  <Form.Select ref={inputRef} className='mb-2'>
                    {questions[currentStep].options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                ) : questions[currentStep]?.type === 'textarea' ? (
                  <Form.Control
                    as='textarea'
                    ref={inputRef}
                    rows={3}
                    placeholder={questions[currentStep].placeholder}
                    className='mb-2'
                  />
                ) : (
                  <Form.Control
                    type='text'
                    ref={inputRef}
                    placeholder={
                      questions[currentStep]?.placeholder ||
                      'Type your answer...'
                    }
                    className='mb-2'
                  />
                )}
                <Button type='submit' className='w-100 send-btn'>
                  <FaPaperPlane className='me-2' />
                  Send
                </Button>
              </Form>
            </div>
          ) : customizationData ? (
            <div className='chatbot-input'>
              <div className='d-flex mb-2'>
                <Button
                  variant='secondary'
                  className='w-50 me-2'
                  onClick={resetChat}
                >
                  <FaExchangeAlt className='me-2' />
                  Start Over
                </Button>
                <Button
                  variant='primary'
                  className='w-50'
                  onClick={saveCustomization}
                >
                  <FaRegCheckCircle className='me-2' />
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default CustomizationChatbot;
