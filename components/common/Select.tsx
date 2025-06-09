
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  itemClassName?: string; // For styling individual options if needed (though limited by native select)
}

export const Select: React.FC<SelectProps> = ({ options, className = '', itemClassName='', ...props }) => {
  return (
    <select
      className={`border border-gray-600 bg-gray-700 text-gray-100 rounded-md shadow-sm py-1.5 px-2 text-sm focus:ring-orange-500 focus:border-orange-500 transition-colors ${className}`}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value} className={itemClassName || 'bg-gray-700 text-gray-100'}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
