import React, { useState, useEffect } from 'react';
import { Theme } from '../../types';

interface WindowControlsProps {
  theme: Theme;
  className?: string;
}

// Window control icons
const MinimizeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M0 5h10" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

const MaximizeIcon: React.FC<{ className?: string; isMaximized?: boolean }> = ({ 
  className = '', 
  isMaximized = false 
}) => (
  <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none">
    {isMaximized ? (
      // Restore icon (two overlapping squares)
      <>
        <path d="M2 2h6v6H2V2z" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M0 0h6v6" stroke="currentColor" strokeWidth="1" fill="none"/>
      </>
    ) : (
      // Maximize icon (single square)
      <path d="M0 0h10v10H0V0z" stroke="currentColor" strokeWidth="1" fill="none"/>
    )}
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const WindowControls: React.FC<WindowControlsProps> = ({ theme, className = '' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    
    // Get initial maximized state
    if (window.electronAPI?.windowIsMaximized) {
      window.electronAPI.windowIsMaximized().then(setIsMaximized);
    }
  }, []);

  // Don't render in web version
  if (!isElectron) {
    return null;
  }

  const handleMinimize = async () => {
    if (window.electronAPI?.windowMinimize) {
      await window.electronAPI.windowMinimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI?.windowMaximize) {
      const newMaximizedState = await window.electronAPI.windowMaximize();
      setIsMaximized(newMaximizedState);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI?.windowClose) {
      await window.electronAPI.windowClose();
    }
  };

  const baseButtonClass = `
    flex items-center justify-center w-8 h-8 transition-colors duration-150
    hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30
  `;

  const isDark = theme === 'dark';

  return (
    <div className={`flex ${className}`} style={{ WebkitAppRegion: 'no-drag' }}>
      {/* Minimize */}
      <button
        onClick={handleMinimize}
        className={`${baseButtonClass} ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
        title="Minimize"
        aria-label="Minimize window"
      >
        <MinimizeIcon className="w-3 h-3" />
      </button>

      {/* Maximize/Restore */}
      <button
        onClick={handleMaximize}
        className={`${baseButtonClass} ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
        title={isMaximized ? "Restore" : "Maximize"}
        aria-label={isMaximized ? "Restore window" : "Maximize window"}
      >
        <MaximizeIcon className="w-3 h-3" isMaximized={isMaximized} />
      </button>

      {/* Close */}
      <button
        onClick={handleClose}
        className={`${baseButtonClass} hover:bg-red-500 hover:text-white text-white/80`}
        title="Close"
        aria-label="Close window"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    </div>
  );
};