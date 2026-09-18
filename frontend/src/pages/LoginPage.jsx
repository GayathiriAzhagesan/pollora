import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SparklesIcon,
  AlertCircleIcon,
} from '../assets/icons';
import {
  PolloraIcon,
  GoogleIcon,
} from '../components/common/Logo';

export const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const { showToast } = useToast();

  // Check if Google OAuth is configured on backend
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const res = await fetch('http://localhost:8080/auth/providers');
        if (res.ok) {
          const data = await res.json();
          setIsGoogleConfigured(Boolean(data?.google?.configured));
        }
      } catch (err) {
        // Backend offline or unreachable
      }
    };
    checkProviders();
  }, []);

  // Handle OAuth callback redirection (?oauth_token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('oauth_token');
    const oauthError = params.get('error');

    if (oauthToken) {
      const user = {
        id: params.get('user_id') || '',
        name: params.get('user_name') || 'User',
        email: params.get('user_email') || '',
      };
      localStorage.setItem('token', oauthToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('authChange'));
      showToast(`Welcome back, ${user.name}! Signed in successfully.`, 'success');

      // Clear search query from URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      onNavigate('dashboard');
    } else if (oauthError) {
      showToast(`Authentication notice: ${decodeURIComponent(oauthError)}`, 'warning');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [onNavigate, showToast]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Invalid email or password', 'error');
        setLoading(false);
        return;
      }

      // Store auth credentials as required
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Notify Navbar and app of auth change
      window.dispatchEvent(new Event('authChange'));

      showToast(`Welcome back, ${data.user?.name || 'User'}! Signed in successfully.`, 'success');
      onNavigate('dashboard');
    } catch (err) {
      console.error('Login error:', err);
      showToast('Unable to connect to authentication server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    let isConfigured = isGoogleConfigured;

    if (!isConfigured) {
      try {
        const res = await fetch('http://localhost:8080/auth/providers');
        if (res.ok) {
          const data = await res.json();
          isConfigured = Boolean(data?.google?.configured);
          setIsGoogleConfigured(isConfigured);
        }
      } catch (err) {
        // Backend unreachable
      }
    }

    if (!isConfigured) {
      showToast(
        'Google OAuth credentials are not configured in backend .env. Please set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET.',
        'info'
      );
      return;
    }

    window.location.href = 'http://localhost:8080/auth/google';
  };

  const handleDemoSignIn = () => {
    setEmail('gayathiri@example.com');
    setPassword('password123');
    showToast('Demo credentials autofilled!', 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-ambient" />

      <div className="auth-card-container animate-fade-in">
        <div className="auth-brand-header">
          <div
            className="brand-icon-wrapper auth-logo pollora-icon-wrapper"
            onClick={() => onNavigate('landing')}
            role="button"
            tabIndex={0}
            aria-label="Return to Pollora homepage"
          >
            <PolloraIcon size={32} />
          </div>
          <span className="brand-name font-display text-2xl mt-2 block">
            Poll<span className="brand-gradient">ora</span>
          </span>
        </div>

        <Card className="auth-card glass-panel" glow>
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue to Pollora</p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="social-auth-buttons">
            <button
              type="button"
              className="social-login-btn google-btn"
              onClick={handleGoogleSignIn}
              title={isGoogleConfigured ? 'Sign in with Google' : 'Google OAuth (Configure GOOGLE_CLIENT_ID in backend .env)'}
            >
              <GoogleIcon size={18} />
              <span>Continue with Google</span>
              {!isGoogleConfigured && <span className="oauth-setup-badge">Setup</span>}
            </button>
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">OR</span>
            <span className="auth-divider-line" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              icon={MailIcon}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              icon={LockIcon}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              required
              rightAction={
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              }
            />

            <div className="auth-options-row">
              <label className="auth-remember-label">
                <input type="checkbox" defaultChecked className="auth-checkbox" />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                className="auth-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Password reset instructions will be sent if an account exists.', 'info');
                }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              iconRight={ArrowRightIcon}
            >
              Sign In
            </Button>

            {/* Fast Review Mode autofill for pair-programming & demo */}
            <div className="demo-credentials-box">
              <div className="demo-header">
                <SparklesIcon size={14} className="demo-icon" />
                <span>Fast Review Mode</span>
              </div>
              <p className="demo-text">Evaluate the platform instantly with pre-filled credentials.</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleDemoSignIn}
              >
                Autofill Demo Account
              </Button>
            </div>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="auth-link-btn"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
