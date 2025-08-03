import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Advanced async hook for handling async operations
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const mountedRef = useRef(true);
  const lastCallIdRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const callId = ++lastCallIdRef.current;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      
      if (mountedRef.current && callId === lastCallIdRef.current) {
        setState({ data, error: null, loading: false });
        onSuccess?.(data);
      }
    } catch (error) {
      if (mountedRef.current && callId === lastCallIdRef.current) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, loading: false });
        onError?.(err);
      }
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}