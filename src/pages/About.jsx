import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { useState } from 'react';
import SideDrawer from '../components/SideDrawer';
 
const About = () => {

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 55%, #eef2f7 100%)'
      }}
    >
      {/* Header */}
      <header className="modern-header" style={{ width: '100%' }}>
        <div className="container-fluid px-0">
          <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
          <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
        </div>
      </header>

      {/* Hero / Intro */}
      <section className="container-fluid px-3 px-md-4 py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="row align-items-center"
        >
          <div className="col-lg-7 mb-4 mb-lg-0">
            <h1 className="fw-bold mb-3" style={{ color: '#111827' }}>
              About <span style={{ color: 'var(--brand-primary)' }}>Charlie Bells</span>
            </h1>
            <p className="lead" style={{ color: '#4b5563' }}>
              Charlie Bells is a trusted supplier of home care chemicals, detergents, and cleaning solutions serving businesses and households with dependable quality and consistent performance.
            </p>
          </div>
          <div className="col-lg-5">
            <div
              className="p-4 rounded-4 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, rgba(242,101,34,0.1), rgba(251,191,36,0.15))',
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: '#111827' }}>
                At a Glance
              </h5>
              <ul className="list-unstyled mb-0" style={{ color: '#374151', fontSize: 14 }}>
                <li className="mb-2">
                  • Serving Home Care, commercial, and domestic customers with a dependable range of chemical and detergent solutions.
                </li>
                <li className="mb-2">
                  • Trusted by buyers who value product quality, safety, and timely supply.
                </li>
                <li className="mb-2">
                  • Focused on detergents, cleaning agents, and specialized formulations.
                </li>
                <li>
                  • Based in Pakistan, delivering reliable service through our store and online platform.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="container-fluid px-3 px-md-4 pb-5">
        <div className="row">
          <div className="col-lg-7 mb-4">
            <h3 className="fw-bold mb-3" style={{ color: '#111827' }}>
              Our Story
            </h3>
            <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
              Charlie Bells was built to serve customers who need dependable chemical products, trusted sourcing, and consistent supply for commercial and household use.
            </p>
            <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
              Today, we are recognized for quality formulations, reliable fulfillment, and a customer-first approach focused on safe, effective solutions for cleaning and home care operations.
            </p>
          </div>
          <div className="col-lg-5 mb-4">
            <div className="p-4 rounded-4 bg-white shadow-sm h-100">
              <h4 className="fw-bold mb-3" style={{ color: '#111827' }}>
                What Makes Us Different?
              </h4>
              <ul className="list-unstyled mb-0" style={{ color: '#4b5563', fontSize: 14 }}>
                <li className="mb-2">
                  • <strong>Premium quality supply</strong> – dependable chemical products built for real-world use.
                </li>
                <li className="mb-2">
                  • <strong>Expert selection</strong> – carefully curated detergents and cleaning formulations for every need.
                </li>
                <li className="mb-2">
                  • <strong>Competitive pricing</strong> – trusted performance without unnecessary overhead.
                </li>
                <li>
                  • <strong>Personalized service</strong> – we guide buyers toward the right solutions for their operations.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section
        className="py-5"
        style={{ background: 'linear-gradient(135deg,#0f172a,#020617)', color: '#e5e7eb' }}
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h3 className="fw-bold mb-3">Our Vision</h3>
              <p style={{ lineHeight: 1.7 }}>
                To be the most trusted chemical and detergent supplier in the region, delivering quality, consistency, and dependable service for every customer.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold mb-3">Our Promise</h3>
              <p style={{ lineHeight: 1.7 }}>
                Every order from Charlie Bells is backed by responsible sourcing, reliable delivery, and attentive support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ThemeFooter />
    </div>
  );
};

export default About;


