import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import { ArrowLeft, ArrowRight, Check, CreditCard, Truck, MapPin, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import SideDrawer from '../components/SideDrawer';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/Checkout.css';

const TAX_RATE = 0.083;

const Checkout = () => {
  const { websiteLogo } = useLogo();
  const {
    items,
    shippingMethod,
    shippingOptions,
    getShippingCost,
    getCartTotal,
    clearCart
  } = useCart();
  
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', country: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cod', account_holder_name: '', account_number: '', transaction_id: '', payment_screenshot: null
  });

  const subtotal = getCartTotal();
  const shipping = getShippingCost(subtotal, shippingMethod);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shipping;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentInfo({...paymentInfo, payment_screenshot: 'uploading...'});
      try {
        const result = await themeApi.uploadImages([file]);
        const uploadedUrl = result.images?.[0] || result.image_url || result.url;
        setPaymentInfo(prev => ({...prev, payment_screenshot: uploadedUrl}));
        toast.success('Receipt uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload receipt');
        setPaymentInfo(prev => ({...prev, payment_screenshot: null}));
      }
    }
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    const missing = required.filter(field => !shippingInfo[field].trim());
    
    if (missing.length > 0) {
      const fieldNames = {
        firstName: 'First Name',
        lastName: 'Last Name', 
        email: 'Email',
        phone: 'Phone Number',
        address: 'Shipping Address',
        city: 'City'
      };
      
      const missingFields = missing.map(field => fieldNames[field]).join(', ');
      toast.error(`Please fill in: ${missingFields}`);
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^03\d{2}-?\d{7}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error('Please enter a valid phone number (03xx-xxxxxxx)');
      return false;
    }
    
    return true;
  };

  const validatePaymentInfo = () => {
    if (paymentInfo.method !== 'cod') {
      // if (!paymentInfo.transaction_id.trim()) {
      //   toast.error('Please enter transaction ID');
      //   return false;
      // }
      
      if (!paymentInfo.payment_screenshot || paymentInfo.payment_screenshot === 'uploading...') {
        toast.error('Please upload payment receipt');
        return false;
      }
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
    try {
      const orderData = {
        user_id: 1, 
        status: 'pending',
        subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        total_amount: total,
        shipping_address: shippingInfo,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price)
        })),
        payment_method: paymentInfo.method,
        payment_status: paymentInfo.payment_screenshot ? 'paid' : 'pending',
        transaction_id: paymentInfo.transaction_id || null,
        payment_screenshot: paymentInfo.payment_screenshot && paymentInfo.payment_screenshot !== 'uploading...' 
          ? paymentInfo.payment_screenshot 
          : null
      };

      await themeApi.createOrder(orderData);
      toast.success('Order placed successfully!');
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      toast.error('Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* <div className="d-flex justify-content-between align-items-end mb-5">
           <div>
            <Link to="/cart" className="text-decoration-none text-muted mb-2 d-inline-block"><ArrowLeft size={16} /> Back to Cart</Link>
            <h1 className="ch-industrial-title mb-0">Secure Checkout</h1>
          </div> 
          <div className="fw-bold text-muted">Step {currentStep} of 3</div>
        </div> */}

        {/* Professional Stepper */}
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
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="ship" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="ch-industrial-card">
                  <h1 className="ch-industrial-title mb-4">Secure Checkout</h1>
                  <h3 className="ch-section-title"><MapPin size={20} className="me-2 ch-text-gold"/> Shipping Details</h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">First Name</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.firstName} onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})} placeholder="Your Name" />
                    </div>
                    <div className="col-md-6">
                      <label className="ch-form-label-ind">Last Name</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.lastName} onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})} placeholder="Your Surname" />
                    </div>
                    <div className="col-md-12">
                      <label className="ch-form-label-ind">Shipping Address</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} placeholder="Street, Building, Apartment" />
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">City</label>
                      <input type="text" className="ch-form-control-ind" value={shippingInfo.city} onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} placeholder='California'/>
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">Phone</label>
                      <input type="tel" className="ch-form-control-ind" value={shippingInfo.phone} onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} placeholder="03xx-xxxxxxx" />
                    </div>
                    <div className="col-md-4">
                      <label className="ch-form-label-ind">Email</label>
                      <input type="email" className="ch-form-control-ind" value={shippingInfo.email} onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="text-end mt-4">
                    <button className="ch-btn-gold w-100 w-md-auto" onClick={handleNextStep}>Continue to Payment <ArrowRight size={18} className="ms-2"/></button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="pay" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="ch-industrial-card">
                  <h3 className="ch-section-title"><CreditCard size={20} className="me-2 ch-text-gold"/> Payment Method</h3>
                  <div className="ch-payment-grid mb-4">
                    {['cod','jazzcash'].map((method) => (
                      <div key={method} className={`ch-payment-option ${paymentInfo.method === method ? 'active' : ''}`} onClick={() => setPaymentInfo({...paymentInfo, method: method})}>
                        <div className="ch-option-check"></div>
                        <span className="text-capitalize">{method === 'cod' ? 'Cash on Delivery' : method.replace('transfer', ' Transfer')}</span>
                      </div>
                    ))}
                  </div>

                  {paymentInfo.method !== 'cod' && (
                    <div className="ch-payment-details-box animate-fadeIn">
                       <div className="ch-info-row"><span>Account Name:</span> <strong>Charlie Bells</strong></div>
                       <div className="ch-info-row"><span>Account/Phone:</span> <strong>03227594213</strong></div>
                       <hr className="my-3 opacity-10" />
                       <div className="row g-3">
                          <div className="col-md-6">
                            <label className="ch-form-label-ind">Transaction ID</label>
                            <input type="text" className="ch-form-control-ind" placeholder="Enter ID from receipt" onChange={(e) => setPaymentInfo({...paymentInfo, transaction_id: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="ch-form-label-ind">Upload Receipt</label>
                            <input type="file" className="ch-form-control-ind" onChange={handleFileChange} />
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    <button className="ch-btn-outline-ind" onClick={() => setCurrentStep(1)}><ArrowLeft size={18} className="me-2"/> Back</button>
                    <button className="ch-btn-gold" onClick={handleNextStep}>Review Order <ArrowRight size={18} className="ms-2"/></button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="rev" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="ch-industrial-card">
                  <h3 className="ch-section-title"><ShieldCheck size={20} className="me-2 ch-text-gold"/> Review & Confirm</h3>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Deliver to:</span>
                      <span className="fw-bold">{shippingInfo.firstName} {shippingInfo.lastName}, {shippingInfo.address}, {shippingInfo.city}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Payment via:</span>
                      <span className="fw-bold text-capitalize">{paymentInfo.method}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-4">
                    <button className="ch-btn-outline-ind" onClick={() => setCurrentStep(2)}><ArrowLeft size={18} className="me-2"/> Back</button>
                    <button className="ch-btn-gold px-5" onClick={handlePlaceOrder} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Place Final Order'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="col-lg-4">
            <div className="ch-order-sidebar sticky-top" style={{ top: '20px' }}>
              <h4 className="ch-sidebar-title">Order Summary</h4>
              <div className="mb-4">
                {items.map(item => (
                  <div key={item.id} className="ch-summary-item">
                    <img src={item.image_url || '/placeholder.png'} alt="" className="ch-item-thumb" />
                    <div className="flex-grow-1">
                      <p className="ch-item-name">{item.name}</p>
                      <p className="ch-item-qty">Qty: {item.quantity} x ${item.price}</p>
                    </div>
                    <span className="fw-bold">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="ch-cost-breakdown">
                <div className="ch-cost-line"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="ch-cost-line"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="ch-cost-line"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$ ${shipping}`}</span></div>
                <div className="ch-cost-line total"><span>Total Amount</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 border-top pt-3 opacity-75">
                <div className="d-flex align-items-center gap-2 mb-2"><Zap size={14} className="ch-text-gold" /> <small>Secure Encryption</small></div>
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