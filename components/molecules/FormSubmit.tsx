import React from 'react';
import { useFormContext } from './FormProvider';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from '@/design-system/variants';

interface FormSubmitProps extends ButtonVariants {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  disableOnInvalid?: boolean;
  disableOnSubmitting?: boolean;
}

/**
 * Form submit button with automatic loading states
 */
function FormSubmit({
  children,
  className,
  disabled = false,
  disableOnInvalid = true,
  disableOnSubmitting = true,
  variant = 'primary',
  size = 'md',
  ...props
}: FormSubmitProps) {
  const form = useFormContext();
  
  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;
  
  const isDisabled = disabled || 
    (disableOnInvalid && !isValid) || 
    (disableOnSubmitting && isSubmitting);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant, size, loading: isSubmitting }),
        className
      )}
      {...props}
    >
      {isSubmitting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Submitting...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default FormSubmit;