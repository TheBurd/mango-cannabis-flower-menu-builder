import React from 'react';
import { MANGO_MAIN_ORANGE } from '../../constants';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; // Optional label text
  disabled?: boolean;
  theme?: 'light' | 'dark';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, disabled, theme = 'dark' }) => {
  return (
    <div className="flex items-center">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`${
          checked ? 'bg-orange-500' : 'bg-gray-500'
        } relative inline-flex items-center h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={checked ? { backgroundColor: MANGO_MAIN_ORANGE } : undefined}
      >
        <span
          aria-hidden="true"
          className={`${
            checked ? 'translate-x-4' : 'translate-x-0'
          } inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      {label && (
        <label htmlFor={id} className={`ml-2 text-sm select-none cursor-pointer ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
    </div>
  );
};
