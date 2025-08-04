import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'ghost' | 'primary' | 'danger';
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onClick, 
  size = 'medium',
  variant = 'ghost',
  title,
  disabled = false,
  className = '',
  ...props 
}) => {
  const sizes = {
    small: 'p-1',
    medium: 'p-1.5',
    large: 'p-2'
  };
  
  const variants = {
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    danger: 'text-red-600 hover:text-red-700 hover:bg-red-50'
  };
  
  const baseClasses = 'rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;