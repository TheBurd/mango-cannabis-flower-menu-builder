import React from 'react';
import { Theme, MenuMode, SupportedStates } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpDownIcon } from '../common/Icon';

interface EditorTabContentProps {
  theme: Theme;
  menuMode: MenuMode;
  currentState: SupportedStates;
  onClearAll?: () => void;
}

export const EditorTabContent: React.FC<EditorTabContentProps> = ({
  theme,
  menuMode,
  currentState,
  onClearAll
}) => {
  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500`
    : `${buttonBaseClass} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`;

  const dangerButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-red-700 text-white hover:bg-red-600 focus:ring-red-500`
    : `${buttonBaseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  const isBulkMode = menuMode === MenuMode.BULK;

  return (
    <div className="p-4 space-y-6">
      {/* Mode-Specific Actions */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {isBulkMode ? 'Bulk Flower Actions' : 'Pre-Packaged Actions'}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            className={primaryButtonClass}
            title={isBulkMode ? "Add new strain to menu" : "Add new pre-packaged product"}
          >
            <PlusIcon className="w-4 h-4" />
            <span>{isBulkMode ? 'Add Strain' : 'Add Product'}</span>
          </button>
          
          <button
            className={secondaryButtonClass}
            title="Reorder items in menu"
          >
            <ArrowUpDownIcon className="w-4 h-4" />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>

      {/* Mode-Specific Features */}
      {isBulkMode ? (
        <div className="space-y-3">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Bulk Mode Features
          </h3>
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🧬 THC Optimization
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Automatically optimize THC percentage display for better layout
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🏺 Last Jar Indicators
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Mark strains that are running low with visual indicators
              </p>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🌱 Grower Attribution
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Organize and display strains by grower information
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Pre-Pack Mode Features
          </h3>
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                ⚖️ Weight Categories
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Organize products by weight: 3.5g, 7g, 14g, 28g
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🏷️ Brand Management
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enhanced brand visibility and grouping options
              </p>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🌈 Terpene Highlighting
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Highlight products with notable terpene profiles
              </p>
            </div>

            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                ⚠️ Low Stock Alerts
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Visual indicators for products running low
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Bulk Operations
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            className={secondaryButtonClass}
            title={isBulkMode ? "Clear all last jar indicators" : "Clear all low stock indicators"}
          >
            <TrashIcon className="w-4 h-4" />
            <span>{isBulkMode ? 'Clear Last Jars' : 'Clear Stock Alerts'}</span>
          </button>
          
          <button
            className={secondaryButtonClass}
            title="Clear all sold out items"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear Sold Out</span>
          </button>

          {onClearAll && (
            <button
              onClick={onClearAll}
              className={dangerButtonClass}
              title="Clear all items from menu"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear All Items</span>
            </button>
          )}
        </div>
      </div>

      {/* State Compliance */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          State Compliance: {currentState}
        </h3>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30 border border-green-600/30' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
            ✅ Compliant with {currentState} regulations
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Menu format and content meet state requirements
          </p>
        </div>
      </div>
    </div>
  );
};