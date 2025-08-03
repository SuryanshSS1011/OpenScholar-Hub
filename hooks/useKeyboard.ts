import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboard(
  shortcuts: KeyboardShortcut[],
  handler: (shortcut: KeyboardShortcut, event: KeyboardEvent) => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
        const metaMatch = (shortcut.metaKey ?? false) === event.metaKey;
        const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;
        const altMatch = (shortcut.altKey ?? false) === event.altKey;

        return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        handler(matchingShortcut, event);
      }
    },
    [shortcuts, handler, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook for handling escape key
 */
export function useEscapeKey(
  handler: () => void,
  enabled: boolean = true
) {
  useKeyboard(
    [{ key: 'Escape' }],
    () => handler(),
    enabled
  );
}

/**
 * Hook for handling enter key
 */
export function useEnterKey(
  handler: () => void,
  enabled: boolean = true
) {
  useKeyboard(
    [{ key: 'Enter' }],
    () => handler(),
    enabled
  );
}