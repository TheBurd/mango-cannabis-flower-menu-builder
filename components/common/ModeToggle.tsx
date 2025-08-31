import React from 'react';
import { Theme, MenuMode, SupportedStates } from '../../types';

interface ModeToggleProps {
  mode: MenuMode;
  onModeChange: (mode: MenuMode) => void;
  theme?: Theme;
  className?: string;
  currentState?: SupportedStates;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onModeChange,
  theme = 'dark',
  className = '',
  currentState
}) => {
  // Check if Bulk mode is available for current state
  const isBulkModeDisabled = currentState === SupportedStates.NEW_YORK;
  
  const toggleMode = () => {
    if (isBulkModeDisabled && mode === MenuMode.PREPACKAGED) {
      // Cannot switch to Bulk mode in New York
      return;
    }
    onModeChange(mode === MenuMode.BULK ? MenuMode.PREPACKAGED : MenuMode.BULK);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMode();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center ${className}`}>
      {/* Mode Toggle Label */}
      <span className={`text-sm font-medium mr-3 ${
        isDark ? 'text-white/80' : 'text-gray-700'
      }`}>Menu Mode:</span>
      
      {/* Segmented Control */}
      <div 
        className={`relative flex rounded-lg p-1 border ${
          isDark 
            ? 'bg-white/10 border-white/20' 
            : 'bg-gray-100 border-gray-300'
        }`}
        role="tablist"
        aria-label="Menu Mode Toggle"
      >
        {/* Bulk Mode Button */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === MenuMode.BULK}
          aria-controls="bulk-mode-panel"
          onClick={() => onModeChange(MenuMode.BULK)}
          onKeyDown={handleKeyDown}
          disabled={isBulkModeDisabled}
          className={`
            relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors transition-background-color duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
            ${isBulkModeDisabled
              ? 'cursor-not-allowed opacity-50 text-gray-400 bg-gray-200'
              : mode === MenuMode.BULK
                ? isDark
                  ? 'bg-white text-[#f9541a] shadow-sm focus:ring-orange-500'
                  : 'bg-white text-[#f9541a] shadow-sm focus:ring-orange-500'
                : isDark
                  ? 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-orange-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 focus:ring-orange-500'
            }
          `}
          title={isBulkModeDisabled ? "Bulk Flower mode is not available in New York" : "Switch to bulk flower menu mode"}
        >
          Bulk Flower
        </button>
        
        {/* Pre-packaged Mode Button */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === MenuMode.PREPACKAGED}
          aria-controls="pre-packaged-mode-panel"
          onClick={() => onModeChange(MenuMode.PREPACKAGED)}
          onKeyDown={handleKeyDown}
          className={`
            relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors transition-background-color duration-200
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent
            ${mode === MenuMode.PREPACKAGED
              ? isDark
                ? 'bg-white text-[#f9541a] shadow-sm'
                : 'bg-white text-[#f9541a] shadow-sm'
              : isDark
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }
          `}
          title="Switch to pre-packaged menu mode"
        >
          Pre-Packaged
        </button>
      </div>
    </div>
  );
};