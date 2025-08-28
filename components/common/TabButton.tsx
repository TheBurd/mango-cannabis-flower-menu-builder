import React, { forwardRef } from 'react';
import { Theme } from '../../types';

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
  isActive?: boolean;
  icon?: React.ReactNode;
  label: string;
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(({
  theme,
  isActive = false,
  icon,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center gap-2 font-medium transition-colors transition-background-color transition-border-color duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    default: `
      border-b-2 rounded-none
      ${isActive
        ? `border-orange-500 ${theme === 'dark' 
            ? 'text-orange-400 bg-gray-800/50' 
            : 'text-orange-600 bg-orange-50/50'}`
        : `border-transparent ${theme === 'dark'
            ? 'text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:bg-gray-800/30'
            : 'text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`
      }
    `,
    minimal: `
      rounded-md
      ${isActive
        ? `${theme === 'dark'
            ? 'text-orange-400 bg-orange-900/20'
            : 'text-orange-600 bg-orange-50'}`
        : `${theme === 'dark'
            ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
      }
    `,
    pill: `
      rounded-full
      ${isActive
        ? `bg-orange-500 text-white shadow-md`
        : `${theme === 'dark'
            ? 'text-gray-300 hover:text-gray-100 bg-gray-800 hover:bg-gray-700 border border-gray-700'
            : 'text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`
      }
    `,
  };

  const disabledStyles = disabled
    ? theme === 'dark'
      ? 'text-gray-600 cursor-not-allowed'
      : 'text-gray-400 cursor-not-allowed'
    : '';

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabledStyles}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <span className={`flex-shrink-0 ${disabled ? 'opacity-50' : ''}`}>
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
    </button>
  );
});

TabButton.displayName = 'TabButton';