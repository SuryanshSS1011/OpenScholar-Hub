import React, { memo } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  'aria-describedby'?: string;
}

const Input: React.FC<InputProps> = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  label,
  className = '',
  icon,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const baseClasses = 'block w-full rounded-md py-2 px-3 text-sm placeholder-gray-500 transition';
  
  const stateClasses = error
    ? 'bg-red-50 border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
    : 'bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-blue-300';
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  const errorId = error && errorMessage ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="relative">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={error}
          aria-describedby={describedBy}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${icon ? 'pl-10' : ''} ${className} border focus:outline-none focus:ring-1`}
          {...props}
        />
      </div>
      {error && errorMessage && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default memo(Input);