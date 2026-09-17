import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'live' | 'closed' | 'success' | 'primary' | 'warning' | 'neutral'
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {variant === 'live' && <span className="pulse-dot" aria-hidden="true" />}
      {variant === 'success' && <span className="pulse-dot green" aria-hidden="true" />}
      <span className="badge-text">{children}</span>
    </span>
  );
};
