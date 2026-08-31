// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { FaHeadset, FaBolt, FaUser, FaShoppingCart, FaBars } from 'react-icons/fa';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { useLogo } from '../context/LogoContext';
// import '../assets/css/Topbar.css';

// const TopBar = ({ onMenuToggle }) => {
//   const { user } = useAuth();
//   const { getCartItemsCount } = useCart();
//   const { websiteLogo } = useLogo();
//   const location = useLocation();

//   const isActive = (path) => (location.pathname === path ? 'active-link' : '');

//   return (
//     <header className="ts-header">
//       {/* 1. Top Announcement Bar */}
//       <div className="ts-trust-bar">
//         <div className="container">
//           <p className="m-0">
//             <FaBolt className="me-2 ts-accent-text" />
//             100% Made in USA — Premium Bike Bells
//           </p>
//         </div>
//       </div>

//       {/* 2. Top Utility */}
//       {/* <div className="ts-utility">
//         <div className="container d-flex justify-content-between align-items-center">
//           <div className="ts-u-left">
//             <FaHeadset className="ts-accent-text me-2" />
//             <span className="d-none d-sm-inline">Support:</span> +92 322 7594213
//           </div>
//           <div className="ts-u-right">
//             <Link to={user ? "/" : "/login"} className="ts-auth-link">
//               <FaUser className="ts-accent-text me-2" />
//               <span>{user?.first_name ? `Hi, ${user.first_name}` : 'Login / Register'}</span>
//             </Link>
//           </div>
//         </div>
//       </div> */}

//       {/* 3. Main Nav */}
//       <nav className="ts-main-nav">
//         <div className="container ts-nav-container">
//           {/* LEFT: Menu Toggle */}
//           <div className="ts-nav-left">
//             <button className="ts-menu-toggle" onClick={onMenuToggle} aria-label="Toggle Navigation">
//               <FaBars />
//             </button>
//           </div>

//           {/* CENTER: Logo */}
//           <div className="ts-nav-center">
//             <Link to="/">
//               <img
//                 src={
//                   websiteLogo ||
//                   'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEyMCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4='
//                 }
//                 alt="Charlie Bells"
//                 className="ts-logo"
//               />
//             </Link>
//           </div>

//           {/* RIGHT: Actions */}
//           <div className="ts-nav-right">
//             <div className="ts-desktop-links d-none d-lg-flex">
//               <Link to="/" className={`ts-link ${isActive('/')}`}>
//                 Home
//               </Link>
//               <Link to="/all-products" className={`ts-link ${isActive('/all-products')}`}>
//                 Shop Collections
//               </Link>
//             </div>

//             <Link to="/cart" className="ts-cart-btn" aria-label="Shopping Cart">
//               <div className="ts-cart-icon-box">
//                 <FaShoppingCart />
//                 {getCartItemsCount && getCartItemsCount() > 0 && (
//                   <span className="ts-badge">{getCartItemsCount()}</span>
//                 )}
//               </div>
//             </Link>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default TopBar;




import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import { themeApi } from '../services/themeApi';
import '../assets/css/Topbar.css';

const TopBar = ({ onMenuToggle, categories: parentCategories }) => {
  const { getCartItemsCount } = useCart();
  const { websiteLogo } = useLogo();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(parentCategories || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Dynamic API Fetching using themeApi
  useEffect(() => {
    if (parentCategories && parentCategories.length > 0) {
      setCategories(parentCategories);
    } else {
      const fetchCategories = async () => {
        try {
          const categoriesData = await themeApi.getCategories();
          setCategories(categoriesData || []);
        } catch (error) {
          console.error('Error fetching categories in TopBar:', error);
        }
      };
      fetchCategories();
    }
  }, [parentCategories]);

  const isActive = (path) => (location.pathname === path ? 'active-link' : '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="ts-header">
      {/* Brand Logo Header */}
      <div className="ts-brand-banner">
        <div className="container d-flex justify-content-between align-items-center position-relative">
          <button className="ts-menu-toggle d-lg-none" onClick={onMenuToggle} aria-label="Toggle Menu">
            <FaBars />
          </button>

          <div className="ts-nav-center mx-auto">
            <Link to="/">
              <img
                src={
                  websiteLogo ||
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEyMCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4='
                }
                alt="Charlie Bells"
                className="ts-logo"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Single Row Links Bar (Bravo Bells Theme) */}
      <nav className="ts-main-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <ul className="ts-nav-links d-none d-lg-flex m-0 p-0">
            {/* 1. Contact */}
            <li className="ts-nav-item">
              <Link to="/contact" className={`ts-nav-link ${isActive('/contact')}`}>
                CONTACT
              </Link>
            </li>

            {/* 2. Cart Dropdown */}
            <li className="ts-nav-item ts-dropdown">
              <span className="ts-nav-link">
                CART <FaChevronDown className="ts-arrow-icon" />
              </span>
              <ul className="ts-dropdown-menu">
                <li>
                  <Link to="/checkout" className="ts-dropdown-item">
                    Secure Checkout Page
                  </Link>
                </li>
                <li>
                  <Link to="/all-products" className="ts-dropdown-item">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/return-policy" className="ts-dropdown-item">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </li>

            {/* 3. A Bell's Purpose */}
            <li className="ts-nav-item">
              <Link to="/bell-purpose" className={`ts-nav-link ${isActive('/bell-purpose')}`}>
                A BELL'S PURPOSE
              </Link>
            </li>

            {/* 4. Dynamic Shop Products Dropdown */}
            <li className="ts-nav-item ts-dropdown">
              <span className="ts-nav-link">
                SHOP PRODUCTS <FaChevronDown className="ts-arrow-icon" />
              </span>
              <ul className="ts-dropdown-menu">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id || category._id}>
                      <Link to={`/category/${category.id || category._id}`} className="ts-dropdown-item">
                        {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className="ts-dropdown-item text-muted">No Categories</span>
                  </li>
                )}
              </ul>
            </li>

             <li className="ts-nav-item">
              <Link to="/" className={`ts-nav-link ${isActive('/')}`}>
                HOME
              </Link>
            </li>
          </ul>

          {/* Right Action Icons (Search & Cart) */}
          <div className="ts-right-actions d-flex align-items-center gap-3 ms-auto ms-lg-0">
            {/* Search Input Toggle */}
            <div className="ts-search-wrapper position-relative">
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm ts-search-input"
                    placeholder="Search bells..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="button" className="btn text-light p-1 ms-1" onClick={() => setShowSearchInput(false)}>
                    <FaTimes />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="ts-action-icon-btn"
                  onClick={() => setShowSearchInput(true)}
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              )}
            </div>

            {/* Quick Cart Link Badge */}
            <Link to="/cart" className="ts-action-icon-btn position-relative" aria-label="Cart">
              <FaShoppingCart />
              {getCartItemsCount && getCartItemsCount() > 0 && (
                <span className="ts-cart-count-badge">{getCartItemsCount()}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TopBar;