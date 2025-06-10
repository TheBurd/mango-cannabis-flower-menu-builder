import React from 'react';
import { SupportedStates, Theme } from '../types';
import { MANGO_MAIN_ORANGE, MANGO_SUPPORT_ORANGE, STATE_THC_ICONS } from '../constants';
import { CustomDropdown } from './common/CustomDropdown';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon } from './common/Icon';
import { getLogoPath } from '../utils/assets';

interface HeaderProps {
  appName: string;
  currentState: SupportedStates;
  onStateChange: (newState: SupportedStates) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onShowInstructions: () => void;
  updateAvailable?: boolean;
  onUpdateClick?: () => void;
  updateDownloading?: boolean;
  downloadProgress?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  appName, 
  currentState, 
  onStateChange, 
  theme, 
  onThemeChange, 
  onShowInstructions,
  updateAvailable = false,
  onUpdateClick,
  updateDownloading = false,
  downloadProgress = 0
}) => {
  const stateOptions = Object.values(SupportedStates).map(s => ({ value: s, label: s }));

  return (
    <header 
        className="no-print p-4 flex justify-between items-center text-white shadow-lg"
        style={{ background: `linear-gradient(90deg, ${MANGO_MAIN_ORANGE}, ${MANGO_SUPPORT_ORANGE})`}}
    >
      <div className="flex items-center space-x-3">
        <img 
          src={getLogoPath()} 
          alt="Logo"
          className="h-12 w-auto"
          style={{ 
            filter: 'brightness(0) invert(1)', // Make the logo white
            height: '2.5rem', // Match the text height (text-3xl ≈ 3rem)
            marginBottom: '0.5rem' // Add bottom margin to account for visual weight at bottom
          }}
        />
        <h1 className="text-3xl font-bold tracking-tight" style={{fontFamily: "'Poppins', sans-serif"}}>{appName} v1.0.1 🟢</h1>
        {updateAvailable && (
          <button
            onClick={onUpdateClick}
            className="ml-3 flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse"
            title={updateDownloading ? `Downloading update... ${Math.round(downloadProgress)}%` : "Update Available! Click to download"}
          >
            {updateDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{Math.round(downloadProgress)}%</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Update Available!</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <img 
          src={STATE_THC_ICONS[currentState]} 
          alt={`${currentState} THC Icon`}
          className="w-6 h-6"
        />
        <span className="text-sm font-medium">Region:</span>
        <CustomDropdown
            options={stateOptions}
            value={currentState}
            onChange={(value) => onStateChange(value as SupportedStates)}
            className="min-w-[120px]"
            variant="header"
         />
        <button
          onClick={onShowInstructions}
          className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
          title="Show instructions and help"
        >
          <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5 text-white" />
          ) : (
            <SunIcon className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </header>
  );
};
