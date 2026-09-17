import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-block' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} className="btn-icon" />}
          <span className="btn-text">{children}</span>
          {IconRight && <IconRight size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} className="btn-icon-right" />}
        </>
      )}
    </button>
  );
};
