import React from 'react';
import { Theme, MenuMode, SupportedStates } from '../types';

interface HeaderTabsDebugProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  className?: string;
}

export const HeaderTabsDebug: React.FC<HeaderTabsDebugProps> = ({
  theme,
  menuMode,
  currentState,
  className = ''
}) => {
  console.log('🎯 HeaderTabsDebug: Rendering...', { theme, menuMode, currentState });

  return (
    <div className={`w-full ${className}`}>
      {/* Simple custom title bar */}
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
            Mango Cannabis Menu Builder v1.1.0 - DEBUG MODE
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            theme === 'dark' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
          }`}>
            {menuMode === MenuMode.BULK ? 'Bulk Mode' : 'Pre-Pack Mode'}
          </span>
        </div>
        
        {/* Simple window controls */}
        <div className="flex space-x-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={() => window.electronAPI?.windowMinimize?.()}
            className="w-6 h-6 bg-yellow-500 rounded-full hover:bg-yellow-600"
            title="Minimize"
          >
            <span className="text-xs">-</span>
          </button>
          <button
            onClick={() => window.electronAPI?.windowMaximize?.()}
            className="w-6 h-6 bg-green-500 rounded-full hover:bg-green-600"
            title="Maximize"
          >
            <span className="text-xs">□</span>
          </button>
          <button
            onClick={() => window.electronAPI?.windowClose?.()}
            className="w-6 h-6 bg-red-500 rounded-full hover:bg-red-600"
            title="Close"
          >
            <span className="text-xs">×</span>
          </button>
        </div>
      </div>

      {/* Simple tab bar */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="flex space-x-4 px-4 py-2">
          <div className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}>
            File
          </div>
          <div className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Editor
          </div>
          <div className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            View
          </div>
          <div className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Format
          </div>
          <div className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Tools
          </div>
          <div className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Window
          </div>
        </div>
      </div>

      {/* Simple content area */}
      <div className="p-4">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          ✅ HeaderTabs Debug Mode Active
        </p>
        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          If you can see this, the basic HeaderTabs structure is working.
        </p>
      </div>
    </div>
  );
};