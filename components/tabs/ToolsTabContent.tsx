import React from 'react';
import { Theme, MenuMode } from '../../types';
import { 
  WrenchIcon, 
  ArrowsUpDownIcon, 
  FunnelIcon, 
  ChartBarIcon,
  ClockIcon,
  TagIcon
} from '../common/Icon';

interface ToolsTabContentProps {
  theme: Theme;
  menuMode: MenuMode;
  onGlobalSort?: (criteria: string) => void;
}

export const ToolsTabContent: React.FC<ToolsTabContentProps> = ({
  theme,
  menuMode,
  onGlobalSort
}) => {
  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500`
    : `${buttonBaseClass} bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  const isBulkMode = menuMode === MenuMode.BULK;

  const sortOptions = isBulkMode 
    ? [
        { key: 'name', label: 'Name (A-Z)', icon: <TagIcon className="w-4 h-4" /> },
        { key: 'grower', label: 'Grower', icon: <ChartBarIcon className="w-4 h-4" /> },
        { key: 'class', label: 'Strain Type', icon: <FunnelIcon className="w-4 h-4" /> },
        { key: 'thc', label: 'THC %', icon: <ArrowsUpDownIcon className="w-4 h-4" /> },
        { key: 'lastjar', label: 'Last Jar', icon: <ClockIcon className="w-4 h-4" /> }
      ]
    : [
        { key: 'name', label: 'Product Name', icon: <TagIcon className="w-4 h-4" /> },
        { key: 'brand', label: 'Brand', icon: <ChartBarIcon className="w-4 h-4" /> },
        { key: 'weight', label: 'Weight Category', icon: <FunnelIcon className="w-4 h-4" /> },
        { key: 'price', label: 'Price', icon: <ArrowsUpDownIcon className="w-4 h-4" /> },
        { key: 'terpenes', label: 'Terpene %', icon: <ClockIcon className="w-4 h-4" /> }
      ];

  return (
    <div className="p-4 space-y-6">
      {/* Global Sorting */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Global Sort Options
        </h3>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sort all {isBulkMode ? 'strains' : 'products'} across all shelves and categories
        </p>
        
        <div className="grid grid-cols-1 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => onGlobalSort?.(option.key)}
              className={secondaryButtonClass}
              title={`Sort by ${option.label}`}
            >
              {option.icon}
              <span>Sort by {option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode-Specific Tools */}
      {isBulkMode ? (
        <div className="space-y-3">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            🌿 Bulk Mode Tools
          </h3>
          
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🏺 Last Jar Management
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage inventory indicators for low-stock strains
              </p>
              <div className="flex space-x-2">
                <button className={`${secondaryButtonClass} flex-1 justify-center text-xs`}>
                  Mark as Last Jar
                </button>
                <button className={`${secondaryButtonClass} flex-1 justify-center text-xs`}>
                  Clear All
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🧬 THC Optimization
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Optimize THC percentage display for better layout
              </p>
              <button className={`${primaryButtonClass} w-full justify-center text-xs`}>
                Optimize THC Display
              </button>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🌱 Grower Grouping
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Group strains by grower for better organization
              </p>
              <button className={`${secondaryButtonClass} w-full justify-center text-xs`}>
                Group by Grower
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            📦 Pre-Pack Mode Tools
          </h3>
          
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                ⚖️ Weight Category Manager
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Organize products by weight categories
              </p>
              <div className="grid grid-cols-4 gap-1">
                {['3.5g', '7g', '14g', '28g'].map((weight) => (
                  <button key={weight} className={`${secondaryButtonClass} justify-center text-xs py-1`}>
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🏷️ Brand Management
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enhance brand visibility and grouping
              </p>
              <button className={`${primaryButtonClass} w-full justify-center text-xs`}>
                Optimize Brand Display
              </button>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                ⚠️ Stock Management
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage low stock and inventory alerts
              </p>
              <div className="flex space-x-2">
                <button className={`${secondaryButtonClass} flex-1 justify-center text-xs`}>
                  Mark Low Stock
                </button>
                <button className={`${secondaryButtonClass} flex-1 justify-center text-xs`}>
                  Clear Alerts
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🌈 Terpene Highlighting
              </h4>
              <p className={`text-xs mt-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Highlight products with notable terpene profiles
              </p>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Highlight &gt;3% terpenes
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Show dominant terpene
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shelf Management */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Shelf Management
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button className={secondaryButtonClass}>
            <FunnelIcon className="w-4 h-4" />
            <span className="text-xs">Jump to Shelf</span>
          </button>
          
          <button className={secondaryButtonClass}>
            <ArrowsUpDownIcon className="w-4 h-4" />
            <span className="text-xs">Reorder Shelves</span>
          </button>
        </div>
      </div>

      {/* Analytics & Reporting */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Analytics & Insights
        </h3>
        
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                {isBulkMode ? '42' : '28'}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {isBulkMode ? 'Active Strains' : 'Products'}
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>
                {isBulkMode ? '8' : '12'}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {isBulkMode ? 'Last Jar' : 'Low Stock'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};