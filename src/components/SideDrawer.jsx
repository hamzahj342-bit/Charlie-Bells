import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, Home, ShoppingBag, User, Settings, LogOut, 
  LayoutDashboard, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import { useState, useEffect } from 'react';
import { themeApi } from '../services/themeApi';
import '../assets/css/SideDrawer.css'; // Make sure to create this file

const SideDrawer = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await themeApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Side Drawer */}
          <motion.div
            className="side-drawer-container"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="drawer-header">
              <div className="header-brand">
                <span className="menu-title">Explorer</span>
              </div>
              <button className="close-btn" onClick={onClose}><X size={24} /></button>
            </div>

            {/* Navigation Body */}
            <div className="drawer-body">
              {/* Main Nav Section */}
              <div className="drawer-section">
                <label className="section-label">Main Menu</label>
                <Link to="/" className="drawer-link" onClick={onClose}>
                  <Home className="nav-icon" /> Home
                </Link>
                <Link to="/all-products" className="drawer-link" onClick={onClose}>
                  <ShoppingBag className="nav-icon" /> Shop Products
                </Link>
                <Link to="/about" className="drawer-link" onClick={onClose}>
                  <Info className="nav-icon" /> About Us
                </Link>
              </div>

              {/* Dynamic Categories Section */}
              <div className="drawer-section">
                <label className="section-label">Product Categories</label>
                <ul className="cat-list">
                  {categories.map((category) => (
                    <li key={category.id} className="cat-item" onClick={() => { navigate(`/category/${category.id}`); onClose(); }}>
                      <span className="cat-name">{category.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Section */}
              <div className="drawer-section">
                <label className="section-label">Account & Settings</label>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="drawer-link admin-link" onClick={onClose}>
                    <LayoutDashboard className="nav-icon" /> Admin Dashboard
                  </Link>
                )}
                {user ? (
                  <button className="drawer-btn logout-btn" onClick={handleLogout}>
                    <LogOut className="nav-icon" /> Logout
                  </button>
                ) : (
                  <Link to="/login" className="drawer-link" onClick={onClose}>
                    <User className="nav-icon" /> Login / Register
                  </Link>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="drawer-footer">
              <img src={websiteLogo} alt="Logo" className="footer-mini-logo" />
              <p className="copyright-text">© 2026 Charlie Bells Supply Solutions</p>
              <p className="codebase-tag">Powered by <span>CodeBase Solutions</span></p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;