import React, { useState, useRef, useEffect } from 'react';
import { StrainType, Theme } from '../../types';
import { STRAIN_TYPES_ORDERED, STRAIN_TYPE_VISUALS } from '../../constants';
import { ChevronDownIcon } from './Icon';

interface StrainTypeDropdownProps {
  value: StrainType;
  onChange: (type: StrainType) => void;
  disabled?: boolean;
  theme: Theme;
  className?: string;
  onOpenChange?: (isOpen: boolean) => void; // Notify parent when dropdown opens/closes
}

export const StrainTypeDropdown: React.FC<StrainTypeDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  theme,
  className = '',
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        onOpenChange?.(false); // Notify parent that dropdown is closed
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
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      setHighlightedIndex(-1);
      onOpenChange?.(newIsOpen); // Notify parent of dropdown state change
    }
  };

  const handleOptionClick = (type: StrainType) => {
    onChange(type);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onOpenChange?.(false); // Notify parent that dropdown is closed
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionClick(STRAIN_TYPES_ORDERED[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        onOpenChange?.(false); // Notify parent that dropdown is closed
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < STRAIN_TYPES_ORDERED.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : STRAIN_TYPES_ORDERED.length - 1
          );
        }
        break;
    }
  };

  // Create strain type chip component
  const StrainTypeChip: React.FC<{ type: StrainType; size?: 'small' | 'normal' }> = ({ type, size = 'normal' }) => {
    const visual = STRAIN_TYPE_VISUALS[type];
    const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
    
    const style: React.CSSProperties = {
      background: visual.gradient || visual.primaryColor,
      backgroundColor: visual.primaryColor, // Fallback
    };

    return (
      <div
        className={`${sizeClasses} rounded-md font-medium inline-flex items-center justify-center min-w-[28px] ${visual.textColorClass}`}
        style={style}
      >
        {visual.acronym}
      </div>
    );
  };

  return (
    <div className={`relative ${className} ${isOpen ? 'z-[9999]' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full rounded-md border transition-colors duration-150
          flex items-center justify-between px-2 py-1.5
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''}
          ${theme === 'dark'
            ? 'bg-gray-500 border-gray-400 hover:bg-gray-400'
            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
          }
        `}
      >
        <div className="flex items-center">
          <StrainTypeChip type={value} size="small" />
          <span className={`ml-2 text-sm ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {value.replace('-Hybrid', ' Hybrid')}
          </span>
        </div>
        
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-150 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          } ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-[9999] mt-1 w-full rounded-md shadow-lg border overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-600 border-gray-500'
              : 'bg-white border-gray-300'
          }`}
        >
          <div className="py-1">
            {STRAIN_TYPES_ORDERED.map((type, index) => {
              const isSelected = value === type;
              const isHighlighted = highlightedIndex === index;
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleOptionClick(type)}
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
                  <StrainTypeChip type={type} size="small" />
                  <span className="ml-3">
                    {type.replace('-Hybrid', ' Hybrid')}
                  </span>
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