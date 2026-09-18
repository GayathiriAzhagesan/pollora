import React from 'react';

/**
 * Modern geometric SaaS icon for Pollora.
 * Represents rising real-time polling bars within an illuminated squircle badge.
 */
export const PolloraIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pollora-logo-svg ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="pollora-badge-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1D4ED8" />
        <stop offset="0.5" stopColor="#2563EB" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>

    {/* Squircle Badge Background */}
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pollora-badge-gradient)" />

    {/* Inner subtle glow stroke */}
    <rect x="2.5" y="2.5" width="27" height="27" rx="7.5" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />

    {/* Rising Live Poll Bars */}
    <rect x="7" y="16" width="4" height="9" rx="2" fill="white" fillOpacity="0.85" />
    <rect x="14" y="11" width="4" height="14" rx="2" fill="white" fillOpacity="0.95" />
    <rect x="21" y="7" width="4" height="18" rx="2" fill="white" />

    {/* Live Real-Time Beacon Pulse on top of the leading bar */}
    <circle cx="23" cy="4.5" r="2.2" fill="#38BDF8" />
    <circle cx="23" cy="4.5" r="3.2" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
  </svg>
);

/**
 * Reusable Pollora Brand Logo Component
 */
export const Logo = ({
  size = 'md',
  showBadge = false,
  badgeText = 'PRO',
  className = '',
  onClick,
}) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <div
      className={`navbar-brand pollora-brand ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="brand-icon-wrapper pollora-icon-wrapper">
        <PolloraIcon size={iconSize} />
      </div>
      <span className="brand-name">
        Poll<span className="brand-gradient">ora</span>
      </span>
      {showBadge && <span className="badge badge-live-nav">{badgeText}</span>}
    </div>
  );
};

/**
 * Official vector brand icons for authentication & social sharing
 */

export const GoogleIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

export const MicrosoftIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H13z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

export const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      fill="#25D366"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.42 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2Z"
    />
    <path
      fill="#FFFFFF"
      d="M17.5 14.33C17.2 14.18 15.73 13.45 15.45 13.35C15.18 13.25 14.98 13.2 14.78 13.5C14.58 13.8 14 14.5 13.82 14.7C13.65 14.9 13.47 14.93 13.17 14.78C12.87 14.63 11.92 14.32 10.79 13.31C9.91 12.53 9.32 11.56 9.15 11.26C8.97 10.96 9.13 10.8 9.28 10.65C9.42 10.51 9.58 10.3 9.73 10.13C9.88 9.95 9.93 9.83 10.03 9.63C10.13 9.43 10.08 9.25 10 9.1C9.93 8.95 9.32 7.48 9.07 6.88C8.83 6.3 8.58 6.38 8.4 6.38C8.23 6.37 8.03 6.37 7.83 6.37C7.63 6.37 7.32 6.45 7.05 6.73C6.78 7.03 6.03 7.73 6.03 9.17C6.03 10.6 7.08 11.98 7.23 12.18C7.38 12.38 9.33 15.38 12.32 16.67C13.03 16.98 13.59 17.17 14.02 17.31C14.74 17.54 15.39 17.51 15.91 17.43C16.49 17.34 17.68 16.71 17.93 16.01C18.18 15.31 18.18 14.71 18.1 14.58C18.03 14.46 17.8 14.48 17.5 14.33Z"
    />
  </svg>
);

export const LinkedInIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path
      fill="#FFFFFF"
      d="M6.94 5A1.94 1.94 0 1 0 6.94 8.88A1.94 1.94 0 0 0 6.94 5ZM5.28 10.11H8.61V19H5.28V10.11ZM13.88 10.11C12.06 10.11 11.25 11.11 10.8 11.8V10.11H7.47V19H10.8V13.84C10.8 12.48 11.06 11.16 12.75 11.16C14.41 11.16 14.44 12.71 14.44 13.93V19H17.77V13.33C17.77 10.55 17.18 10.11 13.88 10.11Z"
    />
  </svg>
);

export const FacebookIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      fill="#FFFFFF"
      d="M14.33 12.5L14.73 9.9H12.24V8.21C12.24 7.5 12.59 6.81 13.7 6.81H14.83V4.6C14.83 4.6 13.81 4.43 12.83 4.43C10.79 4.43 9.45 5.67 9.45 7.91V9.9H7.17V12.5H9.45V18.79C9.91 18.86 10.38 18.9 10.85 18.9C11.32 18.9 11.78 18.86 12.24 18.79V12.5H14.33Z"
    />
  </svg>
);

export const XTwitterIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const EmailShareIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const CopyShareIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export default Logo;
