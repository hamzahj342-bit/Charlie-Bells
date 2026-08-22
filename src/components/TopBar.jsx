import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHeadset, FaBolt, FaUser, FaShoppingCart, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import '../assets/css/Topbar.css';

const TopBar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { getCartItemsCount } = useCart();
  const { websiteLogo } = useLogo();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  return (
    <header className="ts-header">
      {/* 1. Top Utility */}
      <div className="ts-utility">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="ts-u-left">
            <FaHeadset className="ts-accent-text me-2" />
            <span className="d-none d-sm-inline">Support:</span> +92 322 7594213
          </div>
          <div className="ts-u-right">
             <Link to={user ? "/" : "/login"} className="ts-auth-link">
                <FaUser className="ts-accent-text me-2" />
                <span>{user?.first_name ? `Hi, ${user.first_name}` : 'Login'}</span>
             </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Nav */}
      <nav className="ts-main-nav">
        <div className="container ts-nav-container">
          
          {/* LEFT: Menu */}
          <div className="ts-nav-left">
            <button className="ts-menu-toggle" onClick={onMenuToggle}>
              <FaBars />
            </button>
          </div>

          {/* CENTER: Logo */}
          <div className="ts-nav-center">
            <Link to="/">
              <img src={websiteLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEyMCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4='} alt="Charlie Bells" className="ts-logo" />
            </Link>
          </div>

          {/* RIGHT: Actions */}
          <div className="ts-nav-right">
            <div className="ts-desktop-links d-none d-lg-flex">
              <Link to="/" className={`ts-link ${isActive('/')}`}>Home</Link>
              <Link to="/all-products" className={`ts-link ${isActive('/all-products')}`}>Shop</Link>
            </div>

            <Link to="/cart" className="ts-cart-btn">
              <div className="ts-cart-icon-box">
                <FaShoppingCart />
                {getCartItemsCount && getCartItemsCount() > 0 && <span className="ts-badge">{getCartItemsCount()}</span>}
              </div>
              <span className="d-none d-md-inline ms-2"></span>
            </Link>
          </div>

        </div>
      </nav>

      {/* 3. Trust Bar */}
      <div className="ts-trust-bar">
        <div className="container">
          <p className="m-0"><FaBolt className="me-2" />Trusted Supplier of Premium Bike Bells & Horns</p>
        </div>
      </div>
    </header>
  );
};

export default TopBar;