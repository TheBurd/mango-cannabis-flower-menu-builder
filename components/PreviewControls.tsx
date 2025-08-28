import React, { useState, useEffect, useRef } from 'react';
import { PreviewSettings, ArtboardSize, HeaderImageSize, SupportedStates, Theme, MenuMode } from '../types'; 
import { STATE_THC_ICONS } from '../constants';
import { CustomDropdown } from './common/CustomDropdown';
import { IconButton } from './common/IconButton';
import { ToggleSwitch } from './common/ToggleSwitch';
import { ZoomInIcon, ZoomOutIcon, ArrowsExpandIcon, RewindIcon, DocumentTextIcon, PhotoIcon, ColumnAddIcon, FontSizeCustomIcon, LineHeightIcon, SplitScreenIcon } from './common/Icon'; 

interface PreviewControlsProps {
  settings: PreviewSettings; 
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWindow: () => void;
  onResetZoom: () => void;
  currentZoom: number;
  onDirectZoomChange: (newZoom: number) => void;
  currentState: SupportedStates;
  theme: Theme;
  onAutoFormat?: () => void;
  hasContentOverflow?: boolean;
  isOptimizing?: boolean;
  isControlsDisabled?: boolean;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  settings,
  onSettingsChange,
  onZoomIn,
  onZoomOut,
  onFitToWindow,
  onResetZoom,
  currentZoom,
  onDirectZoomChange,
  currentState,
  theme,
  onAutoFormat,
  hasContentOverflow,
  isOptimizing,
  isControlsDisabled
}) => {
  const artboardSizeOptions = Object.values(ArtboardSize).map(size => ({
    value: size,
    label: size, 
  }));

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

  const [isTerpeneControlActive, setIsTerpeneControlActive] = useState(false);
  const [isInventoryControlActive, setIsInventoryControlActive] = useState(false);
  const [isNetWeightControlActive, setIsNetWeightControlActive] = useState(false);
  const [isPrePackagedHelpActive, setIsPrePackagedHelpActive] = useState(false);
  const terpeneControlRef = useRef<HTMLDivElement>(null);
  const inventoryControlRef = useRef<HTMLDivElement>(null);
  const netWeightControlRef = useRef<HTMLDivElement>(null);
  const prePackagedHelpRef = useRef<HTMLDivElement>(null); 

  const [zoomInputValue, setZoomInputValue] = useState((currentZoom * 100).toFixed(0));

  useEffect(() => {
    setFontSizeInputValue(settings.baseFontSizePx.toString());
  }, [settings.baseFontSizePx]);

  useEffect(() => {
    setPaddingInputValue(settings.linePaddingMultiplier.toString());
  }, [settings.linePaddingMultiplier]);

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
        onDirectZoomChange(value / 100); 
    }
  };

  const handleZoomInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const value = parseFloat(zoomInputValue);
         if (!isNaN(value) && value > 0) {
            onDirectZoomChange(value / 100);
        } else {
            setZoomInputValue((currentZoom * 100).toFixed(0));
        }
        (e.target as HTMLInputElement).blur();
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontSizeControlRef.current && !fontSizeControlRef.current.contains(event.target as Node)) {
        setIsFontSizeControlActive(false);
      }
      if (paddingControlRef.current && !paddingControlRef.current.contains(event.target as Node)) {
        setIsPaddingControlActive(false);
      }
      if (terpeneControlRef.current && !terpeneControlRef.current.contains(event.target as Node)) {
        setIsTerpeneControlActive(false);
      }
      if (inventoryControlRef.current && !inventoryControlRef.current.contains(event.target as Node)) {
        setIsInventoryControlActive(false);
      }
      if (netWeightControlRef.current && !netWeightControlRef.current.contains(event.target as Node)) {
        setIsNetWeightControlActive(false);
      }
      if (prePackagedHelpRef.current && !prePackagedHelpRef.current.contains(event.target as Node)) {
        setIsPrePackagedHelpActive(false);
      }
    };
    if (isFontSizeControlActive || isPaddingControlActive || isTerpeneControlActive || isInventoryControlActive || isNetWeightControlActive || isPrePackagedHelpActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontSizeControlActive, isPaddingControlActive, isTerpeneControlActive, isInventoryControlActive, isNetWeightControlActive, isPrePackagedHelpActive]);

  const handleFontSizeButtonClick = () => {
    const newActiveState = !isFontSizeControlActive;
    setIsFontSizeControlActive(newActiveState);
    if (newActiveState) {
      setFontSizeInputValue(settings.baseFontSizePx.toString());
       setTimeout(() => fontSizeInputRef.current?.focus(), 0); 
    }
  };

  const handleFontSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFontSizeInputValue(val);
    const newSize = parseFloat(val);
    if (!isNaN(newSize) && newSize > 0) {
      onSettingsChange({ baseFontSizePx: newSize });
    }
  };
  
  const handleFontSizeInputBlur = () => {
    const currentSize = parseFloat(fontSizeInputValue);
    if (isNaN(currentSize) || currentSize <=0) {
        setFontSizeInputValue(settings.baseFontSizePx.toString());
    } else {
        onSettingsChange({baseFontSizePx: parseFloat(currentSize.toFixed(1))});
    }
  };

  const handlePaddingButtonClick = () => {
    const newActiveState = !isPaddingControlActive;
    setIsPaddingControlActive(newActiveState);
    if (newActiveState) {
      setPaddingInputValue(settings.linePaddingMultiplier.toString());
       setTimeout(() => paddingInputRef.current?.focus(), 0); 
    }
  };

  const handlePaddingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaddingInputValue(val);
    const newPadding = parseFloat(val);
    if (!isNaN(newPadding) && newPadding >= 0) {
      onSettingsChange({ linePaddingMultiplier: newPadding });
    }
  };
  
  const handlePaddingInputBlur = () => {
    const currentPadding = parseFloat(paddingInputValue);
    if (isNaN(currentPadding) || currentPadding < 0) {
        setPaddingInputValue(settings.linePaddingMultiplier.toString());
    } else {
        onSettingsChange({linePaddingMultiplier: parseFloat(currentPadding.toFixed(2))});
    }
  };


  return (
    <div className={`no-print p-3 flex items-center justify-between rounded-t-md border-b text-sm ${
      theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-gray-200'
        : 'bg-gray-50 border-gray-300 text-gray-800'
    } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
        {/* Layout Settings Group */}
        <div className={`flex items-center space-x-4 px-3 py-2 rounded-md border h-[36px] ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
          <CustomDropdown
              options={artboardSizeOptions}
              value={settings.artboardSize}
              onChange={isControlsDisabled ? () => {} : (value) => onSettingsChange({ artboardSize: value as ArtboardSize })}
              className="min-w-[180px]"
              icon={<DocumentTextIcon className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              variant="compact"
              theme={theme}
              disabled={isControlsDisabled}
          />

          <CustomDropdown
              options={headerImageSizeOptions}
              value={settings.headerImageSize}
              onChange={isControlsDisabled ? () => {} : (value) => onSettingsChange({ headerImageSize: value as HeaderImageSize })}
              className="min-w-[90px]"
              icon={<PhotoIcon className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              variant="compact"
              theme={theme}
              disabled={isControlsDisabled}
          />
          
          <CustomDropdown
              options={columnOptions}
              value={settings.columns}
              onChange={isControlsDisabled ? () => {} : (value) => onSettingsChange({ columns: parseInt(value.toString(), 10) as PreviewSettings['columns'] })}
              className="min-w-[80px]"
              icon={<ColumnAddIcon className="w-3 h-3" theme={theme} />}
              variant="compact"
              theme={theme}
              disabled={isControlsDisabled}
          />
        </div>

        {/* Typography Settings Group */}
        <div className={`flex items-center space-x-3 px-3 py-2 rounded-md border h-[36px] ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
          <div className="relative" ref={fontSizeControlRef}>
              <div 
                  onClick={!isFontSizeControlActive ? handleFontSizeButtonClick : undefined} 
                  className={`flex items-center space-x-1 py-1 px-2 text-xs rounded-md h-[26px] ${!isFontSizeControlActive ? 'cursor-pointer' : ''} ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
              >
                  <FontSizeCustomIcon className="w-4 h-4" title="Base Font Size" theme={theme} />
                  {isFontSizeControlActive ? (
                      <input
                          ref={fontSizeInputRef}
                          type="number"
                          value={fontSizeInputValue}
                          onChange={handleFontSizeInputChange}
                          onBlur={handleFontSizeInputBlur} 
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur();}}
                          className={`w-12 p-0.5 rounded-sm text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            theme === 'dark'
                              ? 'bg-gray-500 text-gray-100 placeholder-gray-400'
                              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
                          }`}
                          step="0.5"
                          min="1" 
                      />
                  ) : (
                      <span onClick={handleFontSizeButtonClick} className="cursor-pointer">{settings.baseFontSizePx}px</span>
                  )}
              </div>

              {isFontSizeControlActive && (
                  <div className={`absolute left-0 top-full mt-1 w-48 p-3 rounded-md shadow-xl z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border border-gray-500'
                      : 'bg-white border border-gray-300'
                  }`}>
                      <div className="flex items-center justify-between mb-1">
                          <label htmlFor="font-size-slider" className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Base Font Size</label>
                          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{parseFloat(settings.baseFontSizePx.toFixed(1))}px</span>
                      </div>
                      <input
                          type="range"
                          id="font-size-slider"
                          min="8"  
                          max="48" 
                          step="0.5" 
                          value={settings.baseFontSizePx}
                          onChange={(e) => {
                              const newSize = parseFloat(e.target.value);
                              onSettingsChange({ baseFontSizePx: newSize });
                              setFontSizeInputValue(newSize.toString()); 
                          }}
                          className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>
              )}
          </div>

          <div className="relative" ref={paddingControlRef}>
              <div 
                  onClick={!isPaddingControlActive ? handlePaddingButtonClick : undefined} 
                  className={`flex items-center space-x-1 py-1 px-2 text-xs rounded-md h-[26px] ${!isPaddingControlActive ? 'cursor-pointer' : ''} ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
              >
                  <LineHeightIcon className="w-4 h-4" title="Line Padding" theme={theme} />
                  {isPaddingControlActive ? (
                      <input
                          ref={paddingInputRef}
                          type="number"
                          value={paddingInputValue}
                          onChange={handlePaddingInputChange}
                          onBlur={handlePaddingInputBlur} 
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur();}}
                          className={`w-12 p-0.5 rounded-sm text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            theme === 'dark'
                              ? 'bg-gray-500 text-gray-100 placeholder-gray-400'
                              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
                          }`}
                          step="0.1"
                          min="0" 
                      />
                  ) : (
                      <span onClick={handlePaddingButtonClick} className="cursor-pointer">{settings.linePaddingMultiplier.toFixed(1)}</span>
                  )}
              </div>

              {isPaddingControlActive && (
                  <div className={`absolute left-0 top-full mt-1 w-48 p-3 rounded-md shadow-xl z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border border-gray-500'
                      : 'bg-white border border-gray-300'
                  }`}>
                      <div className="flex items-center justify-between mb-1">
                          <label htmlFor="padding-slider" className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Line Padding</label>
                          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{parseFloat(settings.linePaddingMultiplier.toFixed(2))}</span>
                      </div>
                      <input
                          type="range"
                          id="padding-slider"
                          min="0.1"  
                          max="1.0" 
                          step="0.05" 
                          value={settings.linePaddingMultiplier}
                          onChange={(e) => {
                              const newPadding = parseFloat(e.target.value);
                              onSettingsChange({ linePaddingMultiplier: newPadding });
                              setPaddingInputValue(newPadding.toString()); 
                          }}
                          className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>
              )}
          </div>
          
          {/* Auto-Format Button */}
          {onAutoFormat && (
            <button
              onClick={isOptimizing ? undefined : () => { console.log('Auto-format clicked with SparkleOutlineIcon'); onAutoFormat(); }}
              disabled={isOptimizing}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isOptimizing
                  ? theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : hasContentOverflow 
                    ? theme === 'dark'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              title={isOptimizing ? "Fast optimization in progress using binary search" : "Smart auto-format: Optimizes font size and line height for perfect fit using binary search"}
            >
              <span className="text-xl">✨</span>
              <span>{isOptimizing ? 'Optimizing...' : '✨ Auto-Format Menu'}</span>
            </button>
          )}
        </div>

        {/* Display Options Group */}
        <div className={`flex items-center space-x-4 px-3 py-2 rounded-md border h-[36px] ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
          <div className="flex items-center space-x-1" title="Allow shelves to split across columns">
              <SplitScreenIcon className="w-4 h-4" theme={theme} />
              <ToggleSwitch
                id="forceShelfFitToggle"
                checked={!settings.forceShelfFit}
                onChange={(checked) => onSettingsChange({ forceShelfFit: !checked })}
                label="Allow Shelf Splitting"
                theme={theme}
              />
          </div>

          <div className="flex items-center space-x-1" title={`Show ${currentState} THC regulatory icon`}>
              <img 
                src={STATE_THC_ICONS[currentState]}
                alt={`${currentState} THC Icon`}
                className="w-5 h-5"
                style={{ marginRight: '5px' }}
              />
              <ToggleSwitch
                id="showThcIconToggle"
                checked={settings.showThcIcon}
                onChange={(checked) => onSettingsChange({ showThcIcon: checked })}
                label="Show THC Icon"
                theme={theme}
              />
          </div>

          <div className="flex items-center space-x-1" title="Show menu date in footer">
              <span className="w-5 h-5 flex items-center justify-center text-gray-500 text-sm">📅</span>
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
                label="Show Menu Date"
                theme={theme}
              />
          </div>

          {settings.showMenuDate && (
            <div className="flex items-center space-x-1" title="Menu date text to display in footer">
                <span className="w-5 h-5 flex items-center justify-center text-gray-500 text-sm">✏️</span>
                <input
                  type="text"
                  value={settings.menuDateText}
                  onChange={(e) => onSettingsChange({ menuDateText: e.target.value })}
                  className={`
                    px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1
                    ${theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    }
                  `}
                  placeholder="Enter date text..."
                  style={{ minWidth: '150px' }}
                />
            </div>
          )}

          <div className="flex items-center space-x-1" title="Show sold out products in menu">
              <span className="w-5 h-5 flex items-center justify-center text-red-500 text-sm">❌</span>
              <ToggleSwitch
                id="showSoldOutToggle"
                checked={settings.showSoldOutProducts}
                onChange={(checked) => onSettingsChange({ showSoldOutProducts: checked })}
                label="Show Sold Out"
                theme={theme}
              />
          </div>
        </div>
        
        {/* Pre-packaged Mode Specific Controls */}
        {settings.menuMode === MenuMode.PREPACKAGED && (
          <div className={`flex items-center space-x-4 px-3 py-2 rounded-md border h-[36px] ${
            theme === 'dark'
              ? 'bg-gray-600/30 border-gray-600/50'
              : 'bg-gray-100/50 border-gray-300/50'
          }`}>
            {/* Advanced Terpenes Control Group */}
            <div className="relative" ref={terpeneControlRef}>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v2H9V7zm0 3h2v5H9v-5z"/>
                </svg>
                <ToggleSwitch
                  id="showTerpenesToggle"
                  checked={settings.showTerpenes ?? true}
                  onChange={(checked) => onSettingsChange({ showTerpenes: checked })}
                  label="Terpenes"
                  theme={theme}
                />
                <button
                  onClick={() => setIsTerpeneControlActive(!isTerpeneControlActive)}
                  className={`p-1 rounded-md transition-colors ${
                    isTerpeneControlActive 
                      ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                      : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                  }`}
                  title="Advanced terpene display options"
                >
                  <ChevronDownIcon className={`w-3 h-3 transition-transform ${
                    isTerpeneControlActive ? 'transform rotate-180' : ''
                  }`} />
                </button>
              </div>
              
              {isTerpeneControlActive && (
                <div className={`absolute left-0 top-full mt-1 w-64 p-4 rounded-md shadow-xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border border-gray-500'
                    : 'bg-white border border-gray-300'
                }`}>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Highlight Threshold ({settings.terpeneHighlightThreshold || 2.0}%)
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={settings.terpeneHighlightThreshold || 2.0}
                        onChange={(e) => onSettingsChange({ terpeneHighlightThreshold: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.5%</span>
                        <span>5.0%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Display Format
                      </label>
                      <select
                        value={settings.terpeneDisplayFormat || 'percentage'}
                        onChange={(e) => onSettingsChange({ terpeneDisplayFormat: e.target.value as 'percentage' | 'decimal' | 'both' })}
                        className={`w-full px-2 py-1 rounded text-xs ${
                          theme === 'dark'
                            ? 'bg-gray-500 text-gray-100 border-gray-400'
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                      >
                        <option value="percentage">2.5%</option>
                        <option value="decimal">0.025</option>
                        <option value="both">2.5% (0.025)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`w-px h-5 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
            
            {/* Advanced Inventory Control Group */}
            <div className="relative" ref={inventoryControlRef}>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <ToggleSwitch
                  id="showInventoryStatusToggle"
                  checked={settings.showInventoryStatus ?? true}
                  onChange={(checked) => onSettingsChange({ showInventoryStatus: checked })}
                  label="Inventory"
                  theme={theme}
                />
                <button
                  onClick={() => setIsInventoryControlActive(!isInventoryControlActive)}
                  className={`p-1 rounded-md transition-colors ${
                    isInventoryControlActive 
                      ? theme === 'dark' ? 'bg-orange-600' : 'bg-orange-500'
                      : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                  }`}
                  title="Advanced inventory display options"
                >
                  <ChevronDownIcon className={`w-3 h-3 transition-transform ${
                    isInventoryControlActive ? 'transform rotate-180' : ''
                  }`} />
                </button>
              </div>
              
              {isInventoryControlActive && (
                <div className={`absolute left-0 top-full mt-1 w-56 p-4 rounded-md shadow-xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border border-gray-500'
                    : 'bg-white border border-gray-300'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <ToggleSwitch
                        id="inventoryHighlightToggle"
                        checked={settings.inventoryHighlightLowStock ?? true}
                        onChange={(checked) => onSettingsChange({ inventoryHighlightLowStock: checked })}
                        label="Highlight Low Stock"
                        theme={theme}
                      />
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Low stock items will be highlighted in red for better visibility
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`w-px h-5 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
            
            {/* Advanced Net Weight Control Group */}
            <div className="relative" ref={netWeightControlRef}>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM6 8H4v6h12V8h-2v1a1 1 0 11-2 0V8H8v1a1 1 0 11-2 0V8zm2-2h4V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z" clipRule="evenodd" />
                </svg>
                <ToggleSwitch
                  id="showNetWeightToggle"
                  checked={settings.showNetWeight ?? false}
                  onChange={(checked) => onSettingsChange({ showNetWeight: checked })}
                  label="Net Wt"
                  theme={theme}
                />
                <button
                  onClick={() => setIsNetWeightControlActive(!isNetWeightControlActive)}
                  className={`p-1 rounded-md transition-colors ${
                    isNetWeightControlActive 
                      ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'
                      : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                  }`}
                  title="Advanced net weight display options"
                >
                  <ChevronDownIcon className={`w-3 h-3 transition-transform ${
                    isNetWeightControlActive ? 'transform rotate-180' : ''
                  }`} />
                </button>
              </div>
              
              {isNetWeightControlActive && (
                <div className={`absolute left-0 top-full mt-1 w-52 p-4 rounded-md shadow-xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-600 border border-gray-500'
                    : 'bg-white border border-gray-300'
                }`}>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Decimal Precision
                      </label>
                      <select
                        value={settings.netWeightPrecision || 2}
                        onChange={(e) => onSettingsChange({ netWeightPrecision: parseInt(e.target.value) as 1 | 2 | 3 })}
                        className={`w-full px-2 py-1 rounded text-xs ${
                          theme === 'dark'
                            ? 'bg-gray-500 text-gray-100 border-gray-400'
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                      >
                        <option value={1}>3.5g (1 decimal)</option>
                        <option value={2}>3.52g (2 decimals)</option>
                        <option value={3}>3.520g (3 decimals)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preset Configuration Buttons */}
            <div className={`w-px h-5 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  // Standard preset for pre-packaged products
                  onSettingsChange({
                    showTerpenes: true,
                    terpeneHighlightThreshold: 2.0,
                    terpeneDisplayFormat: 'percentage',
                    showInventoryStatus: true,
                    inventoryHighlightLowStock: true,
                    showNetWeight: false,
                    netWeightPrecision: 2,
                    columns: 4, // Optimal for pre-packaged
                    baseFontSizePx: 14, // Good readable size
                    linePaddingMultiplier: 0.4 // Compact but readable
                  });
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600/80 hover:bg-blue-700 text-blue-100'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                title="Standard preset: Balanced display for most pre-packaged products"
              >
                <SparklesIcon className="w-3 h-3" />
                <span>Standard</span>
              </button>
              
              <button
                onClick={() => {
                  // Detailed preset with all information shown
                  onSettingsChange({
                    showTerpenes: true,
                    terpeneHighlightThreshold: 1.5,
                    terpeneDisplayFormat: 'both',
                    showInventoryStatus: true,
                    inventoryHighlightLowStock: true,
                    showNetWeight: true,
                    netWeightPrecision: 3,
                    columns: 3, // Fewer columns for more detail
                    baseFontSizePx: 12, // Smaller font to fit more info
                    linePaddingMultiplier: 0.3 // Tighter spacing
                  });
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-green-600/80 hover:bg-green-700 text-green-100'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title="Detailed preset: Maximum information display with precise measurements"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Detailed</span>
              </button>
              
              <button
                onClick={() => {
                  // Compact preset for high-volume displays
                  onSettingsChange({
                    showTerpenes: false,
                    showInventoryStatus: false,
                    showNetWeight: false,
                    columns: 6, // Maximum columns
                    baseFontSizePx: 16, // Larger font for readability
                    linePaddingMultiplier: 0.5 // More padding for easier reading
                  });
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-purple-600/80 hover:bg-purple-700 text-purple-100'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
                title="Compact preset: Essential information only, optimized for maximum product display"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span>Compact</span>
              </button>
              
              {/* Help Button */}
              <div className="relative" ref={prePackagedHelpRef}>
                <button
                  onClick={() => setIsPrePackagedHelpActive(!isPrePackagedHelpActive)}
                  className={`p-1 rounded-md transition-colors ${
                    isPrePackagedHelpActive
                      ? theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500'
                      : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                  }`}
                  title="Pre-packaged controls help and tips"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                </button>
                
                {isPrePackagedHelpActive && (
                  <div className={`absolute right-0 top-full mt-1 w-80 p-4 rounded-md shadow-xl z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-600 border border-gray-500'
                      : 'bg-white border border-gray-300'
                  }`}>
                    <div className="space-y-4">
                      <div>
                        <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                          Pre-Packaged Controls Guide
                        </h4>
                        <div className={`text-xs space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>
                            <strong>Terpenes:</strong> Control display of terpene percentages. Higher thresholds highlight premium products.
                          </div>
                          <div>
                            <strong>Inventory:</strong> Show stock levels with color coding. Red indicates low stock items.
                          </div>
                          <div>
                            <strong>Net Weight:</strong> Display precise measurements. Higher precision useful for quality control.
                          </div>
                          <div className="pt-2 border-t border-gray-400">
                            <strong>Preset Recommendations:</strong>
                          </div>
                          <div>• <strong>Standard:</strong> Best for customer displays</div>
                          <div>• <strong>Detailed:</strong> Ideal for inventory management</div>
                          <div>• <strong>Compact:</strong> Perfect for large product catalogs</div>
                        </div>
                        
                        {/* Validation Messages */}
                        {settings.columns === 6 && (settings.showTerpenes || settings.showInventoryStatus || settings.showNetWeight) && (
                          <div className={`mt-3 p-2 rounded text-xs ${
                            theme === 'dark' 
                              ? 'bg-orange-900/50 text-orange-300 border border-orange-700'
                              : 'bg-orange-100 text-orange-700 border border-orange-300'
                          }`}>
                            ⚠️ With 6 columns, consider disabling some details to prevent overcrowding
                          </div>
                        )}
                        
                        {settings.baseFontSizePx < 12 && (settings.showTerpenes && settings.showInventoryStatus && settings.showNetWeight) && (
                          <div className={`mt-3 p-2 rounded text-xs ${
                            theme === 'dark' 
                              ? 'bg-red-900/50 text-red-300 border border-red-700'
                              : 'bg-red-100 text-red-700 border border-red-300'
                          }`}>
                            ⚠️ Small font size with all details may impact readability
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Zoom Controls Group */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-md border h-[36px] ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
                  <IconButton title="Zoom Out" onClick={onZoomOut} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><ZoomOutIcon className="w-5 h-5" /></IconButton>
        <input
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*"    
            aria-label="Current Zoom Percentage"
            value={zoomInputValue}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyPress={handleZoomInputKeyPress}
            className={`w-12 text-center rounded-md text-xs py-1 tabular-nums ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
        />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                  <IconButton title="Zoom In" onClick={onZoomIn} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><ZoomInIcon className="w-5 h-5" /></IconButton>
        <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
        <IconButton title="Fit to Window" onClick={onFitToWindow} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><ArrowsExpandIcon className="w-5 h-5" /></IconButton>
        <IconButton title="Reset Zoom" onClick={onResetZoom} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><RewindIcon className="w-5 h-5" /></IconButton>
      </div>
    </div>
  );
};