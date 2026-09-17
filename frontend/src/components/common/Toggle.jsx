import React from 'react';

export const Toggle = ({
  checked = false,
  onChange,
  label = '',
  description = '',
  disabled = false,
  id,
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <div className={`toggle-group ${disabled ? 'toggle-disabled' : ''}`}>
      <div className="toggle-text">
        {label && <label htmlFor={toggleId} className="toggle-label">{label}</label>}
        {description && <p className="toggle-description">{description}</p>}
      </div>
      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`toggle-switch ${checked ? 'toggle-checked' : ''}`}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
};
