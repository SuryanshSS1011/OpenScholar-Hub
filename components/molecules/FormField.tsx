import React from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from './FormProvider';
import { cn } from '@/lib/utils';
import { inputVariants, type InputVariants } from '@/design-system/variants';

interface FormFieldProps extends InputVariants {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Unified form field component with validation
 */
function FormField({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  description,
  icon,
  state = 'default',
  size = 'md',
  children,
  ...props
}: FormFieldProps) {
  const form = useFormContext();

  const {
    field,
    fieldState: { error, isTouched },
  } = useController({
    name,
    control: form.control,
  });

  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  const hasError = !!error && isTouched;
  const fieldState = hasError ? 'error' : state;

  // If children are provided, render as a custom field
  if (children) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            name: field.name,
            value: field.value,
            onChange: field.onChange,
            onBlur: field.onBlur,
            disabled,
            'aria-invalid': hasError,
            'aria-describedby': [errorId, descriptionId].filter(Boolean).join(' ') || undefined,
          } as any)}
        </div>
        {description && (
          <p id={descriptionId} className="text-sm text-gray-500">
            {description}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}

        <input
          {...field}
          {...props}
          id={fieldId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            inputVariants({ state: fieldState, size }),
            icon && 'pl-10',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
        />
      </div>

      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default FormField;