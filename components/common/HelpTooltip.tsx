import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../../types';

interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
  theme: Theme;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  title, 
  content, 
  theme, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when content changes (e.g., when mode switches)
  useEffect(() => {
    setIsOpen(false);
  }, [title, content]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
          ${theme === 'dark'
            ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300 hover:text-white focus:ring-gray-500'
            : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-600 hover:text-gray-800 focus:ring-gray-400'
          }
        `}
        title="Show help"
        aria-label="Show help information"
      >
        ?
      </button>
      
      {isOpen && (
        <div 
          ref={tooltipRef}
          className={`
            absolute bottom-full left-0 mb-3 z-[60]
            w-80 max-w-sm p-4 rounded-lg shadow-2xl border
            ${theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
            }
          `}
          role="tooltip"
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            marginBottom: '12px' // Ensure good spacing from button
          }}
        >
          {/* Arrow */}
          <div 
            className={`
              absolute top-full left-4 
              border-l-8 border-r-8 border-t-8 border-transparent
              ${theme === 'dark' ? 'border-t-gray-800' : 'border-t-white'}
            `}
          />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`
                p-1 rounded text-xs hover:bg-opacity-20 hover:bg-gray-500
                ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              `}
              aria-label="Close help"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};