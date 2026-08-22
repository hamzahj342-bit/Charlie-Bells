import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Loader2 } from 'lucide-react';
import '../assets/css/login-styles.css';

const Login = () => {
  const { websiteLogo } = useLogo();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const response = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      
      // Role-based navigation logic
      if (response.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // Customer returns to store
      }
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="lg-container">
      <div className="lg-card">
        {/* Header Section - Customer Friendly */}
        <div className="lg-logo-wrap">
          <img 
            src={websiteLogo} 
            alt="Store Logo" 
            className="lg-main-logo"
          />
          <h1 className="lg-title">Sign In</h1>
          <p className="lg-subtitle">
            Log in to your account to manage orders and track deliveries
          </p>
        </div>
        
        {/* Login Form */}
        <form className="lg-form" onSubmit={handleSubmit}>
          
          {/* Email Field */}
          <div className="lg-form-group">
            <label htmlFor="email" className="lg-label">
              <Mail size={14} style={{ marginRight: '6px' }} />
              Email Address
            </label>
            <div className="lg-input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="lg-input"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="lg-form-group">
            <label htmlFor="password" className="lg-label">
              <Lock size={14} style={{ marginRight: '6px' }} />
              Password
            </label>
            <div className="lg-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="lg-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="lg-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="lg-options">
            <label className="lg-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>

            <Link to="/change-password" size={18} className="lg-forgot">
              Change Password
            </Link>
          </div>

          {/* Submit Button - Shopping focused */}
          <button
            type="submit"
            disabled={isLoading}
            className="lg-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="lg-spin" size={20} />
                Verifying...
              </>
            ) : (
              <>
                Sign In to Account <ShoppingBag size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="lg-footer-text">
          Don't have an account?{' '}
          <Link to="/register">
            Join us today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;