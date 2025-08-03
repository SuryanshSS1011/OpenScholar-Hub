import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { inputVariants, type InputVariants } from '@/design-system/variants';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
  description?: string;
}

/**
 * Enhanced Input component with design system integration
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    state = 'default',
    size = 'md',
    icon,
    error,
    label,
    description,
    id,
    name,
    required,
    ...props 
  }, ref) => {
    const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const descriptionId = description ? `${inputId}-description` : undefined;
    
    const hasError = !!error;
    const inputState = hasError ? 'error' : state;
    
    const describedBy = [props['aria-describedby'], errorId, descriptionId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">{icon}</div>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ state: inputState, size }),
              icon && 'pl-10',
              className
            )}
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        
        {description && (
          <p id={descriptionId} className="text-sm text-gray-500">
            {description}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };