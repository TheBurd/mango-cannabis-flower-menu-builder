import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../../types';
import { ChevronDownIcon } from './Icon';

interface InventoryStatusOption {
  value: string;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
}

interface InventoryStatusBadgeProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  className?: string;
  disabled?: boolean;
}

const inventoryStatusOptions: InventoryStatusOption[] = [
  { value: '', label: 'Select Status...', color: 'gray' },
  { value: 'In Stock', label: 'In Stock', color: 'green' },
  { value: 'Low Stock', label: 'Low Stock', color: 'yellow' },
  { value: 'Last 5 Units', label: 'Last 5 Units', color: 'orange' },
  { value: 'Last 3 Units', label: 'Last 3 Units', color: 'orange' },
  { value: 'Last Unit', label: 'Last Unit', color: 'red' },
  { value: 'Out of Stock', label: 'Out of Stock', color: 'red' },
];

export const InventoryStatusBadge: React.FC<InventoryStatusBadgeProps> = ({
  value,
  onChange,
  theme,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
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
          handleOptionClick(inventoryStatusOptions[highlightedIndex].value);
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
            prev < inventoryStatusOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : inventoryStatusOptions.length - 1
          );
        }
        break;
    }
  };

  const getStatusColors = (color: InventoryStatusOption['color'], isSelected: boolean = false) => {
    const colors = {
      green: isSelected 
        ? 'bg-green-500 text-white'
        : theme === 'dark' 
          ? 'bg-green-900/30 text-green-300 border-green-500/50'
          : 'bg-green-50 text-green-700 border-green-200',
      yellow: isSelected 
        ? 'bg-yellow-500 text-white'
        : theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      orange: isSelected 
        ? 'bg-orange-500 text-white'
        : theme === 'dark' 
          ? 'bg-orange-900/30 text-orange-300 border-orange-500/50'
          : 'bg-orange-50 text-orange-700 border-orange-200',
      red: isSelected 
        ? 'bg-red-500 text-white'
        : theme === 'dark' 
          ? 'bg-red-900/30 text-red-300 border-red-500/50'
          : 'bg-red-50 text-red-700 border-red-200',
      gray: isSelected 
        ? 'bg-gray-500 text-white'
        : theme === 'dark' 
          ? 'bg-gray-600 text-gray-300 border-gray-500'
          : 'bg-gray-50 text-gray-600 border-gray-300'
    };
    
    return colors[color];
  };

  const getStatusIndicator = (color: InventoryStatusOption['color']) => {
    const indicators = {
      green: '●',
      yellow: '●', 
      orange: '●',
      red: '●',
      gray: '○'
    };
    
    return indicators[color];
  };

  const selectedOption = inventoryStatusOptions.find(option => option.value === value) || inventoryStatusOptions[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full rounded-lg border transition-all duration-150
          flex items-center justify-between px-2.5 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''}
          ${getStatusColors(selectedOption.color)}
        `}
      >
        <div className="flex items-center">
          <span className={`mr-2 text-sm ${
            selectedOption.color === 'green' ? 'text-green-500' :
            selectedOption.color === 'yellow' ? 'text-yellow-500' :
            selectedOption.color === 'orange' ? 'text-orange-500' :
            selectedOption.color === 'red' ? 'text-red-500' :
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {getStatusIndicator(selectedOption.color)}
          </span>
          <span className="truncate">
            {selectedOption.label}
          </span>
        </div>
        
        <ChevronDownIcon 
          className={`w-4 h-4 ml-2 transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-1 w-full rounded-lg shadow-lg border overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-600 border-gray-500'
              : 'bg-white border-gray-300'
          }`}
        >
          <div className="py-1">
            {inventoryStatusOptions.map((option, index) => {
              const isSelected = value === option.value;
              const isHighlighted = highlightedIndex === index;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                    flex items-center
                    ${isSelected 
                      ? 'bg-orange-500 text-white font-medium' 
                      : isHighlighted
                        ? theme === 'dark'
                          ? 'bg-gray-500 text-gray-100'
                          : 'bg-gray-100 text-gray-900'
                        : theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-500 hover:text-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className={`mr-3 text-sm ${
                    isSelected ? 'text-white' :
                    option.color === 'green' ? 'text-green-500' :
                    option.color === 'yellow' ? 'text-yellow-500' :
                    option.color === 'orange' ? 'text-orange-500' :
                    option.color === 'red' ? 'text-red-500' :
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {getStatusIndicator(option.color)}
                  </span>
                  <span>{option.label}</span>
                  {isSelected && (
                    <span className="ml-auto">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};