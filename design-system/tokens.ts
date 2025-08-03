/**
 * Design System Tokens
 * Centralized design values for consistent UI
 */

export const tokens = {
  colors: {
    primary: {
      50: 'rgb(239 246 255)', // blue-50
      100: 'rgb(219 234 254)', // blue-100
      500: 'rgb(59 130 246)', // blue-500
      600: 'rgb(37 99 235)', // blue-600
      700: 'rgb(29 78 216)', // blue-700
      900: 'rgb(30 58 138)', // blue-900
    },
    secondary: {
      50: 'rgb(249 250 251)', // gray-50
      100: 'rgb(243 244 246)', // gray-100
      200: 'rgb(229 231 235)', // gray-200
      300: 'rgb(209 213 219)', // gray-300
      400: 'rgb(156 163 175)', // gray-400
      500: 'rgb(107 114 128)', // gray-500
      600: 'rgb(75 85 99)', // gray-600
      700: 'rgb(55 65 81)', // gray-700
      800: 'rgb(31 41 55)', // gray-800
      900: 'rgb(17 24 39)', // gray-900
    },
    error: {
      50: 'rgb(254 242 242)', // red-50
      100: 'rgb(254 226 226)', // red-100
      500: 'rgb(239 68 68)', // red-500
      600: 'rgb(220 38 38)', // red-600
      700: 'rgb(185 28 28)', // red-700
    },
    success: {
      50: 'rgb(240 253 244)', // green-50
      100: 'rgb(220 252 231)', // green-100
      500: 'rgb(34 197 94)', // green-500
      600: 'rgb(22 163 74)', // green-600
      700: 'rgb(21 128 61)', // green-700
    },
    warning: {
      50: 'rgb(255 251 235)', // yellow-50
      100: 'rgb(254 243 199)', // yellow-100
      500: 'rgb(245 158 11)', // yellow-500
      600: 'rgb(217 119 6)', // yellow-600
      700: 'rgb(180 83 9)', // yellow-700
    },
    white: 'rgb(255 255 255)',
    black: 'rgb(0 0 0)',
    transparent: 'transparent',
  },

  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
  },

  typography: {
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    },
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  zIndex: {
    dropdown: 10,
    modal: 50,
    popover: 30,
    tooltip: 40,
    overlay: 20,
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorKeys = keyof typeof tokens.colors;
export type SpacingKeys = keyof typeof tokens.spacing;