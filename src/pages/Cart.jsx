import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import SideDrawer from '../components/SideDrawer';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import '../assets/css/Cart.css'; // Make sure this is the main CSS file

const TAX_RATE = 0.083;

const Cart = () => {
  const { 
    items, 
    shippingMethod,
    setShippingMethod,
    shippingOptions,
    freeShippingThreshold,
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsCount,
    getShippingCost,
    clearCart 
  } = useCart();

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  const subtotal = getCartTotal();
  const itemsCount = getCartItemsCount();
  const shippingCost = getShippingCost(subtotal, shippingMethod);
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal + tax + shippingCost);

  if (items.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <div className="container py-5 text-center empty-cart-container">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-cart-circle">
              <ShoppingBag size={80} />
            </div>
            <h1 className="navy-title mt-4">Your Cart is Empty</h1>
            <p className="text-muted mb-5">Explore trusted home care chemical supplies and packaging essentials.</p>
            <Link to="/all-products" className="industrial-btn-primary px-5">
               RETURN TO SHOP
            </Link>
          </motion.div>
        </div>
        <ThemeFooter />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
      
      <div className="container py-5">
        <div className="cart-header-modern mb-4">
          <h2 className="navy-title">Chemical Supply Cart</h2>
          <span className="item-count-badge">{itemsCount} Items Reserved</span>
        </div>

        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="cart-items-card">
              {items.map((item) => (
                <div className="cart-item-row" key={item.id}>
                  <div className="item-img-box">
                    <img src={item.images?.[0] || item.image_url || '/placeholder.png'} alt={item.name} />
                  </div>
                  
                  <div className="item-details">
                    <h5 className="item-name">{item.name}</h5>
                    <p className="item-sku">SKU: IND-{item.id.toString().slice(0,5)}</p>
                    <button className="remove-link" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>

                  <div className="item-qty-control">
                    <div className="qty-stepper">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={16}/></button>
                      <input type="text" value={item.quantity} readOnly />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16}/></button>
                    </div>
                  </div>

                  <div className="item-price-box text-end">
                    <span className="unit-price">${item.price}</span>
                    <h5 className="total-price">${(item.price * item.quantity).toFixed(2)}</h5>
                  </div>
                </div>
              ))}

              <div className="cart-footer-actions">
                <Link to="/all-products" className="btn-continue">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <button className="btn-clear-all" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="order-summary-card">
              <h4 className="summary-title">Order Summary</h4>
              
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
 
              <div className="summary-line vertical">
                <span>Shipping Method</span>
                <select 
                  className="cart-select" 
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  {shippingOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} (${opt.cost})
                    </option>
                  ))}
                </select>
                {subtotal >= freeShippingThreshold && (
                  <small className="success-text">Order qualifies for FREE shipping!</small>
                )}
              </div>

              <div className="summary-line">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="divider-dashed"></div>

              <div className="summary-line total">
                <span>Total Amount</span>
                <span className="total-val">${total.toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="checkout-btn-full">
                PROCEED TO CHECKOUT <CreditCard size={18} />
              </Link>

              <div className="trust-badges-cart mt-4">
                <img src="https://cdn-icons-png.flaticon.com/512/1162/1162499.png" alt="Secure" />
                <p>Secure SSL Encryption</p>
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

export default Cart;