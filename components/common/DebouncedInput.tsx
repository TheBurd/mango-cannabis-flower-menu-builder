import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Theme } from '../../types';

interface DebouncedInputProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  onBlur?: (value: string | number | null) => void;
  type?: 'text' | 'number';
  name?: string;
  placeholder?: string;
  className?: string;
  theme: Theme;
  debounceMs?: number;
  step?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  'aria-label'?: string;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  onChange,
  onBlur,
  type = 'text',
  name,
  placeholder,
  className,
  theme,
  debounceMs = 300,
  step,
  autoFocus = false,
  disabled = false,
  min,
  max,
  'aria-label': ariaLabel,
}) => {
  // Internal state for immediate UI updates
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (value === null || value === undefined) return '';
    return String(value);
  });
  
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncedValueRef = useRef<string | number | null>(value);

  // Sync internal value when external value changes (but not during focus)
  useEffect(() => {
    if (!isFocused && value !== lastSyncedValueRef.current) {
      const newValue = value === null || value === undefined ? '' : String(value);
      setInternalValue(newValue);
      lastSyncedValueRef.current = value;
    }
  }, [value, isFocused]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced sync to parent
  const syncToParent = useCallback((newValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      let processedValue: string | number | null;
      
      if (type === 'number') {
        if (newValue === '') {
          processedValue = null;
        } else {
          const numValue = parseFloat(newValue);
          processedValue = isNaN(numValue) ? null : numValue;
        }
      } else {
        processedValue = newValue;
      }

      if (processedValue !== lastSyncedValueRef.current) {
        lastSyncedValueRef.current = processedValue;
        onChange(processedValue);
      }
    }, debounceMs);
  }, [onChange, type, debounceMs]);

  // Immediate sync to parent (for blur events)
  const syncToParentImmediate = useCallback((newValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    let processedValue: string | number | null;
    
    if (type === 'number') {
      if (newValue === '') {
        processedValue = null;
      } else {
        const numValue = parseFloat(newValue);
        processedValue = isNaN(numValue) ? null : numValue;
      }
    } else {
      processedValue = newValue;
    }

    if (processedValue !== lastSyncedValueRef.current) {
      lastSyncedValueRef.current = processedValue;
      onChange(processedValue);
      if (onBlur) {
        onBlur(processedValue);
      }
    }
  }, [onChange, onBlur, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    syncToParent(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    syncToParentImmediate(internalValue);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type={type}
      name={name}
      value={internalValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      step={step}
      disabled={disabled}
      min={min}
      max={max}
      aria-label={ariaLabel}
    />
  );
}; 