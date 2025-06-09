
import React from 'react';
import { MANGO_MAIN_ORANGE, MANGO_SUPPORT_ORANGE } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'custom';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow';

  const variantStyles = {
    primary: `bg-gradient-to-r from-[${MANGO_MAIN_ORANGE}] to-[${MANGO_SUPPORT_ORANGE}] text-white hover:opacity-90 focus:ring-[${MANGO_MAIN_ORANGE}]`,
    secondary: 'bg-gray-500 hover:bg-gray-400 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-gray-800 focus:ring-yellow-400',
    custom: '', // Allows full custom styling via className prop
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      type="button"
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
