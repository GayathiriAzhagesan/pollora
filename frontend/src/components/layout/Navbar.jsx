import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  RadioIcon,
  LogOutIcon,
} from '../../assets/icons';
import { PolloraIcon } from '../common/Logo';

// Safely retrieve and parse user from localStorage
const getUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      return null;
    }
    const parsed = JSON.parse(userStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    return null;
  }
};

export const Navbar = ({ currentView, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(getUserFromStorage);

  // Synchronize authentication state across tab events, custom authChange event, and view changes
  useEffect(() => {
    const syncAuth = () => {
      setUser(getUserFromStorage());
    };

    window.addEventListener('authChange', syncAuth);
    window.addEventListener('storage', syncAuth);

    // Initial and view-transition check
    syncAuth();

    return () => {
      window.removeEventListener('authChange', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, [currentView]);

  const handleNavClick = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleFeaturesClick = () => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById('features');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    setMobileMenuOpen(false);
    onNavigate('landing');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand pollora-brand" onClick={() => handleNavClick('landing')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper pollora-icon-wrapper">
            <PolloraIcon size={22} />
          </div>
          <span className="brand-name">
            Poll<span className="brand-gradient">ora</span>
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

          {!user ? (
            /* BEFORE LOGIN LINKS */
            <button
              onClick={handleFeaturesClick}
              className="nav-link"
            >
              Features
            </button>
          ) : (
            /* AFTER LOGIN LINKS */
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('create-poll')}
                className={`nav-link ${currentView === 'create-poll' ? 'active' : ''}`}
              >
                Create Poll
              </button>
              <button
                onClick={() => handleNavClick('analytics')}
                className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`}
              >
                Analytics
              </button>
            </>
          )}
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

          {!user ? (
            /* BEFORE LOGIN ACTIONS */
            <>
              <button
                onClick={() => handleNavClick('login')}
                className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`}
              >
                Sign In
              </button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => handleNavClick('signup')}
              >
                Get Started
              </Button>
            </>
          ) : (
            /* AFTER LOGIN ACTIONS */
            <>
              {/* User Account Button */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`nav-user-account ${currentView === 'dashboard' ? 'active' : ''}`}
                title={`Logged in as ${user.name || 'User'} — Click to view Dashboard`}
              >
                <span className="nav-user-avatar-icon">👤</span>
                <span className="nav-user-name">{user.name || 'Account'}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="nav-logout-btn"
                title="Log out"
              >
                <LogOutIcon size={16} />
                <span>Logout</span>
              </button>
            </>
          )}

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

            {!user ? (
              <button
                onClick={handleFeaturesClick}
                className="mobile-nav-link"
              >
                Features
              </button>
            ) : (
              <>
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
                  onClick={() => handleNavClick('analytics')}
                  className={`mobile-nav-link ${currentView === 'analytics' ? 'active' : ''}`}
                >
                  Analytics
                </button>
              </>
            )}

            <div className="mobile-menu-divider" />
            <div className="mobile-menu-footer">
              {!user ? (
                <>
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
                    onClick={() => handleNavClick('signup')}
                  >
                    Get Started Free
                  </Button>
                </>
              ) : (
                <div className="mobile-user-box">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="mobile-user-card-btn"
                  >
                    <span className="mobile-user-avatar">👤</span>
                    <div className="mobile-user-details">
                      <span className="mobile-user-name">{user.name || 'User'}</span>
                      <span className="mobile-user-email">{user.email || 'Logged In'}</span>
                    </div>
                  </button>
                  <Button
                    variant="outline"
                    fullWidth
                    icon={LogOutIcon}
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
