import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    notification: 'bg-red-500 text-white'
  };
  
  const sizes = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-0.5',
    large: 'text-base px-3 py-1'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;