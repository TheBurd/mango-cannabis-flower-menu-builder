import React, { useState, useEffect, useRef } from 'react';
import { PreviewSettings, ArtboardSize, HeaderImageSize } from '../types'; 
import { Select } from './common/Select';
import { IconButton } from './common/IconButton';
import { ToggleSwitch } from './common/ToggleSwitch';
import { ZoomInIcon, ZoomOutIcon, ArrowsExpandIcon, RewindIcon, TableCellsIcon, TextSizeIcon, DocumentTextIcon, Bars3BottomLeftIcon, PhotoIcon, SpacingIcon } from './common/Icon'; 

interface PreviewControlsProps {
  settings: PreviewSettings; 
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWindow: () => void;
  onResetZoom: () => void;
  currentZoom: number;
  onDirectZoomChange: (newZoom: number) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  settings,
  onSettingsChange,
  onZoomIn,
  onZoomOut,
  onFitToWindow,
  onResetZoom,
  currentZoom,
  onDirectZoomChange
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
    <div className="no-print bg-gray-700 p-2 flex items-center justify-between space-x-2 rounded-t-md border-b border-gray-600 text-sm text-gray-200">
      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
        <div className="flex items-center space-x-1">
            <DocumentTextIcon className="w-4 h-4 text-gray-400" title="Artboard Size"/>
            <Select
                aria-label="Artboard Size"
                options={artboardSizeOptions}
                value={settings.artboardSize}
                onChange={(e) => onSettingsChange({ artboardSize: e.target.value as ArtboardSize })}
                className="bg-gray-600 border-gray-500 rounded-md text-xs py-1 min-w-[180px]"
                itemClassName="text-gray-700 hover:bg-gray-200"
            />
        </div>

        <div className="flex items-center space-x-1">
            <PhotoIcon className="w-4 h-4 text-gray-400" title="Header Image Size"/>
            <Select
                aria-label="Header Image Size"
                options={headerImageSizeOptions}
                value={settings.headerImageSize}
                onChange={(e) => onSettingsChange({ headerImageSize: e.target.value as HeaderImageSize })}
                className="bg-gray-600 border-gray-500 rounded-md text-xs py-1 min-w-[90px]"
                itemClassName="text-gray-700 hover:bg-gray-200"
            />
        </div>
        
        <div className="flex items-center space-x-1">
            <TableCellsIcon className="w-4 h-4 text-gray-400" title="Columns"/>
             <Select
                aria-label="Number of Columns"
                options={columnOptions}
                value={settings.columns}
                onChange={(e) => onSettingsChange({ columns: parseInt(e.target.value, 10) as PreviewSettings['columns'] })}
                className="bg-gray-600 border-gray-500 rounded-md text-xs py-1"
                itemClassName="text-gray-700 hover:bg-gray-200"
            />
        </div>

        <div className="relative" ref={fontSizeControlRef}>
            <div 
                onClick={!isFontSizeControlActive ? handleFontSizeButtonClick : undefined} 
                className={`flex items-center space-x-1 bg-gray-600 hover:bg-gray-500 text-gray-200 py-1 px-2 text-xs rounded-md h-[26px] ${!isFontSizeControlActive ? 'cursor-pointer' : ''}`}
            >
                <TextSizeIcon className="w-4 h-4" title="Base Font Size"/>
                {isFontSizeControlActive ? (
                    <input
                        ref={fontSizeInputRef}
                        type="number"
                        value={fontSizeInputValue}
                        onChange={handleFontSizeInputChange}
                        onBlur={handleFontSizeInputBlur} 
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur();}}
                        className="w-12 bg-gray-500 text-gray-100 placeholder-gray-400 p-0.5 rounded-sm text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.5"
                        min="1" 
                    />
                ) : (
                    <span onClick={handleFontSizeButtonClick} className="cursor-pointer">{settings.baseFontSizePx}px</span>
                )}
            </div>

            {isFontSizeControlActive && (
                <div className="absolute left-0 top-full mt-1 w-48 p-3 bg-gray-600 border border-gray-500 rounded-md shadow-xl z-50">
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="font-size-slider" className="text-xs text-gray-300">Base Font Size</label>
                        <span className="text-xs font-medium text-gray-100">{parseFloat(settings.baseFontSizePx.toFixed(1))}px</span>
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
                className={`flex items-center space-x-1 bg-gray-600 hover:bg-gray-500 text-gray-200 py-1 px-2 text-xs rounded-md h-[26px] ${!isPaddingControlActive ? 'cursor-pointer' : ''}`}
            >
                <SpacingIcon className="w-4 h-4" title="Line Padding"/>
                {isPaddingControlActive ? (
                    <input
                        ref={paddingInputRef}
                        type="number"
                        value={paddingInputValue}
                        onChange={handlePaddingInputChange}
                        onBlur={handlePaddingInputBlur} 
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur();}}
                        className="w-12 bg-gray-500 text-gray-100 placeholder-gray-400 p-0.5 rounded-sm text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.1"
                        min="0" 
                    />
                ) : (
                    <span onClick={handlePaddingButtonClick} className="cursor-pointer">{settings.linePaddingMultiplier.toFixed(1)}</span>
                )}
            </div>

            {isPaddingControlActive && (
                <div className="absolute left-0 top-full mt-1 w-48 p-3 bg-gray-600 border border-gray-500 rounded-md shadow-xl z-50">
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="padding-slider" className="text-xs text-gray-300">Line Padding</label>
                        <span className="text-xs font-medium text-gray-100">{parseFloat(settings.linePaddingMultiplier.toFixed(2))}</span>
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

        <div className="flex items-center space-x-1" title="Allow shelves to split across columns">
            <Bars3BottomLeftIcon className="w-4 h-4 text-gray-400" />
            <ToggleSwitch
              id="forceShelfFitToggle"
              checked={settings.forceShelfFit}
              onChange={(checked) => onSettingsChange({ forceShelfFit: checked })}
              label="Allow Shelf Splitting"
            />
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <IconButton title="Zoom Out" onClick={onZoomOut} className="hover:bg-gray-600 p-1 rounded"><ZoomOutIcon className="w-5 h-5" /></IconButton>
        <input
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*"    
            aria-label="Current Zoom Percentage"
            value={zoomInputValue}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyPress={handleZoomInputKeyPress}
            className="w-12 text-center bg-gray-600 border-gray-500 text-gray-100 rounded-md text-xs py-1 tabular-nums"
        />
         <span className="text-xs text-gray-400">%</span>
        <IconButton title="Zoom In" onClick={onZoomIn} className="hover:bg-gray-600 p-1 rounded"><ZoomInIcon className="w-5 h-5" /></IconButton>
        <IconButton title="Fit to Window" onClick={onFitToWindow} className="hover:bg-gray-600 p-1 rounded"><ArrowsExpandIcon className="w-5 h-5" /></IconButton>
        <IconButton title="Reset Zoom" onClick={onResetZoom} className="hover:bg-gray-600 p-1 rounded"><RewindIcon className="w-5 h-5" /></IconButton>
      </div>
    </div>
  );
};