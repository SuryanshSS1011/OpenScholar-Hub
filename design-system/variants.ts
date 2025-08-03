import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Component Variant System using CVA
 * Provides consistent styling variants across components
 */

// Button Variants
export const buttonVariants = cva(
  // Base classes
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-blue-600',
          'text-white',
          'hover:bg-blue-700',
          'focus-visible:ring-blue-500',
        ],
        secondary: [
          'bg-white',
          'text-gray-700',
          'border',
          'border-gray-300',
          'hover:bg-gray-50',
          'focus-visible:ring-blue-500',
        ],
        danger: [
          'bg-red-600',
          'text-white',
          'hover:bg-red-700',
          'focus-visible:ring-red-500',
        ],
        ghost: [
          'text-gray-700',
          'hover:bg-gray-100',
          'focus-visible:ring-gray-500',
        ],
        link: [
          'text-blue-600',
          'underline-offset-4',
          'hover:underline',
          'focus-visible:ring-blue-500',
        ],
      },
      size: {
        sm: ['h-8', 'px-3', 'text-sm'],
        md: ['h-10', 'px-4', 'text-sm'],
        lg: ['h-12', 'px-6', 'text-base'],
        xl: ['h-14', 'px-8', 'text-lg'],
      },
      loading: {
        true: ['cursor-not-allowed'],
        false: [],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false,
    },
  }
);

// Input Variants
export const inputVariants = cva(
  [
    'flex',
    'w-full',
    'rounded-md',
    'border',
    'bg-white',
    'px-3',
    'py-2',
    'text-sm',
    'transition-colors',
    'file:border-0',
    'file:bg-transparent',
    'file:text-sm',
    'file:font-medium',
    'placeholder:text-gray-500',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ],
  {
    variants: {
      state: {
        default: [
          'border-gray-300',
          'focus-visible:ring-blue-500',
          'focus-visible:border-blue-500',
        ],
        error: [
          'border-red-300',
          'focus-visible:ring-red-500',
          'focus-visible:border-red-500',
          'bg-red-50',
        ],
        success: [
          'border-green-300',
          'focus-visible:ring-green-500',
          'focus-visible:border-green-500',
          'bg-green-50',
        ],
      },
      size: {
        sm: ['h-8', 'px-2', 'text-xs'],
        md: ['h-10', 'px-3', 'text-sm'],
        lg: ['h-12', 'px-4', 'text-base'],
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
);

// Card Variants
export const cardVariants = cva(
  [
    'rounded-lg',
    'border',
    'bg-white',
    'text-gray-950',
    'shadow-sm',
  ],
  {
    variants: {
      variant: {
        default: ['border-gray-200'],
        elevated: ['border-gray-200', 'shadow-md'],
        outlined: ['border-gray-300', 'shadow-none'],
      },
      size: {
        sm: ['p-4'],
        md: ['p-6'],
        lg: ['p-8'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Badge Variants
export const badgeVariants = cva(
  [
    'inline-flex',
    'items-center',
    'rounded-full',
    'px-2.5',
    'py-0.5',
    'text-xs',
    'font-medium',
    'transition-colors',
  ],
  {
    variants: {
      variant: {
        default: ['bg-gray-100', 'text-gray-800'],
        primary: ['bg-blue-100', 'text-blue-800'],
        secondary: ['bg-gray-100', 'text-gray-600'],
        success: ['bg-green-100', 'text-green-800'],
        warning: ['bg-yellow-100', 'text-yellow-800'],
        danger: ['bg-red-100', 'text-red-800'],
        notification: ['bg-red-500', 'text-white'],
      },
      size: {
        sm: ['px-1.5', 'py-0.5', 'text-xs'],
        md: ['px-2.5', 'py-0.5', 'text-xs'],
        lg: ['px-3', 'py-1', 'text-sm'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Alert Variants
export const alertVariants = cva(
  [
    'relative',
    'w-full',
    'rounded-lg',
    'border',
    'p-4',
  ],
  {
    variants: {
      variant: {
        default: ['bg-white', 'text-gray-950', 'border-gray-200'],
        info: ['bg-blue-50', 'text-blue-900', 'border-blue-200'],
        success: ['bg-green-50', 'text-green-900', 'border-green-200'],
        warning: ['bg-yellow-50', 'text-yellow-900', 'border-yellow-200'],
        danger: ['bg-red-50', 'text-red-900', 'border-red-200'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Modal Variants
export const modalVariants = cva(
  [
    'relative',
    'bg-white',
    'rounded-lg',
    'shadow-xl',
    'transform',
    'transition-all',
  ],
  {
    variants: {
      size: {
        sm: ['max-w-md'],
        md: ['max-w-lg'],
        lg: ['max-w-4xl'],
        xl: ['max-w-6xl'],
        full: ['max-w-full', 'mx-4'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Export types for TypeScript
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;
export type ModalVariants = VariantProps<typeof modalVariants>;