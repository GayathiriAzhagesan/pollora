import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import {
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  RadioIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '../assets/icons';
import { PolloraIcon } from '../components/common/Logo';
import { API_URL } from '../config';

export const SignupPage = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to create account. Please try again.', 'error');
        setLoading(false);
        return;
      }

      // Store auth credentials as required
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Notify Navbar and app of auth change
      window.dispatchEvent(new Event('authChange'));

      showToast(`Account created successfully! Welcome, ${data.user?.name || 'User'}.`, 'success');
      onNavigate('dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      showToast('Unable to connect to registration server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-ambient" />

      <div className="auth-card-container animate-fade-in">
        <div className="auth-brand-header">
          <div className="brand-icon-wrapper auth-logo pollora-icon-wrapper" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
            <PolloraIcon size={28} />
          </div>
          <span className="brand-name font-display text-xl mt-2 block">
            Poll<span className="brand-gradient">ora</span>
          </span>
        </div>

        <Card className="auth-card glass-panel" glow>
          <div className="auth-header">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Start creating interactive polls in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Morgan"
              icon={UserIcon}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              error={errors.fullName}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="alex@company.com"
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
              placeholder="At least 8 characters"
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              icon={LockIcon}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              required
            />

            {/* Password quality badges */}
            <div className="password-hints">
              <span className={`hint-pill ${password.length >= 8 ? 'valid' : ''}`}>
                <CheckCircleIcon size={12} /> 8+ Characters
              </span>
              <span className={`hint-pill ${password && password === confirmPassword ? 'valid' : ''}`}>
                <CheckCircleIcon size={12} /> Passwords Match
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              iconRight={ArrowRightIcon}
            >
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="auth-link-btn"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
