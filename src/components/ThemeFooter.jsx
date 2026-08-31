import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaPinterestP, FaEtsy, FaArrowUp } from 'react-icons/fa';
import '../assets/css/Footer.css';

const Footer = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="ts-simple-footer">
      {/* Top Section: Social Icons in Center */}
      <div className="ts-footer-middle">
        <div className="ts-social-bar">
          <a href="#" className="ts-soc-btn pinterest" aria-label="Pinterest"><FaPinterestP /></a>
          <a href="#" className="ts-soc-btn etsy" aria-label="Etsy"><FaEtsy /></a>
          <a href="#" className="ts-soc-btn instagram" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" className="ts-soc-btn facebook" aria-label="Facebook"><FaFacebookF /></a>
          {/* <a href="https://wa.me/923227594213" target="_blank" rel="noopener noreferrer" className="ts-soc-btn whatsapp" aria-label="WhatsApp"><FaWhatsapp /></a> */}
        </div>

        {/* Left Side Link */}
        <div className="ts-footer-single-link">
          <Link to="/refund-policy" onClick={handleScrollTop}>Terms and Conditions</Link>
        </div>
      </div>

      {/* Bottom Wood Strip Banner */}
      <div className="ts-bottom-wood-bar">
        <div className="ts-wood-bar-content">
          <p className="ts-copy-text">
            &copy; 2026 <b>Charlie Bells</b> - Designed by <Link to="https://codebasesln.com" target="_blank" rel="noopener noreferrer"><span className="ts-dev-text">CodeBase Solutions</span></Link>
          </p>
          <button className="ts-wood-scroll-btn" onClick={handleScrollTop} aria-label="Scroll to top">
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;