import React, { useState, useEffect } from 'react';
import { SupportedStates, Theme, MenuMode } from '../types';
import { MANGO_MAIN_ORANGE, MANGO_SUPPORT_ORANGE, STATE_THC_ICONS } from '../constants';
import { CustomDropdown } from './common/CustomDropdown';
import { ModeToggle } from './common/ModeToggle';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon } from './common/Icon';
import { getLogoPath } from '../utils/assets';
// Testing just the import without usage
// import { HeaderTabs } from './HeaderTabs';
// import { HeaderTabsDebug } from './HeaderTabsDebug';
import { HeaderTabsSimple } from './HeaderTabsSimple';

interface HeaderProps {
  appName: string;
  currentState: SupportedStates;
  onStateChange: (newState: SupportedStates) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onShowInstructions: () => void;
  onShowWhatsNew: () => void;
  hasViewedWhatsNew: boolean;
  menuMode: MenuMode;
  onMenuModeChange: (mode: MenuMode) => void;
  // New props for header tab functionality
  onExportPNG?: () => void;
  onExportJPEG?: () => void;
  onExportCSV?: () => void;
  onNewMenu?: () => void;
  onOpenCSV?: () => void;
  onAutoFormat?: () => void;
  onClearAll?: () => void;
  onGlobalSort?: (criteria: string) => void;
  // Additional enhanced menu props
  onClearAllShelves?: () => void;
  onClearAllLastJars?: () => void;
  onClearAllSoldOut?: () => void;
  onAddStrain?: (shelfId?: string) => void;
  onCheckUpdates?: () => void;
  onJumpToShelf?: (shelfId: string) => void;
  shelves?: { id: string; name: string }[];
  hasUnsavedWork?: boolean;
  hasSoldOutItems?: boolean;
  // Additional functionality
  onToggleFiftyPercentOff?: (enabled: boolean) => void;
  fiftyPercentOffEnabled?: boolean;
  // Zoom functionality
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFitToWindow?: () => void;
  // Reset functionality
  onResetAppData?: () => void;
  // Header tabs control
  enableHeaderTabs?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  appName, 
  currentState, 
  onStateChange, 
  theme, 
  onThemeChange, 
  onShowInstructions,
  onShowWhatsNew,
  hasViewedWhatsNew,
  menuMode,
  onMenuModeChange,
  onExportPNG,
  onExportJPEG,
  onExportCSV,
  onNewMenu,
  onOpenCSV,
  onAutoFormat,
  onClearAll,
  onGlobalSort,
  onClearAllShelves,
  onClearAllLastJars,
  onClearAllSoldOut,
  onAddStrain,
  onCheckUpdates,
  onJumpToShelf,
  shelves,
  hasUnsavedWork,
  hasSoldOutItems,
  onToggleFiftyPercentOff,
  fiftyPercentOffEnabled,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWindow,
  onResetAppData,
  enableHeaderTabs = false
}) => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron and enable header tabs by default in Electron
    const electronDetected = typeof window !== 'undefined' && !!window.electronAPI;
    setIsElectron(electronDetected);
  }, []);
  const stateOptions = Object.values(SupportedStates).map(s => ({ value: s, label: s }));

  // Test with actual electron detection
  if (isElectron || enableHeaderTabs) {
    return (
      <HeaderTabsSimple
        theme={theme}
        menuMode={menuMode}
        currentState={currentState}
        className="no-print"
        onStateChange={onStateChange}
        onThemeChange={onThemeChange}
        onMenuModeChange={onMenuModeChange}
        onShowInstructions={onShowInstructions}
        onShowWhatsNew={onShowWhatsNew}
        hasViewedWhatsNew={hasViewedWhatsNew}
        appName={appName}
        onExportPNG={onExportPNG}
        onExportJPEG={onExportJPEG}
        onExportCSV={onExportCSV}
        onNewMenu={onNewMenu}
        onOpenCSV={onOpenCSV}
        onAutoFormat={onAutoFormat}
        onClearAll={onClearAll}
        onGlobalSort={onGlobalSort}
        onClearAllShelves={onClearAllShelves}
        onClearAllLastJars={onClearAllLastJars}
        onClearAllSoldOut={onClearAllSoldOut}
        onAddStrain={onAddStrain}
        onCheckUpdates={onCheckUpdates}
        onJumpToShelf={onJumpToShelf}
        shelves={shelves}
        hasUnsavedWork={hasUnsavedWork}
        hasSoldOutItems={hasSoldOutItems}
        onToggleFiftyPercentOff={onToggleFiftyPercentOff}
        fiftyPercentOffEnabled={fiftyPercentOffEnabled}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
        onFitToWindow={onFitToWindow}
        onResetAppData={onResetAppData}
      />
    );
  }

  // Original header for web version
  return (
    <>
      {/* CSS Animation for subtle glow */}
      <style>{`
        @keyframes subtle-glow {
          0% {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.15);
          }
        }
      `}</style>
      
      <header 
          className="no-print p-4 flex justify-between items-center text-white shadow-lg"
          style={{ background: `linear-gradient(90deg, ${MANGO_MAIN_ORANGE}, ${MANGO_SUPPORT_ORANGE})`}}
      >
      <div className="flex items-center space-x-4">
        <img 
          src={getLogoPath()} 
          alt="Logo"
          className="h-12 w-auto"
          style={{ 
            filter: 'brightness(0) invert(1)',
            height: '2.5rem',
            marginBottom: '0.5rem'
          }}
        />
        <h1 className="text-3xl font-bold tracking-tight" style={{fontFamily: "'Poppins', sans-serif"}}>
          {appName} v1.1.0
        </h1>
        <button
          onClick={onShowWhatsNew}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white/80 hover:text-white ${
            !hasViewedWhatsNew ? 'animate-pulse shadow-lg shadow-white/20' : ''
          }`}
          style={!hasViewedWhatsNew ? {
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)',
            animation: 'subtle-glow 2s ease-in-out infinite alternate'
          } : undefined}
                      title="See what's new in v1.1.0"
        >
          What's New
        </button>
      </div>
      <div className="flex items-center space-x-4">
        {/* Mode Toggle - Available for all states */}
        <ModeToggle
          mode={menuMode}
          onModeChange={onMenuModeChange}
          theme={theme}
        />
        
        {/* State Selector */}
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
        </div>
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
    </>
  );
};
