import React, { useState } from 'react';
import { Theme, MenuMode, SupportedStates } from '../types';
import { MANGO_MAIN_ORANGE, MANGO_SUPPORT_ORANGE, STATE_THC_ICONS } from '../constants';
import { CustomDropdown } from './common/CustomDropdown';
import { ModeToggle } from './common/ModeToggle';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon, HamburgerMenuIcon, MangoIcon } from './common/Icon';
import { getLogoPath } from '../utils/assets';

interface HeaderTabsSimpleProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  className?: string;
  // All the header functionality props
  onStateChange: (newState: SupportedStates) => void;
  onThemeChange: (theme: Theme) => void;
  onMenuModeChange: (mode: MenuMode) => void;
  onShowInstructions: () => void;
  onShowWhatsNew: () => void;
  hasViewedWhatsNew: boolean;
  appName: string;
  // Tab functionality props
  onExportPNG?: () => void;
  onExportJPEG?: () => void;
  onExportCSV?: () => void;
  onNewMenu?: () => void;
  onOpenCSV?: () => void;
  onAutoFormat?: () => void;
  onClearAll?: () => void;
  onGlobalSort?: (criteria: string) => void;
  // Additional handlers for enhanced menu functionality
  onClearAllShelves?: () => void;
  onClearAllLastJars?: () => void;
  onClearAllSoldOut?: () => void;
  onAddStrain?: (shelfId?: string) => void;
  onCheckUpdates?: () => void;
  onJumpToShelf?: (shelfId: string) => void;
  shelves?: { id: string; name: string }[]; // For jump to shelf functionality
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
  // Project menu
  onShowProjectMenu?: () => void;
}

export const HeaderTabsSimple: React.FC<HeaderTabsSimpleProps> = ({
  theme,
  menuMode,
  currentState,
  className = '',
  onStateChange,
  onThemeChange,
  onMenuModeChange,
  onShowInstructions,
  onShowWhatsNew,
  hasViewedWhatsNew,
  appName,
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
  shelves = [],
  hasUnsavedWork = false,
  hasSoldOutItems = false,
  onToggleFiftyPercentOff,
  fiftyPercentOffEnabled = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWindow,
  onResetAppData,
  onShowProjectMenu
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isElectron, setIsElectron] = useState(false);
  const stateOptions = Object.values(SupportedStates).map(s => ({ value: s, label: s }));

  // Detect if running in Electron
  React.useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  // Handler for new menu with unsaved work warning
  const handleNewMenu = async () => {
    if (hasUnsavedWork && window.electronAPI?.showConfirmDialog) {
      const confirmed = await window.electronAPI.showConfirmDialog(
        'Create New Menu',
        'You have unsaved changes. Creating a new menu will discard these changes. Do you want to continue?'
      );
      if (!confirmed) return;
    }
    onNewMenu?.();
  };

  // Handler for switch mode with unsaved work warning
  const handleSwitchMode = async () => {
    if (hasUnsavedWork && window.electronAPI?.showConfirmDialog) {
      const confirmed = await window.electronAPI.showConfirmDialog(
        'Switch Menu Mode',
        'You have unsaved changes. Switching modes may affect your current work. Do you want to continue?'
      );
      if (!confirmed) return;
    }
    onMenuModeChange(menuMode === MenuMode.BULK ? MenuMode.PREPACKAGED : MenuMode.BULK);
  };

  // Handler for clear operations with confirmation
  const handleClearWithConfirm = async (action: () => void, title: string, message: string) => {
    if (window.electronAPI?.showConfirmDialog) {
      const confirmed = await window.electronAPI.showConfirmDialog(title, message);
      if (confirmed) action();
    } else {
      action();
    }
  };

  // Handler for reset app data - no confirmation here, App.tsx handles it
  const handleResetAppData = () => {
    onResetAppData?.();
  };

  // Enhanced menu system based on user specifications
  const tabs = [
    {
      name: 'File',
      items: [
        { 
          label: `Switch to ${menuMode === MenuMode.BULK ? 'Pre-Pack' : 'Bulk Flower'} Mode`, 
          onClick: handleSwitchMode,
          hotkey: 'Ctrl+M',
          disabled: currentState === SupportedStates.NEW_YORK && menuMode === MenuMode.PREPACKAGED
        },
        { 
          label: 'Switch State', 
          submenu: stateOptions.map(option => ({
            label: option.label,
            onClick: () => onStateChange(option.value),
            checked: currentState === option.value
          }))
        },
        { type: 'separator' },
        { label: 'Export Menu', submenu: [
          { label: 'Export as PNG', onClick: onExportPNG, hotkey: 'Ctrl+Shift+P' },
          { label: 'Export as JPEG', onClick: onExportJPEG, hotkey: 'Ctrl+Shift+J' },
        ]}
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Add Strain', onClick: () => onAddStrain?.(), hotkey: 'Ctrl+Shift+A' },
        { type: 'separator' },
        { 
          label: 'Global Sort', 
          submenu: [
            { label: 'Sort by Name', onClick: () => onGlobalSort?.('name') },
            { label: 'Sort by Grower', onClick: () => onGlobalSort?.('grower') },
            { label: 'Sort by Class', onClick: () => onGlobalSort?.('type') },
            { label: 'Sort by THC%', onClick: () => onGlobalSort?.('thc') },
            { label: `Sort by ${menuMode === MenuMode.PREPACKAGED ? 'Low Stock' : 'Last Jar'}`, onClick: () => onGlobalSort?.('isLastJar') },
            { label: 'Sort by Sold Out', onClick: () => onGlobalSort?.('isSoldOut') },
          ]
        },
        { type: 'separator' },
        { 
          label: 'Clear All Shelves', 
          onClick: () => handleClearWithConfirm(
            () => onClearAllShelves?.(),
            'Clear All Shelves',
            'This will clear all items from all shelves. This action cannot be undone.'
          )
        },
        { 
          label: `Clear All ${menuMode === MenuMode.PREPACKAGED ? 'Low Stock' : 'Last Jars'}`, 
          onClick: () => handleClearWithConfirm(
            () => onClearAllLastJars?.(),
            `Clear All ${menuMode === MenuMode.PREPACKAGED ? 'Low Stock' : 'Last Jars'}`,
            `This will remove the "${menuMode === MenuMode.PREPACKAGED ? 'Low Stock' : 'Last Jar'}" indicator from all items. This action cannot be undone.`
          )
        },
        { 
          label: 'Clear All Sold Out', 
          onClick: () => handleClearWithConfirm(
            () => onClearAllSoldOut?.(),
            'Clear All Sold Out',
            'This will remove the "Sold Out" status from all items. This action cannot be undone.'
          ),
          disabled: !hasSoldOutItems
        },
      ]
    },
    {
      name: 'View',
      items: [
        { 
          label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
          onClick: () => onThemeChange(theme === 'dark' ? 'light' : 'dark'), 
          hotkey: 'Ctrl+T' 
        },
        { type: 'separator' },
        ...(menuMode === MenuMode.BULK ? [{
          label: `${fiftyPercentOffEnabled ? 'Hide' : 'Show'} 50% OFF Shelf`,
          onClick: () => onToggleFiftyPercentOff?.(!fiftyPercentOffEnabled),
          hotkey: 'Ctrl+5'
        }] : []),
        { 
          label: 'Jump to Shelf', 
          submenu: shelves.map(shelf => ({
            label: shelf.name,
            onClick: () => onJumpToShelf?.(shelf.id)
          })),
          disabled: shelves.length === 0
        },
        { type: 'separator' },
        { label: 'Zoom In', onClick: onZoomIn, hotkey: 'Ctrl++' },
        { label: 'Zoom Out', onClick: onZoomOut, hotkey: 'Ctrl+-' },
        { label: 'Reset Zoom', onClick: onResetZoom, hotkey: 'Ctrl+\\' },
        { type: 'separator' },
        { label: 'Fit Menu to Window', onClick: onFitToWindow, hotkey: 'Ctrl+F' },
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'Check for Updates', onClick: onCheckUpdates, hotkey: 'Ctrl+U' },
        { type: 'separator' },
        { label: 'Reset App Data', onClick: handleResetAppData, hotkey: 'Ctrl+Shift+R' },
        { type: 'separator' },
        { label: 'Instructions', onClick: onShowInstructions, hotkey: 'F1' },
        { label: 'About Mango Cannabis Flower Menu Builder', onClick: onShowWhatsNew },
      ]
    }
  ];

  const handleTabClick = (tabName: string) => {
    setActiveTab(activeTab === tabName ? null : tabName);
  };

  const handleClickOutside = () => {
    setActiveTab(null);
  };

  // Enhanced dropdown renderer with submenu support
  const renderDropdownContent = (items: any[]) => {
    return items.map((item, index) => {
      if (item.type === 'separator') {
        return (
          <div
            key={index}
            className={`my-1 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}
          />
        );
      }
      
      if (item.submenu) {
        return (
          <div key={index} className="relative group">
            <div
              className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
                item.disabled
                  ? isDark
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-xs">▶</span>
            </div>
            {/* Submenu */}
            <div
              className={`absolute left-full top-0 min-w-48 py-2 shadow-lg border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              {item.submenu.map((subItem: any, subIndex: number) => (
                <button
                  key={subIndex}
                  onClick={() => {
                    if (!subItem.disabled && subItem.onClick) {
                      subItem.onClick();
                      setActiveTab(null);
                    }
                  }}
                  disabled={subItem.disabled}
                  className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
                    subItem.disabled
                      ? isDark
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : isDark
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  } ${subItem.checked ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                >
                  <span>{subItem.checked ? '✓ ' : ''}{subItem.label}</span>
                  {subItem.hotkey && (
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {subItem.hotkey}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled && item.onClick) {
              item.onClick();
              setActiveTab(null);
            }
          }}
          disabled={item.disabled}
          className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
            item.disabled
              ? isDark
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-400 cursor-not-allowed'
              : isDark
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{item.label}</span>
          {item.hotkey && (
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.hotkey}
            </span>
          )}
        </button>
      );
    });
  };

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
      
      <div className={`w-full ${className}`} onClick={handleClickOutside}>
        {/* Enhanced tab bar positioned above orange header */}
        <div className={`relative border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex justify-between items-center">
            {/* Left side - Hamburger menu + Tab buttons */}
            <div className="flex items-center space-x-1 px-4">
              {/* Hamburger Menu Button - Only show in Electron (production) */}
              {onShowProjectMenu && isElectron && (
                <button
                  onClick={onShowProjectMenu}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                  title="Project menu"
                  style={{ WebkitAppRegion: 'no-drag' }}
                >
                  <HamburgerMenuIcon className="w-5 h-5" />
                </button>
              )}
              
              {/* Tab buttons */}
              {tabs.map((tab) => (
                <div key={tab.name} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClick(tab.name);
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.name
                        ? isDark
                          ? 'text-orange-400 bg-gray-800/50'
                          : 'text-orange-600 bg-orange-50/50'
                        : isDark
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.name}
                  </button>
                  
                  {/* Enhanced dropdown menu with submenu support */}
                  {activeTab === tab.name && (
                    <div
                      className={`absolute top-full left-0 mt-0 min-w-48 py-2 shadow-lg border z-50 ${
                        isDark
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderDropdownContent(tab.items)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Right side - State selector and mode toggle moved from original header */}
            <div className="flex items-center space-x-4 px-4 py-2" style={{ WebkitAppRegion: 'no-drag' }}>
              {/* Mode Toggle */}
              <ModeToggle
                mode={menuMode}
                onModeChange={onMenuModeChange}
                theme={theme}
                currentState={currentState}
              />
              
              {/* State Selector */}
              <div className="flex items-center space-x-2">
                <img 
                  src={STATE_THC_ICONS[currentState]} 
                  alt={`${currentState} THC Icon`}
                  className="w-5 h-5"
                />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Region:
                </span>
                <CustomDropdown
                  options={stateOptions}
                  value={currentState}
                  onChange={(value) => onStateChange(value as SupportedStates)}
                  className="min-w-[120px]"
                  variant="header"
                  theme={theme}
                />
              </div>
              
              {/* Theme toggle */}
              <button
                onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className={`p-1.5 rounded transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'light' ? (
                  <MoonIcon className="w-4 h-4" />
                ) : (
                  <SunIcon className="w-4 h-4" />
                )}
              </button>
              
              {/* Instructions button */}
              <button
                onClick={onShowInstructions}
                className={`p-1.5 rounded transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title="Show instructions and help"
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Orange header bar positioned below tabs */}
        <div 
          className="p-4 flex justify-between items-center text-white shadow-lg"
          style={{ 
            background: `linear-gradient(90deg, ${MANGO_MAIN_ORANGE}, ${MANGO_SUPPORT_ORANGE})`,
            WebkitAppRegion: 'drag'
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button - Only show in browser/dev (not Electron) */}
              {onShowProjectMenu && !isElectron && (
                <button
                  onClick={onShowProjectMenu}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white/80 hover:text-white"
                  title="Project menu"
                  style={{ WebkitAppRegion: 'no-drag' }}
                >
                  <HamburgerMenuIcon className="w-6 h-6" />
                </button>
              )}
              <h1 className="text-3xl font-bold tracking-tight flex items-center" style={{fontFamily: "'Poppins', sans-serif"}}>
                <MangoIcon className="w-10 h-10 mr-3 text-white" />
                {appName} v1.1.1
              </h1>
            </div>
            <button
              onClick={onShowWhatsNew}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white/80 hover:text-white ${
                !hasViewedWhatsNew ? 'animate-pulse shadow-lg shadow-white/20' : ''
              }`}
              style={!hasViewedWhatsNew ? {
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)',
                animation: 'subtle-glow 2s ease-in-out infinite alternate'
              } : undefined}
              title="See what's new in v1.1.1"
            >
              What's New
            </button>
          </div>
          
          <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' }}>
            <span className="text-sm opacity-75">
              {menuMode === MenuMode.BULK ? '🌿 Bulk Mode' : '📦 Pre-Pack Mode'} • {currentState}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};