import React, { useState, useEffect, useRef } from 'react';
import { PreviewSettings, HeaderImageSize, Theme, MenuMode } from '../types';
import { CustomDropdown } from './common/CustomDropdown';
import { ToggleSwitch } from './common/ToggleSwitch';
import { PhotoIcon, ColumnAddIcon, FontSizeCustomIcon, LineHeightIcon, SplitScreenIcon, SparklesIcon, ExclamationTriangleIcon } from './common/Icon';

interface PreviewControlsTopProps {
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  theme: Theme;
  isControlsDisabled?: boolean;
  onAutoFormat?: () => void;
  isOptimizing?: boolean;
  hasContentOverflow?: boolean;
}

export const PreviewControlsTop: React.FC<PreviewControlsTopProps> = ({
  settings,
  onSettingsChange,
  theme,
  isControlsDisabled,
  onAutoFormat,
  isOptimizing = false,
  hasContentOverflow = false
}) => {
  const columnOptions = [
    { value: 1, label: '1 Col' },
    { value: 2, label: '2 Cols' },
    { value: 3, label: '3 Cols' },
    { value: 4, label: '4 Cols' },
    { value: 5, label: '5 Cols' },
    { value: 6, label: '6 Cols' },
  ];

  const headerImageSizeOptions = Object.values(HeaderImageSize).map(size => ({
    value: size,
    label: size,
  }));

  const [isFontSizeControlActive, setIsFontSizeControlActive] = useState(false);
  const [fontSizeInputValue, setFontSizeInputValue] = useState<string>(settings.baseFontSizePx.toString());
  const fontSizeControlRef = useRef<HTMLDivElement>(null);
  const fontSizeInputRef = useRef<HTMLInputElement>(null);

  const [isPaddingControlActive, setIsPaddingControlActive] = useState(false);
  const [paddingInputValue, setPaddingInputValue] = useState<string>(settings.linePaddingMultiplier.toString());
  const paddingControlRef = useRef<HTMLDivElement>(null);
  const paddingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFontSizeInputValue(settings.baseFontSizePx.toString());
  }, [settings.baseFontSizePx]);

  useEffect(() => {
    setPaddingInputValue(settings.linePaddingMultiplier.toString());
  }, [settings.linePaddingMultiplier]);

  // Handle clicks outside to close active controls
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFontSizeControlActive && fontSizeControlRef.current && !fontSizeControlRef.current.contains(event.target as Node)) {
        setIsFontSizeControlActive(false);
      }
      if (isPaddingControlActive && paddingControlRef.current && !paddingControlRef.current.contains(event.target as Node)) {
        setIsPaddingControlActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontSizeControlActive, isPaddingControlActive]);

  // Font size control handlers
  const handleFontSizeToggle = () => {
    if (!isControlsDisabled) {
      setIsFontSizeControlActive(!isFontSizeControlActive);
      if (!isFontSizeControlActive) {
        setTimeout(() => fontSizeInputRef.current?.focus(), 0);
      }
    }
  };

  const handleFontSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSizeInputValue(e.target.value);
  };

  const handleFontSizeInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the related target (what we're focusing to) is within our control
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && fontSizeControlRef.current?.contains(relatedTarget)) {
      return; // Don't close if clicking within our control
    }
    
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) {
      setFontSizeInputValue(settings.baseFontSizePx.toString());
    } else {
      const clampedValue = Math.max(6, Math.min(100, value));
      onSettingsChange({ baseFontSizePx: clampedValue });
      setFontSizeInputValue(clampedValue.toString());
    }
    setIsFontSizeControlActive(false);
  };

  // Padding control handlers
  const handlePaddingToggle = () => {
    if (!isControlsDisabled) {
      setIsPaddingControlActive(!isPaddingControlActive);
      if (!isPaddingControlActive) {
        setTimeout(() => paddingInputRef.current?.focus(), 0);
      }
    }
  };

  const handlePaddingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaddingInputValue(e.target.value);
  };

  const handlePaddingInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the related target (what we're focusing to) is within our control
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && paddingControlRef.current?.contains(relatedTarget)) {
      return; // Don't close if clicking within our control
    }
    
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setPaddingInputValue(settings.linePaddingMultiplier.toString());
    } else {
      const clampedValue = Math.max(0.1, Math.min(2.0, value));
      onSettingsChange({ linePaddingMultiplier: clampedValue });
      setPaddingInputValue(clampedValue.toString());
    }
    setIsPaddingControlActive(false);
  };

  return (
    <div className={`no-print p-3 flex items-center justify-between rounded-t-md border-b text-sm ${
      theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-gray-200'
        : 'bg-gray-50 border-gray-300 text-gray-800'
    } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      <div className="flex items-center space-x-4">
        {/* Header Image Size */}
        <div className="flex items-center space-x-2">
          <PhotoIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <CustomDropdown
            options={headerImageSizeOptions}
            value={settings.headerImageSize}
            onChange={isControlsDisabled ? () => {} : (value) => onSettingsChange({ headerImageSize: value as HeaderImageSize })}
            className="min-w-[80px]"
            variant="compact"
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Column Count */}
        <div className="flex items-center space-x-2">
          <ColumnAddIcon className="w-4 h-4" theme={theme} />
          <CustomDropdown
            options={columnOptions}
            value={settings.columns}
            onChange={isControlsDisabled ? () => {} : (value) => onSettingsChange({ columns: parseInt(value.toString(), 10) as PreviewSettings['columns'] })}
            className="min-w-[80px]"
            variant="compact"
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Font Size Control with Floating Slider */}
        <div 
          ref={fontSizeControlRef}
          className="relative flex items-center space-x-2" 
          title="Font size in pixels"
        >
          <FontSizeCustomIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} theme={theme} />
          {isFontSizeControlActive ? (
            <>
              <input
                ref={fontSizeInputRef}
                type="text"
                value={fontSizeInputValue}
                onChange={handleFontSizeInputChange}
                onBlur={handleFontSizeInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setFontSizeInputValue(settings.baseFontSizePx.toString());
                    setIsFontSizeControlActive(false);
                  }
                }}
                className={`w-12 px-1 py-0 text-xs text-center border rounded focus:outline-none focus:ring-1 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
              />
              {/* Floating Slider Tooltip */}
              <div className={`absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-lg z-50 ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600'
                  : 'bg-white border border-gray-300'
              }`}>
                <input
                  type="range"
                  min="6"
                  max="100"
                  value={settings.baseFontSizePx}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value, 10);
                    onSettingsChange({ baseFontSizePx: newValue });
                    setFontSizeInputValue(newValue.toString());
                  }}
                  disabled={isControlsDisabled}
                  className={`w-32 h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-gray-600 [&::-webkit-slider-thumb]:bg-blue-400 [&::-moz-range-thumb]:bg-blue-400'
                      : 'bg-gray-300 [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:bg-blue-600'
                  } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md`}
                />
                <div className={`text-xs text-center mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  6px - 100px
                </div>
              </div>
            </>
          ) : (
            <span 
              className="text-xs font-mono min-w-[30px] text-center cursor-pointer hover:underline"
              onClick={handleFontSizeToggle}
            >
              {settings.baseFontSizePx}px
            </span>
          )}
        </div>

        {/* Line Padding Control with Floating Slider */}
        <div 
          ref={paddingControlRef}
          className="relative flex items-center space-x-2" 
          title="Line padding multiplier"
        >
          <LineHeightIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} theme={theme} />
          {isPaddingControlActive ? (
            <>
              <input
                ref={paddingInputRef}
                type="text"
                value={paddingInputValue}
                onChange={handlePaddingInputChange}
                onBlur={handlePaddingInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setPaddingInputValue(settings.linePaddingMultiplier.toString());
                    setIsPaddingControlActive(false);
                  }
                }}
                className={`w-12 px-1 py-0 text-xs text-center border rounded focus:outline-none focus:ring-1 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-gray-200 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
              />
              {/* Floating Slider Tooltip */}
              <div className={`absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-lg z-50 ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600'
                  : 'bg-white border border-gray-300'
              }`}>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={settings.linePaddingMultiplier}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    onSettingsChange({ linePaddingMultiplier: newValue });
                    setPaddingInputValue(newValue.toString());
                  }}
                  disabled={isControlsDisabled}
                  className={`w-32 h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-gray-600 [&::-webkit-slider-thumb]:bg-green-400 [&::-moz-range-thumb]:bg-green-400'
                      : 'bg-gray-300 [&::-webkit-slider-thumb]:bg-green-600 [&::-moz-range-thumb]:bg-green-600'
                  } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md`}
                />
                <div className={`text-xs text-center mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  0.1 - 2.0
                </div>
              </div>
            </>
          ) : (
            <span 
              className="text-xs font-mono min-w-[30px] text-center cursor-pointer hover:underline"
              onClick={handlePaddingToggle}
            >
              {settings.linePaddingMultiplier}
            </span>
          )}
        </div>

        {/* Auto-Format Button */}
        {onAutoFormat && (
          <div className="flex items-center space-x-2">
            <button
              onClick={isOptimizing ? undefined : onAutoFormat}
              disabled={isControlsDisabled || isOptimizing}
              title={
                isOptimizing 
                  ? "Fast automatic optimization in progress - testing adjustments using real overflow detection"
                  : "Smart auto-format: aggressively increases font size (up to 48px) and line height (up to 1.0) until optimal fit using real overflow feedback"
              }
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${isOptimizing
                  ? theme === 'dark'
                    ? 'bg-blue-900/50 text-blue-300 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 cursor-not-allowed'
                  : hasContentOverflow
                    ? theme === 'dark'
                      ? 'bg-amber-900/30 text-amber-300 border border-amber-500/50 hover:bg-amber-900/50 hover:border-amber-400'
                      : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                    : theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 border border-gray-500 hover:bg-gray-500 hover:text-gray-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }
                ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              {hasContentOverflow ? (
                <ExclamationTriangleIcon className="w-4 h-4" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span className="whitespace-nowrap">
                {isOptimizing ? 'Optimizing...' : 'Auto-Format'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        {/* Shelf Splitting Toggle */}
        <div className="flex items-center space-x-2" title="Allow shelves to split across columns">
          <SplitScreenIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <ToggleSwitch
            id="shelfSplittingToggle"
            checked={!settings.forceShelfFit}
            onChange={(checked) => onSettingsChange({ forceShelfFit: !checked })}
            label="Shelf Splitting"
            theme={theme}
          />
        </div>

        {/* Show Sold Out Toggle */}
        <div className="flex items-center space-x-2" title="Show sold out products in menu">
          <span className="w-4 h-4 flex items-center justify-center text-red-500 text-sm">✕</span>
          <ToggleSwitch
            id="showSoldOutToggle"
            checked={settings.showSoldOutProducts}
            onChange={(checked) => onSettingsChange({ showSoldOutProducts: checked })}
            label="Show Sold Out"
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};