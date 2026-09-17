import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon = null,
  rightAction = null,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || (name ? `input-${name}` : undefined);

  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon-left">
            <Icon size={18} />
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`input-field ${Icon ? 'with-left-icon' : ''} ${rightAction ? 'with-right-action' : ''}`}
          {...props}
        />
        {rightAction && <div className="input-action-right">{rightAction}</div>}
      </div>
      {error && <p className="input-error-msg">{error}</p>}
      {!error && helperText && <p className="input-helper-msg">{helperText}</p>}
    </div>
  );
};
