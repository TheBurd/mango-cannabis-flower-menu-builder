import React, { useState, useEffect, useRef } from 'react';
import { PreviewSettings, ArtboardSize, HeaderImageSize, SupportedStates, Theme } from '../types'; 
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
  theme
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
    };
    if (isFontSizeControlActive || isPaddingControlActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontSizeControlActive, isPaddingControlActive]);

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
    }`}>
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
        {/* Layout Settings Group */}
        <div className={`flex items-center space-x-4 px-3 py-1 rounded-md border ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
          <CustomDropdown
              options={artboardSizeOptions}
              value={settings.artboardSize}
              onChange={(value) => onSettingsChange({ artboardSize: value as ArtboardSize })}
              className="min-w-[180px]"
              icon={<DocumentTextIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              theme={theme}
          />

          <CustomDropdown
              options={headerImageSizeOptions}
              value={settings.headerImageSize}
              onChange={(value) => onSettingsChange({ headerImageSize: value as HeaderImageSize })}
              className="min-w-[90px]"
              icon={<PhotoIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              theme={theme}
          />
          
          <CustomDropdown
              options={columnOptions}
              value={settings.columns}
              onChange={(value) => onSettingsChange({ columns: parseInt(value.toString(), 10) as PreviewSettings['columns'] })}
              className="min-w-[80px]"
              icon={<ColumnAddIcon className="w-4 h-4" theme={theme} />}
              theme={theme}
          />
        </div>

        {/* Typography Settings Group */}
        <div className={`flex items-center space-x-3 px-3 py-1 rounded-md border ${
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
        </div>

        {/* Display Options Group */}
        <div className={`flex items-center space-x-4 px-3 py-1 rounded-md border ${
          theme === 'dark'
            ? 'bg-gray-600/30 border-gray-600/50'
            : 'bg-gray-100/50 border-gray-300/50'
        }`}>
          <div className="flex items-center space-x-1" title="Allow shelves to split across columns">
              <SplitScreenIcon className="w-4 h-4" theme={theme} />
              <ToggleSwitch
                id="forceShelfFitToggle"
                checked={settings.forceShelfFit}
                onChange={(checked) => onSettingsChange({ forceShelfFit: checked })}
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
        </div>
      </div>
      
      {/* Zoom Controls Group */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-md border ${
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