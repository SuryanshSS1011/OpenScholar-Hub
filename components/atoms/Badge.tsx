import React from 'react';
import { BadgeProps } from '@/types';

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  className = '' 
}) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    notification: 'bg-red-500 text-white'
  };
  
  const sizes = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-0.5'
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