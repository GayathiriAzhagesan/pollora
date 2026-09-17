import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel card ${hover ? 'card-hover' : ''} ${glow ? 'card-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
