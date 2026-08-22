import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogo } from '../context/LogoContext';
import { useAuth } from '../context/AuthContext';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, KeyRound, Loader2, ArrowLeft, Mail } from 'lucide-react';
import '../assets/css/login-styles.css';

const ChangePassword = () => {
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showFields, setShowFields] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleVisibility = (field) => {
    setShowFields({
      ...showFields,
      [field]: !showFields[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.current_password || !formData.new_password || !formData.confirm_password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      await themeApi.changePassword({
        email: formData.email,
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      toast.success('Password updated successfully');
      setFormData({ email: user?.email || '', current_password: '', new_password: '', confirm_password: '' });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg-container">
      <div className="lg-card">
        <div className="lg-logo-wrap">
          <img src={websiteLogo} alt="Store Logo" className="lg-main-logo" />
          <h1 className="lg-title">Change Password</h1>
          <p className="lg-subtitle">Update your account password securely</p>
        </div>

        <form className="lg-form" onSubmit={handleSubmit}>
          <div className="lg-form-group">
            <label htmlFor="email" className="lg-label">
              <Mail size={14} style={{ marginRight: '6px' }} />
              Email
            </label>
            <div className="lg-input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="lg-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="lg-form-group">
            <label htmlFor="current_password" className="lg-label">
              <Lock size={14} style={{ marginRight: '6px' }} />
              Previous Password
            </label>
            <div className="lg-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="current_password"
                name="current_password"
                type={showFields.current ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="lg-input"
                placeholder="Enter your current password"
                value={formData.current_password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="lg-password-toggle"
                onClick={() => toggleVisibility('current')}
              >
                {showFields.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="lg-form-group">
            <label htmlFor="new_password" className="lg-label">
              <KeyRound size={14} style={{ marginRight: '6px' }} />
              New Password
            </label>
            <div className="lg-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="new_password"
                name="new_password"
                type={showFields.new ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="lg-input"
                placeholder="Enter new password"
                value={formData.new_password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="lg-password-toggle"
                onClick={() => toggleVisibility('new')}
              >
                {showFields.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="lg-form-group">
            <label htmlFor="confirm_password" className="lg-label">
              <Lock size={14} style={{ marginRight: '6px' }} />
              Confirm Password
            </label>
            <div className="lg-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showFields.confirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="lg-input"
                placeholder="Confirm new password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="lg-password-toggle"
                onClick={() => toggleVisibility('confirm')}
              >
                {showFields.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="lg-submit-btn">
            {isSubmitting ? (
              <>
                <Loader2 className="lg-spin" size={20} />
                Updating Password...
              </>
            ) : (
              <>Update Password</>
            )}
          </button>
        </form>

        <div className="lg-footer-text">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
