import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icon';
import { MANGO_MAIN_ORANGE } from '../../constants';
import { Theme } from '../../types';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'header' | 'compact';
  theme?: Theme;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  label,
  icon,
  variant = 'default',
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && optionsRef.current && highlightedIndex >= 0) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionClick(options[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full rounded-md shadow-sm 
          text-left cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          transition-colors duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''}
          ${variant === 'compact' 
            ? 'pl-2 pr-2 py-1 text-xs h-[28px] min-h-[28px]' 
            : 'pl-3 pr-8 py-2 text-sm'}
          ${variant === 'header' 
            ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
            : variant === 'compact'
              ? theme === 'dark'
                ? 'bg-gray-600/80 border border-gray-500/80 text-gray-100 hover:bg-gray-500/80'
                : 'bg-white/80 border border-gray-300/80 text-gray-900 hover:bg-gray-50/80'
              : theme === 'dark'
                ? 'bg-gray-600 border border-gray-500 text-gray-100 hover:bg-gray-550'
                : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}
        `}
        style={isOpen ? { borderColor: MANGO_MAIN_ORANGE, boxShadow: `0 0 0 2px ${MANGO_MAIN_ORANGE}20` } : undefined}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        {variant !== 'compact' && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform duration-150 ${
                variant === 'header' 
                  ? 'text-white' 
                  : theme === 'dark' 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              } ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-1 w-full rounded-md shadow-lg max-h-60 overflow-auto ${
            variant === 'header' 
              ? 'bg-white border border-gray-300' 
              : theme === 'dark'
                ? 'bg-gray-600 border border-gray-500'
                : 'bg-white border border-gray-300'
          }`}
          style={{ borderColor: MANGO_MAIN_ORANGE }}
        >
          <div ref={optionsRef} className="py-1">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  relative w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                  ${value === option.value 
                    ? 'bg-orange-500 text-white font-medium' 
                    : highlightedIndex === index
                    ? variant === 'header' 
                      ? 'bg-orange-100 text-gray-800' 
                      : theme === 'dark'
                        ? 'bg-gray-500 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                    : variant === 'header' 
                      ? 'text-gray-700 hover:bg-orange-50' 
                      : theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-500 hover:text-gray-100'
                        : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                style={value === option.value ? { backgroundColor: MANGO_MAIN_ORANGE } : undefined}
              >
                {option.label}
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 