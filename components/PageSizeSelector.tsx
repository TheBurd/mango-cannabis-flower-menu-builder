import React from 'react';
import { ArtboardSize, Theme } from '../types';

// Import page size icons - using getIconPath utility for correct path handling
import { getIconPath } from '../utils/assets';

interface PageSizeSelectorProps {
  value: ArtboardSize;
  onChange: (value: ArtboardSize) => void;
  theme: Theme;
  disabled?: boolean;
}

const PAGE_SIZE_CONFIGS = [
  {
    size: ArtboardSize.LETTER_PORTRAIT,
    icon: getIconPath('pagesize-print-portrait.svg'),
    title: '8.5×11" Portrait',
    shortLabel: 'Print Portrait'
  },
  {
    size: ArtboardSize.LETTER_LANDSCAPE,
    icon: getIconPath('pagesize-print-landscape.svg'),
    title: '8.5×11" Landscape',
    shortLabel: 'Print Landscape'
  },
  {
    size: ArtboardSize.SCREEN_16_9_LANDSCAPE,
    icon: getIconPath('pagesize-digital-landscape.svg'),
    title: '16:9 Landscape',
    shortLabel: 'Digital Landscape'
  },
  {
    size: ArtboardSize.SCREEN_16_9_PORTRAIT,
    icon: getIconPath('pagesize-digital-portrait.svg'),
    title: '16:9 Portrait',
    shortLabel: 'Digital Portrait'
  }
];

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  value,
  onChange,
  theme,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-1">
      {PAGE_SIZE_CONFIGS.map((config) => (
        <button
          key={config.size}
          onClick={() => !disabled && onChange(config.size)}
          disabled={disabled}
          title={config.title}
          className={`
            w-8 h-8 p-1.5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${value === config.size
              ? theme === 'dark'
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-blue-500 bg-blue-50'
              : theme === 'dark'
                ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                : 'border-gray-300 bg-gray-100 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <img 
            src={config.icon} 
            alt={config.shortLabel}
            className={`w-full h-full ${
              value === config.size
                ? 'opacity-100'
                : theme === 'dark'
                  ? 'opacity-70'
                  : 'opacity-60'
            }`}
            style={{
              filter: theme === 'dark' 
                ? value === config.size
                  ? 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(207%) hue-rotate(207deg) brightness(106%) contrast(104%)' // Light gray for selected
                  : 'brightness(0) saturate(100%) invert(75%) sepia(11%) saturate(359%) hue-rotate(181deg) brightness(92%) contrast(87%)'   // Medium gray for unselected
                : value === config.size
                  ? 'brightness(0) saturate(100%) invert(15%) sepia(8%) saturate(1497%) hue-rotate(202deg) brightness(100%) contrast(90%)'   // Dark gray for selected
                  : 'brightness(0) saturate(100%) invert(40%) sepia(8%) saturate(607%) hue-rotate(181deg) brightness(96%) contrast(86%)'     // Medium gray for unselected
            }}
          />
        </button>
      ))}
    </div>
  );
};