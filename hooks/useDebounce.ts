import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that returns a debounced version of a value.
 * Updates to the debounced value are delayed by the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer on value change or unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that returns a debounced callback function.
 * The callback will only be executed after the delay has passed
 * since the last invocation.
 *
 * @param callback - The callback function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Custom hook for debouncing preview updates specifically.
 * Provides immediate updates for certain changes (like page navigation)
 * while debouncing content changes.
 *
 * @param shelves - The shelves data to debounce
 * @param contentDelay - Delay for content changes (default 150ms)
 * @returns Debounced shelves data
 */
export function useDebouncedPreview<T>(
  shelves: T,
  contentDelay: number = 150
): T {
  const [debouncedShelves, setDebouncedShelves] = useState<T>(shelves);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Immediate update on first render or when shelves is empty array
    if (isFirstRenderRef.current || (Array.isArray(shelves) && shelves.length === 0)) {
      isFirstRenderRef.current = false;
      setDebouncedShelves(shelves);
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up debounced update for content changes
    timeoutRef.current = setTimeout(() => {
      setDebouncedShelves(shelves);
    }, contentDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [shelves, contentDelay]);

  return debouncedShelves;
}

/**
 * Custom hook for debouncing settings changes.
 * Provides shorter delay for settings vs content changes.
 *
 * @param settings - The settings object to debounce
 * @param delay - Delay for settings changes (default 50ms)
 * @returns Debounced settings
 */
export function useDebouncedSettings<T>(
  settings: T,
  delay: number = 50
): T {
  return useDebounce(settings, delay);
}
