import React from 'react';
import { Theme, MenuMode, SupportedStates } from '../../types';
import { 
  EyeIcon, 
  SunIcon, 
  MoonIcon, 
  MagnifyingGlassIcon,
  RectangleStackIcon,
  RectangleGroupIcon
} from '../common/Icon';

interface ViewTabContentProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  onThemeChange: (theme: Theme) => void;
}

export const ViewTabContent: React.FC<ViewTabContentProps> = ({
  theme,
  menuMode,
  currentState,
  onThemeChange
}) => {
  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-purple-600 text-white hover:bg-purple-500 focus:ring-purple-500`
    : `${buttonBaseClass} bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  const toggleButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-yellow-600 text-white hover:bg-yellow-500 focus:ring-yellow-500`
    : `${buttonBaseClass} bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400`;

  const pageFormatButtons = [
    { id: 'print-portrait', label: 'Print Portrait', icon: '📄' },
    { id: 'print-landscape', label: 'Print Landscape', icon: '📃' },
    { id: 'digital-landscape', label: 'Digital Landscape', icon: '💻' },
    { id: 'digital-portrait', label: 'Digital Portrait', icon: '📱' }
  ];

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="p-4 space-y-6">
      {/* Theme Controls */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Appearance
        </h3>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={toggleButtonClass}
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="w-4 h-4" />
              <span>Switch to Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4" />
              <span>Switch to Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Page Format Selection */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Page Format
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {pageFormatButtons.map((format) => (
            <button
              key={format.id}
              className={secondaryButtonClass}
              title={`Switch to ${format.label} format`}
            >
              <span className="text-lg">{format.icon}</span>
              <span className="text-xs">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Zoom Level
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {zoomLevels.map((level) => (
            <button
              key={level}
              className={`${secondaryButtonClass} justify-center px-2 py-1`}
              title={`Set zoom to ${level}%`}
            >
              <span className="text-xs">{level}%</span>
            </button>
          ))}
        </div>
        <button
          className={primaryButtonClass}
          title="Fit menu to window size (Ctrl+F)"
        >
          <RectangleStackIcon className="w-4 h-4" />
          <span>Fit to Window</span>
        </button>
      </div>

      {/* Navigation Features */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Navigation
        </h3>
        <div className="space-y-2">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              🧭 Scroll Navigation Overlay
            </h4>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Shows current strain/product name while scrolling
            </p>
            <div className="mt-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enable scroll overlay
                </span>
              </label>
            </div>
          </div>

          <button
            className={secondaryButtonClass}
            title="Jump to specific shelf or section"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span>Jump to Section</span>
          </button>
        </div>
      </div>

      {/* View Options */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Display Options
        </h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Show shelf headers
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Show {menuMode === MenuMode.BULK ? 'THC percentages' : 'terpene percentages'}
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {menuMode === MenuMode.BULK ? 'Show grower info' : 'Show brand info'}
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Show state compliance icon
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Mode-Specific View Options */}
      {menuMode === MenuMode.BULK ? (
        <div className="space-y-2">
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            🌿 Bulk Mode View Options
          </h4>
          <div className="space-y-2 ml-4">
            <label className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Last jar indicators
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Strain type badges
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            📦 Pre-Pack Mode View Options
          </h4>
          <div className="space-y-2 ml-4">
            <label className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight category headers
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Low stock indicators
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Pricing display
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};