import React, { useState } from 'react';
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
  RadioIcon,
  SparklesIcon,
} from '../assets/icons';

export const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Welcome back, John! Signed in successfully.', 'success');
      onNavigate('dashboard');
    }, 600);
  };

  const handleDemoSignIn = () => {
    setEmail('john.doe@example.com');
    setPassword('secretpassword123');
    showToast('Demo credentials autofilled!', 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-ambient" />

      <div className="auth-card-container animate-fade-in">
        <div className="auth-brand-header">
          <div className="brand-icon-wrapper auth-logo" onClick={() => onNavigate('landing')}>
            <RadioIcon size={24} className="brand-icon" />
          </div>
        </div>

        <Card className="auth-card glass-panel" glow>
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue to LivePoll</p>
          </div>

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
              <a href="#forgot" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); showToast('Reset instructions sent to email', 'info'); }}>
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

            {/* Demo Quick Fill */}
            <div className="demo-credentials-box">
              <div className="demo-header">
                <SparklesIcon size={14} className="demo-icon" />
                <span>Fast Review Mode</span>
              </div>
              <p className="demo-text">Evaluate the UI instantly with pre-filled test user credentials.</p>
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
                Create one
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
