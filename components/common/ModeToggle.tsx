import React from 'react';
import { Theme, MenuMode } from '../../types';

interface ModeToggleProps {
  mode: MenuMode;
  onModeChange: (mode: MenuMode) => void;
  theme?: Theme;
  className?: string;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onModeChange,
  theme = 'dark',
  className = ''
}) => {
  const toggleMode = () => {
    onModeChange(mode === MenuMode.BULK ? MenuMode.PREPACKAGED : MenuMode.BULK);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMode();
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Mode Toggle Label */}
      <span className="text-sm font-medium text-white/80 mr-3">Menu Mode:</span>
      
      {/* Segmented Control */}
      <div 
        className="relative flex bg-white/10 rounded-lg p-1 border border-white/20"
        role="tablist"
        aria-label="Oklahoma Menu Mode Toggle"
      >
        {/* Bulk Mode Button */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === MenuMode.BULK}
          aria-controls="bulk-mode-panel"
          onClick={() => onModeChange(MenuMode.BULK)}
          onKeyDown={handleKeyDown}
          className={`
            relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors transition-background-color duration-200
            focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
            ${mode === MenuMode.BULK
              ? 'bg-white text-[#f9541a] shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }
          `}
          title="Switch to bulk flower menu mode"
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
            focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
            ${mode === MenuMode.PREPACKAGED
              ? 'bg-white text-[#f9541a] shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
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