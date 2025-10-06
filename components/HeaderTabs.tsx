import React, { useState, useEffect, useCallback } from 'react';
import { Theme, MenuMode, SupportedStates } from '../types';
import { WindowControls } from './common/WindowControls';
import { TabContainer, TabItem } from './common/TabContainer';
import { 
  DocumentIcon, 
  PencilIcon, 
  EyeIcon, 
  SparklesIcon, 
  WrenchIcon, 
  Cog6ToothIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from './common/Icon';

// Import tab content components (we'll create these next)
import { FileTabContent } from './tabs/FileTabContent';
import { EditorTabContent } from './tabs/EditorTabContent';
import { ViewTabContent } from './tabs/ViewTabContent';
import { FormatTabContent } from './tabs/FormatTabContent';
import { ToolsTabContent } from './tabs/ToolsTabContent';
import { WindowTabContent } from './tabs/WindowTabContent';
import { APP_VERSION } from '../version';

interface HeaderTabsProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  onStateChange: (state: SupportedStates) => void;
  onMenuModeChange: (mode: MenuMode) => void;
  onThemeChange: (theme: Theme) => void;
  // Add other props as needed for tab functionality
  onExportPNG?: () => void;
  onExportJPEG?: () => void;
  onExportCSV?: () => void;
  onNewMenu?: () => void;
  onOpenCSV?: () => void;
  onAutoFormat?: () => void;
  onClearAll?: () => void;
  onGlobalSort?: (criteria: string) => void;
  className?: string;
}

interface HeaderPreferences {
  activeTab: string;
  pinnedActions: string[];
  showQuickActions: boolean;
  compactMode: boolean;
}

export const HeaderTabs: React.FC<HeaderTabsProps> = ({
  theme,
  menuMode,
  currentState,
  onStateChange,
  onMenuModeChange,
  onThemeChange,
  onExportPNG,
  onExportJPEG,
  onExportCSV,
  onNewMenu,
  onOpenCSV,
  onAutoFormat,
  onClearAll,
  onGlobalSort,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<HeaderPreferences>({
    activeTab: 'file',
    pinnedActions: ['mode-toggle', 'auto-format', 'export'],
    showQuickActions: true,
    compactMode: false
  });

  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    
    // Load preferences from Electron storage
    if (window.electronAPI?.getHeaderPreferences) {
      window.electronAPI.getHeaderPreferences().then(setPreferences);
    }
  }, []);

  const savePreferences = useCallback(async (newPrefs: HeaderPreferences) => {
    setPreferences(newPrefs);
    if (window.electronAPI?.setHeaderPreferences) {
      await window.electronAPI.setHeaderPreferences(newPrefs);
    }
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    savePreferences({
      ...preferences,
      activeTab: tabId
    });
  }, [preferences, savePreferences]);

  // Create tabs based on current mode
  const createTabs = useCallback((): TabItem[] => {
    const commonProps = {
      theme,
      menuMode,
      currentState,
      onStateChange,
      onMenuModeChange,
      onThemeChange,
      preferences,
      onPreferencesChange: savePreferences
    };

    return [
      {
        id: 'file',
        label: 'File',
        icon: <DocumentIcon className="w-4 h-4" />,
        content: (
          <FileTabContent 
            {...commonProps}
            onNewMenu={onNewMenu}
            onOpenCSV={onOpenCSV}
            onExportPNG={onExportPNG}
            onExportJPEG={onExportJPEG}
            onExportCSV={onExportCSV}
          />
        )
      },
      {
        id: 'editor',
        label: menuMode === MenuMode.BULK ? 'Bulk Editor' : 'Pre-Pack Editor',
        icon: <PencilIcon className="w-4 h-4" />,
        content: (
          <EditorTabContent 
            {...commonProps}
            onClearAll={onClearAll}
          />
        )
      },
      {
        id: 'view',
        label: 'View',
        icon: <EyeIcon className="w-4 h-4" />,
        content: <ViewTabContent {...commonProps} />
      },
      {
        id: 'format',
        label: 'Format',
        icon: <SparklesIcon className="w-4 h-4" />,
        content: (
          <FormatTabContent 
            {...commonProps}
            onAutoFormat={onAutoFormat}
          />
        )
      },
      {
        id: 'tools',
        label: 'Tools',
        icon: <WrenchIcon className="w-4 h-4" />,
        content: (
          <ToolsTabContent 
            {...commonProps}
            onGlobalSort={onGlobalSort}
          />
        )
      },
      // Only show Window tab in Electron
      ...(isElectron ? [{
        id: 'window',
        label: 'Window',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        content: <WindowTabContent {...commonProps} />
      }] : [])
    ];
  }, [theme, menuMode, currentState, preferences, isElectron, onStateChange, onMenuModeChange, onThemeChange, savePreferences, onNewMenu, onOpenCSV, onExportPNG, onExportJPEG, onExportCSV, onClearAll, onAutoFormat, onGlobalSort]);

  const tabs = createTabs();

  // Quick actions bar
  const renderQuickActions = () => {
    if (!preferences.showQuickActions) return null;

    return (
      <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick Actions:</span>
        
        {preferences.pinnedActions.includes('mode-toggle') && (
          <button
            onClick={() => onMenuModeChange(menuMode === MenuMode.BULK ? MenuMode.PREPACKAGED : MenuMode.BULK)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-orange-600 text-white hover:bg-orange-500' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            {menuMode === MenuMode.BULK ? 'Switch to Pre-Pack' : 'Switch to Bulk'}
          </button>
        )}

        {preferences.pinnedActions.includes('auto-format') && onAutoFormat && (
          <button
            onClick={onAutoFormat}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 transition-colors"
          >
            <SparklesIcon className="w-3 h-3 inline mr-1" />
            Auto-Format
          </button>
        )}

        {preferences.pinnedActions.includes('export') && (
          <div className="flex space-x-1">
            {onExportPNG && (
              <button
                onClick={onExportPNG}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700 transition-colors"
              >
                PNG
              </button>
            )}
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:hover:bg-purple-700 transition-colors"
              >
                CSV
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Custom title bar with drag region and window controls */}
      {isElectron && (
        <div 
          className={`flex justify-between items-center h-8 px-4 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
          style={{ WebkitAppRegion: 'drag' }}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Mango Cannabis Menu Builder v{APP_VERSION}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              theme === 'dark' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
            }`}>
              {menuMode === MenuMode.BULK ? 'Bulk Mode' : 'Pre-Pack Mode'}
            </span>
          </div>
          <WindowControls theme={theme} />
        </div>
      )}

      {/* Tab navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <TabContainer
          tabs={tabs}
          defaultActiveTab={preferences.activeTab}
          theme={theme}
          onTabChange={handleTabChange}
          className="min-h-0"
        />
      </div>

      {/* Quick actions bar */}
      {renderQuickActions()}
    </div>
  );
};
