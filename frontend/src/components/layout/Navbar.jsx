import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  BarChartIcon,
  PlusIcon,
  RadioIcon,
} from '../../assets/icons';

export const Navbar = ({ currentView, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => handleNavClick('landing')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <RadioIcon size={20} className="brand-icon" />
          </div>
          <span className="brand-name">
            Live<span className="brand-gradient">Poll</span>
          </span>
          <span className="badge badge-live-nav">PRO</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <button
            onClick={() => handleNavClick('landing')}
            className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('public-poll')}
            className={`nav-link ${currentView === 'public-poll' ? 'active' : ''}`}
          >
            Public Vote
          </button>
          <button
            onClick={() => handleNavClick('live-results')}
            className={`nav-link ${currentView === 'live-results' ? 'active' : ''}`}
          >
            Live Results
          </button>
          <button
            onClick={() => handleNavClick('analytics')}
            className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`}
          >
            Analytics
          </button>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>

          {/* Auth / Action CTA */}
          <button
            onClick={() => handleNavClick('login')}
            className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`}
          >
            Sign In
          </button>

          <Button
            size="sm"
            variant="primary"
            icon={PlusIcon}
            onClick={() => handleNavClick('create-poll')}
          >
            Create Poll
          </Button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer glass-panel animate-fade-in">
          <div className="mobile-menu-links">
            <button
              onClick={() => handleNavClick('landing')}
              className={`mobile-nav-link ${currentView === 'landing' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`mobile-nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavClick('create-poll')}
              className={`mobile-nav-link ${currentView === 'create-poll' ? 'active' : ''}`}
            >
              Create Poll
            </button>
            <button
              onClick={() => handleNavClick('public-poll')}
              className={`mobile-nav-link ${currentView === 'public-poll' ? 'active' : ''}`}
            >
              Public Vote
            </button>
            <button
              onClick={() => handleNavClick('live-results')}
              className={`mobile-nav-link ${currentView === 'live-results' ? 'active' : ''}`}
            >
              Live Results
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className={`mobile-nav-link ${currentView === 'analytics' ? 'active' : ''}`}
            >
              Analytics
            </button>
            <div className="mobile-menu-divider" />
            <div className="mobile-menu-footer">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleNavClick('login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={PlusIcon}
                onClick={() => handleNavClick('signup')}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
