import React from 'react';
import { RadioIcon } from '../../assets/icons';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-brand" onClick={() => onNavigate && onNavigate('landing')}>
            <div className="brand-icon-wrapper">
              <RadioIcon size={18} className="brand-icon" />
            </div>
            <span className="brand-name">
              Live<span className="brand-gradient">Poll</span>
            </span>
          </div>
          <p className="footer-desc">
            The modern real-time polling platform for team meetings, webinars, classroom engagement, and live events.
          </p>
          <div className="footer-metrics">
            <span className="footer-metric-item">⚡ Realtime Latency &lt; 50ms</span>
            <span className="footer-metric-item">🔒 End-to-end Encrypted</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-list">
            <li><button onClick={() => onNavigate && onNavigate('landing')} className="footer-link-btn">Features</button></li>
            <li><button onClick={() => onNavigate && onNavigate('dashboard')} className="footer-link-btn">Dashboard</button></li>
            <li><button onClick={() => onNavigate && onNavigate('create-poll')} className="footer-link-btn">Create Poll</button></li>
            <li><button onClick={() => onNavigate && onNavigate('analytics')} className="footer-link-btn">Analytics</button></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-list">
            <li><button onClick={() => onNavigate && onNavigate('public-poll')} className="footer-link-btn">Live Demo Poll</button></li>
            <li><button onClick={() => onNavigate && onNavigate('live-results')} className="footer-link-btn">Realtime Results</button></li>
            <li><a href="#api" className="footer-link-btn" onClick={(e) => e.preventDefault()}>Developer API</a></li>
            <li><a href="#docs" className="footer-link-btn" onClick={(e) => e.preventDefault()}>Documentation</a></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Account</h4>
          <ul className="footer-list">
            <li><button onClick={() => onNavigate && onNavigate('login')} className="footer-link-btn">Sign In</button></li>
            <li><button onClick={() => onNavigate && onNavigate('signup')} className="footer-link-btn">Create Account</button></li>
            <li><a href="#privacy" className="footer-link-btn" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
            <li><a href="#terms" className="footer-link-btn" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LivePoll Inc. All rights reserved.</p>
        <div className="footer-status-pill">
          <span className="pulse-dot green" />
          <span>All Systems Operational</span>
        </div>
      </div>
    </footer>
  );
};
