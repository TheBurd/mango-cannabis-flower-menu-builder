import React from 'react';
import { Theme } from '../types';
import { ToggleSwitch } from './common/ToggleSwitch';

interface FiftyPercentOffToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  theme: Theme;
}

export const FiftyPercentOffToggle: React.FC<FiftyPercentOffToggleProps> = ({
  enabled,
  onToggle,
  theme,
}) => {
  return (
    <div className={`mx-3 mb-3 p-3 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-700 border-gray-600' 
        : 'bg-gray-50 border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
          <div>
            <h4 className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              50% OFF Shelf
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Add a special shelf with half-off pricing display
            </p>
          </div>
        </div>
        <ToggleSwitch
          id="fiftyPercentOffToggle"
          checked={enabled}
          onChange={onToggle}
          label="Enable 50% Off Shelf"
          theme={theme}
        />
      </div>
    </div>
  );
}; 