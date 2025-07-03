
import React from 'react';
import { Strain, StrainType, Theme, SupportedStates, Shelf } from '../types';
import { STRAIN_TYPES_ORDERED, THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE, STRAIN_TYPE_VISUALS } from '../constants';
import { IconButton } from './common/IconButton';
import { ToggleSwitch } from './common/ToggleSwitch';
import { DebouncedInput } from './common/DebouncedInput';
import { Select } from './common/Select';
import { TrashXmarkIcon, ArrowUpIcon, ArrowDownIcon, CircleIcon } from './common/Icon';
import { getPatternPath } from '../utils/assets';

interface StrainInputRowProps {
  strain: Strain;
  onUpdate: (updatedStrain: Partial<Strain>) => void;
  onRemove: () => void;
  onCopy: (direction: 'above' | 'below') => void;
  isFirst: boolean;
  isLast: boolean;
  isNewlyAdded?: boolean;
  theme: Theme;
  shelfId: string;
  strainIndex: number;
  onDragStart?: (strainId: string, shelfId: string, strainIndex: number) => void;
  isDragging?: boolean;
  isFiftyPercentOff?: boolean; // Whether this strain is in the 50% OFF shelf
  availableShelves?: Shelf[]; // Available shelves for original shelf selection
  currentState?: SupportedStates; // Current app state for shelf hierarchy
  isInfused?: boolean; // Whether this strain is in an infused flower shelf
}

export const StrainInputRow: React.FC<StrainInputRowProps> = ({
  strain,
  onUpdate,
  onRemove,
  onCopy,
  isFirst,
  isLast,
  isNewlyAdded,
  theme,
  shelfId,
  strainIndex,
  onDragStart,
  isDragging = false,
  isFiftyPercentOff = false,
  availableShelves = [],
  currentState,
  isInfused = false,
}) => {
  // Auto-focus is now handled by the DebouncedInput component

  const handleNameChange = (value: string | number | null) => {
    onUpdate({ name: value as string });
  };

  const handleGrowerChange = (value: string | number | null) => {
    onUpdate({ grower: value as string });
  };

  const handleThcChange = (value: string | number | null) => {
    onUpdate({ thc: value as number | null });
  };

  const handleThcBlur = (value: string | number | null) => {
    if (value !== null && value !== '') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        onUpdate({ thc: parseFloat(numValue.toFixed(THC_DECIMAL_PLACES)) });
      }
    }
  };

  const handleTypeChange = (type: StrainType) => {
    onUpdate({ type });
  };

  const handleOriginalShelfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ originalShelf: event.target.value });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(strain.id, shelfId, strainIndex);
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({
      strainId: strain.id,
      shelfId: shelfId,
      strainIndex: strainIndex,
      strain: strain
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset any drag state if needed
    e.dataTransfer.clearData();
  };

  // CSS for infused pattern
  const infusedPatternCSS = `
    .infused-pattern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("${getPatternPath('sick-ass-pattern.svg')}");
      background-size: 300px 300px;
      background-repeat: repeat;
      background-position: 0 0;
      filter: hue-rotate(30deg) saturate(0.4) brightness(1.5) opacity(0.06);
      pointer-events: none;
      z-index: 0;
    }
    .infused-pattern > * {
      position: relative;
      z-index: 1;
    }
  `;

  return (
    <>
      {isInfused && (
        <style dangerouslySetInnerHTML={{ __html: infusedPatternCSS }} />
      )}
      <div 
      className={`p-3 rounded-md shadow grid grid-cols-12 gap-2 items-center cursor-move transition-opacity ${
        theme === 'dark' 
          ? `bg-gray-600 text-gray-200 ${strain.isLastJar ? 'bg-opacity-80 border-l-2 border-orange-400' : ''}` 
          : `bg-white text-gray-800 ${strain.isLastJar ? 'border-l-2 border-orange-400' : ''}`
      } ${isDragging ? 'opacity-50' : 'hover:shadow-lg'} ${isInfused ? 'infused-pattern' : ''}`}
      style={{
        position: 'relative',
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Inputs */}
      <DebouncedInput
        value={strain.name}
        onChange={handleNameChange}
        type="text"
        placeholder="Strain Name"
        className={`${isFiftyPercentOff ? 'col-span-3' : 'col-span-4'} p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        theme={theme}
        autoFocus={isNewlyAdded}
        aria-label="Strain Name"
        debounceMs={150}
      />
      <DebouncedInput
        value={strain.grower}
        onChange={handleGrowerChange}
        type="text"
        placeholder="Grower/Brand"
        className={`${isFiftyPercentOff ? 'col-span-2' : 'col-span-3'} p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        theme={theme}
        aria-label="Grower or Brand"
        debounceMs={150}
      />
      {isFiftyPercentOff && (
        <div className="col-span-3">
          <Select
            value={strain.originalShelf || ''}
            onChange={handleOriginalShelfChange}
            options={[
              { value: '', label: 'Select Original Shelf' },
              ...availableShelves
                .filter(shelf => shelf.name !== '50% OFF STRAINS')
                .map(shelf => ({ value: shelf.name, label: shelf.name }))
            ]}
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 text-gray-100'
                : 'bg-gray-50 text-gray-900 border border-gray-300'
            }`}
            aria-label="Original Shelf"
          />
        </div>
      )}
      <div className={`${isFiftyPercentOff ? 'col-span-2' : 'col-span-2'} relative`}>
        <DebouncedInput
          value={strain.thc}
          onChange={handleThcChange}
          onBlur={handleThcBlur}
          type="number"
          placeholder="THC"
          step="0.1"
          className={`w-full p-2 rounded-md text-sm pr-6 focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            theme === 'dark'
              ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
              : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
          }`}
          theme={theme}
          aria-label="THC Percentage"
          debounceMs={150}
        />
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>%</span>
      </div>

      {/* Strain Type Toggles */}
      <div className="col-span-12 grid grid-cols-5 gap-1 mt-1">
        {STRAIN_TYPES_ORDERED.map(typeKey => {
          const visual = STRAIN_TYPE_VISUALS[typeKey];
          const isActive = strain.type === typeKey;
          let buttonStyle: React.CSSProperties = {};
          let buttonClasses = `py-1 px-1.5 text-xs rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-600 focus-visible:ring-orange-400`;

          if (isActive) {
            if (visual.gradient) {
              buttonStyle.background = visual.gradient;
            } else {
              buttonStyle.backgroundColor = visual.primaryColor;
            }
            buttonClasses += ` ${visual.textColorClass} font-semibold shadow-md`;
          } else {
            buttonClasses += theme === 'dark' 
              ? ' bg-gray-500 hover:bg-gray-400 text-gray-200'
              : ' bg-gray-200 hover:bg-gray-300 text-gray-700';
          }
          
          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => handleTypeChange(typeKey)}
              aria-pressed={isActive}
              className={buttonClasses}
              style={buttonStyle}
            >
              {typeKey.replace('-Hybrid', '.H')}
            </button>
          );
        })}
      </div>
      
      {/* Last Jar Toggle */}
      <div className="col-span-9 flex items-center space-x-2 mt-1">
        <ToggleSwitch
          id={`lastJar-${strain.id}`}
          checked={strain.isLastJar}
          onChange={(checked) => onUpdate({ isLastJar: checked })}
          theme={theme}
        />
        <label htmlFor={`lastJar-${strain.id}`} className={`text-sm select-none flex items-center ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {strain.isLastJar && <CircleIcon className="w-2.5 h-2.5 mr-1.5" style={{ color: MANGO_MAIN_ORANGE }} />}
          Last Jar?
        </label>
      </div>

      {/* Action Buttons */}
      <div className="col-span-3 flex justify-end space-x-1 mt-1">
        <IconButton title="Copy Above" onClick={() => onCopy('above')} className="hover:text-orange-400"><ArrowUpIcon /></IconButton>
        <IconButton title="Copy Below" onClick={() => onCopy('below')} className="hover:text-orange-400"><ArrowDownIcon /></IconButton>
        <IconButton title="Delete Strain" onClick={onRemove} className="hover:opacity-80"><TrashXmarkIcon theme={theme} color="red" /></IconButton>
      </div>
    </div>
    </>
  );
};