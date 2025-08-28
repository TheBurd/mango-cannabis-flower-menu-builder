import React, { useState, useEffect } from 'react';
import { PreviewSettings, ArtboardSize, Theme, SupportedStates } from '../types';
import { STATE_THC_ICONS } from '../constants';
import { ToggleSwitch } from './common/ToggleSwitch';
import { IconButton } from './common/IconButton';
import { PageSizeSelector } from './PageSizeSelector';
import { ZoomInIcon, ZoomOutIcon, ArrowsExpandIcon, RewindIcon } from './common/Icon';

const getScaledValue = (base: number, multiplier: number, min: number = 0): number =>
  Math.max(min, base * multiplier);

interface PreviewControlsBottomProps {
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWindow: () => void;
  onResetZoom: () => void;
  currentZoom: number;
  theme: Theme;
  currentState: SupportedStates;
  isControlsDisabled?: boolean;
}

export const PreviewControlsBottom: React.FC<PreviewControlsBottomProps> = ({
  settings,
  onSettingsChange,
  onZoomIn,
  onZoomOut,
  onFitToWindow,
  onResetZoom,
  currentZoom,
  theme,
  currentState,
  isControlsDisabled
}) => {
  const [zoomInputValue, setZoomInputValue] = useState((currentZoom * 100).toFixed(0));

  useEffect(() => {
    setZoomInputValue((currentZoom * 100).toFixed(0));
  }, [currentZoom]);

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInputValue(e.target.value); 
  };
  
  const handleZoomInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setZoomInputValue((currentZoom * 100).toFixed(0));
    } else {
      const clampedValue = Math.max(5, Math.min(1000, value));
      const zoomLevel = clampedValue / 100;
      onSettingsChange({ zoomLevel });
      setZoomInputValue(clampedValue.toFixed(0));
    }
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setZoomInputValue((currentZoom * 100).toFixed(0));
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`no-print p-3 flex items-center justify-between rounded-b-md border-t text-sm ${
      theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-gray-200'
        : 'bg-gray-50 border-gray-300 text-gray-800'
    } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Left Section - Page Size */}
      <div className="flex items-center space-x-3">
        <span className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Page Size
        </span>
        <PageSizeSelector
          value={settings.artboardSize}
          onChange={(value) => onSettingsChange({ artboardSize: value })}
          theme={theme}
          disabled={isControlsDisabled}
        />
      </div>

      {/* Center Section - Footer Controls */}
      <div className="flex items-center space-x-6">
        {/* THC Icon Toggle */}
        <div className="flex items-center space-x-2" title="Show THC regulatory icon">
          <img 
            src={STATE_THC_ICONS[currentState]}
            alt={`${currentState} THC Icon`}
            className="w-4 h-4 opacity-70"
          />
          <ToggleSwitch
            id="showThcIconToggle"
            checked={settings.showThcIcon}
            onChange={(checked) => onSettingsChange({ showThcIcon: checked })}
            label="Show THC Icon"
            theme={theme}
          />
        </div>

        {/* Menu Date Toggle */}
        <div className="flex items-center space-x-2" title="Show menu date in footer">
          <span className="w-4 h-4 flex items-center justify-center text-gray-500 text-sm">📅</span>
          <ToggleSwitch
            id="showMenuDateToggle"
            checked={settings.showMenuDate}
            onChange={(checked) => {
              if (checked && !settings.menuDateText.trim()) {
                // Auto-populate with today's date when enabling and no text exists
                const today = new Date();
                const month = today.toLocaleDateString('en-US', { month: 'long' });
                const day = today.getDate();
                const year = today.getFullYear();
                const currentDate = `${month} ${day}, ${year}`;
                onSettingsChange({ 
                  showMenuDate: checked,
                  menuDateText: `Updated: ${currentDate}`
                });
              } else {
                onSettingsChange({ showMenuDate: checked });
              }
            }}
            label=""
            theme={theme}
          />
        </div>

        {/* Date Text Input (conditional) */}
        {settings.showMenuDate && (
          <div className="flex items-center space-x-2" title="Menu date text to display in footer">
            <input
              type="text"
              value={settings.menuDateText}
              onChange={(e) => onSettingsChange({ menuDateText: e.target.value })}
              className={`
                px-3 py-1 text-sm border rounded focus:outline-none focus:ring-1
                ${theme === 'dark' 
                  ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }
              `}
              placeholder="Enter date text..."
              style={{ minWidth: '180px' }}
            />
          </div>
        )}
      </div>

      {/* Right Section - Zoom Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={zoomInputValue}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyDown={handleZoomInputKeyDown}
            disabled={isControlsDisabled}
            className={`w-12 px-1 py-0.5 text-xs text-center border rounded focus:outline-none focus:ring-1 ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            } ${isControlsDisabled ? 'opacity-50' : ''}`}
          />
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
        </div>

        <div className="flex items-center space-x-1">
          <IconButton
            onClick={onZoomOut}
            disabled={isControlsDisabled}
            title="Zoom Out"
            className={`w-8 h-8 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ZoomOutIcon className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={onZoomIn}
            disabled={isControlsDisabled}
            title="Zoom In"
            className={`w-8 h-8 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ZoomInIcon className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={onFitToWindow}
            disabled={isControlsDisabled}
            title="Fit to Window"
            className={`w-8 h-8 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ArrowsExpandIcon className="w-4 h-4" />
          </IconButton>

          <IconButton
            onClick={onResetZoom}
            disabled={isControlsDisabled}
            title="Reset Zoom & Pan"
            className={`w-8 h-8 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <RewindIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};