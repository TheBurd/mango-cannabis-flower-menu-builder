import React from 'react';
import { Theme, MenuMode, SupportedStates } from '../../types';
import { DocumentIcon, FolderOpenIcon, ArrowDownTrayIcon, DocumentPlusIcon } from '../common/Icon';

interface FileTabContentProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  onNewMenu?: () => void;
  onOpenCSV?: () => void;
  onExportPNG?: () => void;
  onExportJPEG?: () => void;
  onExportCSV?: () => void;
}

export const FileTabContent: React.FC<FileTabContentProps> = ({
  theme,
  menuMode,
  onNewMenu,
  onOpenCSV,
  onExportPNG,
  onExportJPEG,
  onExportCSV
}) => {
  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-orange-600 text-white hover:bg-orange-500 focus:ring-orange-500`
    : `${buttonBaseClass} bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  const exportButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-green-700 text-white hover:bg-green-600 focus:ring-green-500`
    : `${buttonBaseClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-400`;

  return (
    <div className="p-4 space-y-6">
      {/* Quick Actions Section */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {onNewMenu && (
            <button
              onClick={onNewMenu}
              className={primaryButtonClass}
              title="Create a new menu (Ctrl+N)"
            >
              <DocumentPlusIcon className="w-4 h-4" />
              <span>New Menu</span>
            </button>
          )}
          
          {onOpenCSV && (
            <button
              onClick={onOpenCSV}
              className={secondaryButtonClass}
              title="Open CSV file (Ctrl+O)"
            >
              <FolderOpenIcon className="w-4 h-4" />
              <span>Open CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Export Options
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {onExportPNG && (
            <button
              onClick={onExportPNG}
              className={exportButtonClass}
              title="Export menu as PNG image"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export as PNG</span>
              <span className={`text-xs opacity-70 ml-auto`}>
                Alt+Shift+P
              </span>
            </button>
          )}
          
          {onExportJPEG && (
            <button
              onClick={onExportJPEG}
              className={exportButtonClass}
              title="Export menu as JPEG image"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export as JPEG</span>
              <span className={`text-xs opacity-70 ml-auto`}>
                Alt+Shift+J
              </span>
            </button>
          )}
          
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className={exportButtonClass}
              title="Export menu data as CSV"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export as CSV</span>
              <span className={`text-xs opacity-70 ml-auto`}>
                Alt+Shift+C
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Recent Files
        </h3>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No recent files available
          </p>
        </div>
      </div>

      {/* Mode Information */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Current Mode
        </h3>
        <div className={`p-3 rounded-lg ${
          menuMode === MenuMode.BULK 
            ? (theme === 'dark' ? 'bg-blue-900/30 border border-blue-600/30' : 'bg-blue-50 border border-blue-200')
            : (theme === 'dark' ? 'bg-purple-900/30 border border-purple-600/30' : 'bg-purple-50 border border-purple-200')
        }`}>
          <p className={`text-sm font-medium ${
            menuMode === MenuMode.BULK
              ? (theme === 'dark' ? 'text-blue-300' : 'text-blue-800')
              : (theme === 'dark' ? 'text-purple-300' : 'text-purple-800')
          }`}>
            {menuMode === MenuMode.BULK ? '🌿 Bulk Flower Mode' : '📦 Pre-Packaged Mode'}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {menuMode === MenuMode.BULK 
              ? 'Managing loose flower strains with THC percentages and grower information'
              : 'Managing pre-packaged products with weight categories and brand information'
            }
          </p>
        </div>
      </div>
    </div>
  );
};