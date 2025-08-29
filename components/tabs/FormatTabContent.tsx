import React, { useState } from 'react';
import { Theme, MenuMode } from '../../types';
import { SparklesIcon, AdjustmentsHorizontalIcon, DocumentTextIcon } from '../common/Icon';

interface FormatTabContentProps {
  theme: Theme;
  menuMode: MenuMode;
  onAutoFormat?: () => void;
}

export const FormatTabContent: React.FC<FormatTabContentProps> = ({
  theme,
  menuMode,
  onAutoFormat
}) => {
  const [isAutoFormatting, setIsAutoFormatting] = useState(false);

  const buttonBaseClass = `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm`;
  
  const primaryButtonClass = theme === 'dark' 
    ? `${buttonBaseClass} bg-green-600 text-white hover:bg-green-500 focus:ring-green-500`
    : `${buttonBaseClass} bg-green-500 text-white hover:bg-green-600 focus:ring-green-400`;

  const secondaryButtonClass = theme === 'dark'
    ? `${buttonBaseClass} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`
    : `${buttonBaseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`;

  const handleAutoFormat = async () => {
    if (onAutoFormat && !isAutoFormatting) {
      setIsAutoFormatting(true);
      try {
        await onAutoFormat();
      } finally {
        // Reset after a short delay to show completion
        setTimeout(() => setIsAutoFormatting(false), 2000);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Auto-Format Section */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Intelligent Formatting
        </h3>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-start space-x-3">
            <SparklesIcon className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Auto-Format Menu
              </h4>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Automatically optimizes layout, font sizes, and spacing for the best fit. 
                Uses intelligent algorithms to balance content density with readability.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAutoFormat}
            disabled={isAutoFormatting}
            className={`${primaryButtonClass} w-full mt-3 ${
              isAutoFormatting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{isAutoFormatting ? 'Formatting...' : 'Auto-Format Now'}</span>
          </button>
        </div>
      </div>

      {/* Manual Format Controls */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Manual Adjustments
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Columns
            </label>
            <select className={`w-full px-3 py-2 rounded-md text-sm ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}>
              <option value="auto">Auto</option>
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Font Size
            </label>
            <select className={`w-full px-3 py-2 rounded-md text-sm ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}>
              <option value="auto">Auto</option>
              <option value="xs">Extra Small</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spacing Controls */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Spacing & Layout
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Line Height: <span className={`font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>1.4x</span>
            </label>
            <input 
              type="range" 
              min="1.0" 
              max="2.0" 
              step="0.1" 
              defaultValue="1.4"
              className="w-full mt-1 accent-orange-500"
            />
          </div>
          
          <div>
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Item Spacing: <span className={`font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="4" 
              step="1" 
              defaultValue="2"
              className="w-full mt-1 accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Mode-Specific Formatting */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {menuMode === MenuMode.BULK ? 'Bulk Mode Formatting' : 'Pre-Pack Mode Formatting'}
        </h3>
        
        {menuMode === MenuMode.BULK ? (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                🧬 THC Percentage Layout
              </h4>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="thc-layout" 
                    defaultChecked 
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Optimize for best fit
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="thc-layout" 
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Always show percentages
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="thc-layout" 
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Hide percentages to save space
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'}`}>
              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                📦 Product Card Layout
              </h4>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Group by weight categories
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Emphasize brand names
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Compact pricing display
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Advanced Options
        </h3>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Prevent text overflow
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Optimize for printing
            </span>
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Maintain aspect ratio
            </span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>

        <button className={secondaryButtonClass}>
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
};