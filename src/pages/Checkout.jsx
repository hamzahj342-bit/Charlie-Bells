import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CreditCard, MapPin, RefreshCw, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import SideDrawer from '../components/SideDrawer';
import StripeCardSection from '../components/StripeCardSection';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/Checkout.css';

const TAX_RATE = 0.083;
const PENDING_ORDER_KEY = 'pendingStripeOrder';
// After this many failures we nudge the customer towards another card/support.
const RETRY_HINT_AFTER = 3;
// Stripe leaves the intent unusable in these cases, so a fresh one is needed.
const INTENT_UNUSABLE_STATES = ['succeeded', 'canceled', 'processing'];
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
// Do not call loadStripe() at module scope — App eagerly imports routes and that
// would inject Stripe Link's floating badge on every page, including the homepage.

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#ecc66d',
    colorBackground: '#231815',
    colorText: '#f8fafc',
    colorDanger: '#ef4444',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

const Checkout = () => {
  const {
    items,
    shippingMethod,
    getShippingCost,
    getCartTotal,
    clearCart
  } = useCart();
  
  const navigate = useNavigate();
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [intentError, setIntentError] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [paidTransactionId, setPaidTransactionId] = useState('');
  const [intentNonce, setIntentNonce] = useState(0);
  const stripeRef = useRef({ stripe: null, elements: null });
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const subtotal = getCartTotal();
  const shipping = getShippingCost(subtotal, shippingMethod);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shipping;
  const cartFingerprint = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}`).join('|'),
    [items]
  );

  const handleStripeReady = useCallback((ctx) => {
    stripeRef.current = ctx;
  }, []);

  const buildOrderPayload = useCallback((overrides = {}) => ({
    status: 'pending',
    subtotal,
    tax_amount: tax,
    shipping_amount: shipping,
    total_amount: total,
    shipping_address: shippingInfo,
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: parseFloat(item.price),
      selected_size: item.selected_size || null
    })),
    payment_method: 'stripe',
    ...overrides
  }), [items, shipping, shippingInfo, subtotal, tax, total]);

  const submitOrder = useCallback(async (payload) => {
    await themeApi.createOrder(payload);
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    toast.success('Order placed successfully!');
    clearCart();
    setOrderPlaced(true);
    navigate('/checkout', { replace: true });
  }, [clearCart, navigate]);

  const logPaymentAttempt = useCallback(async ({ intentId, attempt, message }) => {
    if (!intentId) return;
    try {
      await themeApi.logPaymentAttempt({
        payment_intent_id: intentId,
        attempt_number: attempt,
        customer_email: shippingInfo.email || null,
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim() || null,
        customer_phone: shippingInfo.phone || null,
        error_message: message || null
      });
    } catch (logError) {
      console.error('Unable to record payment attempt:', logError);
    }
  }, [shippingInfo.email, shippingInfo.firstName, shippingInfo.lastName, shippingInfo.phone]);

  useEffect(() => {
    if (items.length === 0) {
      setClientSecret('');
      setPaymentIntentId('');
      return;
    }

    let cancelled = false;
    const createIntent = async () => {
      try {
        setIntentError('');
        const data = await themeApi.createPaymentIntent({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            selected_size: item.selected_size || null
          }))
        });
        if (!cancelled) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId || '');
        }
      } catch (error) {
        if (!cancelled) {
          setClientSecret('');
          setPaymentIntentId('');
          setIntentError(error.response?.data?.error || 'Unable to start Stripe payment.');
        }
      }
    };

    createIntent();
    return () => {
      cancelled = true;
    };
  }, [cartFingerprint, items, intentNonce]);

  const refreshPaymentIntent = useCallback(() => {
    setClientSecret('');
    setPaymentIntentId('');
    setIntentNonce((nonce) => nonce + 1);
  }, []);

  const handleRetryPayment = useCallback(async () => {
    // Payment already captured: retry only the order creation, never the charge.
    if (paymentError?.isOrderFailure && paidTransactionId) {
      setIsSubmitting(true);
      setPaymentError(null);
      try {
        const pendingRaw = sessionStorage.getItem(PENDING_ORDER_KEY);
        const payload = pendingRaw ? JSON.parse(pendingRaw) : buildOrderPayload();
        await submitOrder({ ...payload, payment_method: 'stripe', transaction_id: paidTransactionId });
      } catch (error) {
        const message = error.response?.data?.error || 'Could not save the order. Please contact support with your payment reference.';
        setPaymentError({ message, isOrderFailure: true, needsFreshIntent: false });
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const needsFreshIntent = paymentError?.needsFreshIntent;
    setPaymentError(null);
    if (needsFreshIntent) {
      refreshPaymentIntent();
      setCurrentStep(2);
      toast('Payment form reset. Please re-enter your card details.', { icon: '🔄' });
    }
  }, [buildOrderPayload, paidTransactionId, paymentError, refreshPaymentIntent, submitOrder]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    if (!paymentIntentId) return;

    const finishRedirectedPayment = async () => {
      const pendingRaw = sessionStorage.getItem(PENDING_ORDER_KEY);

      if (redirectStatus && redirectStatus !== 'succeeded') {
        await logPaymentAttempt({
          intentId: paymentIntentId,
          attempt: null,
          message: `Redirect returned with status ${redirectStatus}`
        });
        setPaymentError({
          message: 'Your payment was not completed. You can try again with the same or a different card.',
          needsFreshIntent: true
        });
        setAttemptCount((count) => count + 1);
        return;
      }

      if (!pendingRaw || redirectStatus !== 'succeeded') return;
      try {
        setIsSubmitting(true);
        const pending = JSON.parse(pendingRaw);
        await submitOrder({
          ...pending,
          payment_method: 'stripe',
          transaction_id: paymentIntentId
        });
      } catch (error) {
        await logPaymentAttempt({
          intentId: paymentIntentId,
          attempt: null,
          message: `Order creation failed after redirect: ${error.response?.data?.error || error.message}`
        });
        const message = error.response?.data?.error || 'Payment succeeded, but creating the order failed. You can retry saving it.';
        setPaidTransactionId(paymentIntentId);
        setPaymentError({ message, isOrderFailure: true, needsFreshIntent: false });
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    };

    finishRedirectedPayment();
  }, [submitOrder, logPaymentAttempt]);

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.filter((field) => !String(shippingInfo[field] || '').trim());
    
    if (missing.length > 0) {
      const fieldNames = {
        firstName: 'First Name',
        lastName: 'Last Name', 
        email: 'Email',
        phone: 'Phone Number',
        address: 'Shipping Address',
        city: 'City',
        state: 'State',
        zipCode: 'ZIP Code'
      };
      
      const missingFields = missing.map((field) => fieldNames[field]).join(', ');
      toast.error(`Please fill in: ${missingFields}`);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const phoneDigits = shippingInfo.phone.replace(/\D/g, '');
    const normalizedPhone = phoneDigits.length === 11 && phoneDigits.startsWith('1')
      ? phoneDigits.slice(1)
      : phoneDigits;
    if (normalizedPhone.length !== 10) {
      toast.error('Please enter a valid US phone number');
      return false;
    }

    if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zipCode.trim())) {
      toast.error('Please enter a valid US ZIP code');
      return false;
    }
    
    return true;
  };

  const validatePaymentInfo = () => {
    if (!stripePublishableKey) {
      toast.error('Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to Frontend/.env');
      return false;
    }
    if (intentError) {
      toast.error(intentError);
      return false;
    }
    if (!clientSecret) {
      toast.error('Payment form is still loading. Please wait a moment.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateShippingInfo()) {
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validatePaymentInfo()) {
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const attempt = attemptCount + 1;
    setAttemptCount(attempt);
    setPaymentError(null);
    try {
      const { stripe, elements } = stripeRef.current;
      if (!stripe || !elements) {
        toast.error('Payment form is still loading. Please go back to Payment.');
        return;
      }

      const orderPayload = buildOrderPayload();
      sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(orderPayload));

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          payment_method_data: {
            billing_details: {
              name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postal_code: shippingInfo.zipCode,
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      const attemptedIntentId = paymentIntent?.id || error?.payment_intent?.id || paymentIntentId;

      if (error) {
        const failedMessage = error.message || 'Payment failed. Please try again.';
        const needsFreshIntent =
          INTENT_UNUSABLE_STATES.includes(error.payment_intent?.status) ||
          error.code === 'payment_intent_unexpected_state';

        await logPaymentAttempt({ intentId: attemptedIntentId, attempt, message: failedMessage });
        setPaymentError({ message: failedMessage, code: error.code || null, needsFreshIntent });
        toast.error(failedMessage);
        return;
      }

      if (paymentIntent?.status !== 'succeeded') {
        const pendingMessage = paymentIntent?.status === 'processing'
          ? 'Your payment is still processing. We will email you once it clears.'
          : 'Payment was not completed. Please try again.';

        await logPaymentAttempt({ intentId: attemptedIntentId, attempt, message: pendingMessage });
        setPaymentError({
          message: pendingMessage,
          needsFreshIntent: paymentIntent?.status !== 'requires_payment_method'
        });
        toast.error(pendingMessage);
        return;
      }

      setPaidTransactionId(paymentIntent.id);

      try {
        await submitOrder({
          ...orderPayload,
          transaction_id: paymentIntent.id,
        });
      } catch (orderError) {
        const message = orderError.response?.data?.error || 'Payment went through but the order could not be saved. Our team has been notified.';
        await logPaymentAttempt({
          intentId: paymentIntent.id,
          attempt,
          message: `Order creation failed: ${orderError.response?.data?.error || orderError.message}`
        });
        setPaymentError({ message, isOrderFailure: true, needsFreshIntent: false });
        toast.error(message);
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to place order.';
      setPaymentError({ message, needsFreshIntent: false });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentLabel = 'Card (Stripe)';

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Check }
  ];

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="ch-checkout-page-wrapper">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <div className="container text-center py-5">
          <div className="ch-industrial-card py-5">
            <ShoppingBag className="w-20 h-20 mx-auto text-muted mb-4 opacity-20" size={60} />
            <h1 className="ch-industrial-title">Your Cart is Empty</h1>
            <p className="text-muted mb-4">Add essential chemical and cleaning products to your cart before checkout.</p>
            <Link to="/all-products" className="ch-btn-gold">Continue Shopping</Link>
          </div>
        </div>
        <ThemeFooter />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="ch-checkout-page-wrapper">
        <div className="container text-center py-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ch-success-card">
            <div className="ch-success-icon-wrap">
              <Check className="text-white" size={40} />
            </div>
            <h1 className="ch-industrial-title mt-4">Order Confirmed!</h1>
            <p className="text-muted mb-5">Your order has been received and is being processed.</p>
            <Link to="/" className="ch-btn-gold">Back to Home</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-checkout-page-wrapper">
      <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
      
      <div className="container py-5">
        <div className="ch-stepper-container mb-5">
          {steps.map((step, index) => (
            <div key={step.id} className={`ch-step-item-new ${currentStep >= step.id ? 'active' : ''}`}>
              <div className="ch-step-circle">
                {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
              </div>
              <span className="ch-step-label">{step.name}</span>
              {index < steps.length - 1 && <div className="ch-step-connector" />}
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className={currentStep === 1 ? '' : 'd-none'}>
                <motion.div key="ship" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="ch-industrial-card">
                  <h1 className="ch-industrial-title mb-4">Secure Checkout</h1>
                  <h3 className="ch-section-title"><MapPin size={20} className="me-2 ch-text-gold"/> Shipping Details</h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">First Name</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.firstName} onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})} placeholder="Jane" />
                    </div>
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">Last Name</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.lastName} onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})} placeholder="Doe" />
                    </div>
                    <div className="col-md-12">
                      <label className="ch-form-label-ind">Street Address</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} placeholder="123 Main Street, Apt 4" />
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">City</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.city} onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} placeholder="Los Angeles" />
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">State</label>
                      <select className="ch-form-control-ind ch-state-select" value={shippingInfo.state} onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}>
                        <option value="">Select state</option>
                        {US_STATES.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">ZIP Code</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.zipCode} onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})} placeholder="90001" />
                    </div>
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">Phone</label>
                      <input type="tel" className="ch-form-control-ind" value={shippingInfo.phone} onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} placeholder="(555) 123-4567" />
                    </div>
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">Email</label>
                      <input type="email" className="ch-form-control-ind" value={shippingInfo.email} onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="text-end mt-4">
                    <button className="ch-btn-gold w-100 w-md-auto" onClick={handleNextStep}>Continue to Payment <ArrowRight size={18} className="ms-2"/></button>
                  </div>
                </motion.div>
            </div>

            <div className={currentStep === 2 ? '' : 'd-none'}>
                <motion.div key="pay" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="ch-industrial-card">
                  <h3 className="ch-section-title"><CreditCard size={20} className="me-2 ch-text-gold"/> Payment Method</h3>
                  <div className="ch-payment-grid mb-4">
                    <div className="ch-payment-option active">
                      <div className="ch-option-check"></div>
                      <CreditCard size={22} className="mb-2 ch-text-gold" />
                      <span>Card / Wallet</span>
                    </div>
                  </div>

                  <div className="ch-payment-details-box">
                    {!stripePublishableKey && (
                      <p className="mb-0">Add <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> to Frontend/.env, then restart the frontend.</p>
                    )}
                    {stripePublishableKey && intentError && (
                      <p className="ch-payment-error mb-0">{intentError}</p>
                    )}
                    {stripePublishableKey && !intentError && !clientSecret && (
                      <p className="mb-0">Loading secure payment form...</p>
                    )}
                    {clientSecret && stripePromise && (
                      <Elements
                        key={clientSecret}
                        stripe={stripePromise}
                        options={{ clientSecret, appearance: stripeAppearance }}
                      >
                        <StripeCardSection onReady={handleStripeReady} />
                      </Elements>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button className="ch-btn-outline-ind" onClick={() => setCurrentStep(1)}><ArrowLeft size={18} className="me-2"/> Back</button>
                    <button className="ch-btn-gold" onClick={handleNextStep}>Review Order <ArrowRight size={18} className="ms-2"/></button>
                  </div>
                </motion.div>
            </div>

            <div className={currentStep === 3 ? '' : 'd-none'}>
                <motion.div key="rev" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="ch-industrial-card">
                  <h3 className="ch-section-title"><ShieldCheck size={20} className="me-2 ch-text-gold"/> Review & Confirm</h3>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Deliver to:</span>
                      <span className="fw-bold text-end">{shippingInfo.firstName} {shippingInfo.lastName}, {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Payment via:</span>
                      <span className="fw-bold">{paymentLabel}</span>
                    </div>
                  </div>
                  {paymentError && (
                    <div className="ch-payment-retry-box">
                      <div className="d-flex align-items-start gap-2">
                        <AlertTriangle size={18} className="ch-retry-icon" />
                        <div>
                          <p className="ch-retry-title mb-1">
                            {paymentError.isOrderFailure ? 'Payment received, order not saved' : `Payment failed${attemptCount > 1 ? ` (attempt ${attemptCount})` : ''}`}
                          </p>
                          <p className="ch-retry-message mb-0">{paymentError.message}</p>
                          {!paymentError.isOrderFailure && attemptCount >= RETRY_HINT_AFTER && (
                            <p className="ch-retry-message mb-0 mt-2">
                              Multiple attempts have failed. Try a different card or wallet, or contact your bank.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <button className="ch-btn-gold" onClick={handleRetryPayment} disabled={isSubmitting}>
                          <RefreshCw size={16} className="me-2" />
                          {paymentError.isOrderFailure ? 'Retry Saving Order' : 'Retry Payment'}
                        </button>
                        {!paymentError.isOrderFailure && (
                          <button className="ch-btn-outline-ind" onClick={() => setCurrentStep(2)} disabled={isSubmitting}>
                            Use a different card
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    <button className="ch-btn-outline-ind" onClick={() => setCurrentStep(2)}><ArrowLeft size={18} className="me-2"/> Back</button>
                    <button
                      className="ch-btn-gold px-5"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || (paymentError?.isOrderFailure ?? false)}
                    >
                      {isSubmitting
                        ? 'Processing...'
                        : paymentError
                          ? `Try Again - $${total.toFixed(2)}`
                          : `Pay $${total.toFixed(2)}`}
                    </button>
                  </div>
                </motion.div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="ch-order-sidebar sticky-top" style={{ top: '20px' }}>
              <h4 className="ch-sidebar-title">Order Summary</h4>
              <div className="mb-4">
                {items.map((item) => (
                  <div key={item.id} className="ch-summary-item">
                    <img src={item.image_url || '/placeholder.png'} alt="" className="ch-item-thumb" />
                    <div className="flex-grow-1">
                      <p className="ch-item-name">{item.name}</p>
                      <p className="ch-item-qty">Qty: {item.quantity} x ${Number(item.price).toFixed(2)}</p>
                    </div>
                    <span className="fw-bold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="ch-cost-breakdown">
                <div className="ch-cost-line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="ch-cost-line"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="ch-cost-line"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="ch-cost-line total"><span>Total Amount</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 border-top pt-3 opacity-75">
                <div className="d-flex align-items-center gap-2 mb-2"><Zap size={14} className="ch-text-gold" /> <small>Secure Stripe Encryption</small></div>
                <div className="d-flex align-items-center gap-2"><ShieldCheck size={14} className="ch-text-gold" /> <small>Quality Guaranteed</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeFooter />
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
    </div>
  );
};

export default Checkout;
