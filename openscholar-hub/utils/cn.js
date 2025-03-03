// A simple utility for constructing class names conditionally
// Adapted from clsx or classnames libraries

export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }