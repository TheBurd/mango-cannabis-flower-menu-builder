
import React, { useEffect, useRef } from 'react';
import { Strain, StrainType, Theme } from '../types';
import { STRAIN_TYPES_ORDERED, THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE, STRAIN_TYPE_VISUALS } from '../constants';
import { IconButton } from './common/IconButton';
import { ToggleSwitch } from './common/ToggleSwitch';
import { TrashXmarkIcon, ArrowUpIcon, ArrowDownIcon, CircleIcon } from './common/Icon';

interface StrainInputRowProps {
  strain: Strain;
  onUpdate: (updatedStrain: Partial<Strain>) => void;
  onRemove: () => void;
  onCopy: (direction: 'above' | 'below') => void;
  isFirst: boolean;
  isLast: boolean;
  isNewlyAdded?: boolean;
  theme: Theme;
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
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNewlyAdded && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isNewlyAdded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdate({ [name]: type === 'checkbox' ? checked : (name === 'thc' ? (value === '' ? null : parseFloat(value)) : value) });
  };

  const handleThcBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== '' && strain.thc !== null) {
        onUpdate({ thc: parseFloat(parseFloat(value).toFixed(THC_DECIMAL_PLACES)) });
    } else if (value === '') {
        onUpdate({ thc: null });
    }
  };

  const handleTypeChange = (type: StrainType) => {
    onUpdate({ type });
  };

  return (
    <div className={`p-3 rounded-md shadow grid grid-cols-12 gap-2 items-center ${
      theme === 'dark' 
        ? `bg-gray-600 text-gray-200 ${strain.isLastJar ? 'bg-opacity-80 border-l-2 border-orange-400' : ''}` 
        : `bg-white text-gray-800 ${strain.isLastJar ? 'border-l-2 border-orange-400' : ''}`
    }`}>
      {/* Inputs */}
      <input
        ref={nameInputRef}
        type="text"
        name="name"
        value={strain.name}
        onChange={handleInputChange}
        placeholder="Strain Name"
        className={`col-span-4 p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        aria-label="Strain Name"
      />
      <input
        type="text"
        name="grower"
        value={strain.grower}
        onChange={handleInputChange}
        placeholder="Grower/Brand"
        className={`col-span-3 p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        aria-label="Grower or Brand"
      />
      <div className="col-span-2 relative">
        <input
            type="number"
            name="thc"
            value={strain.thc === null ? '' : strain.thc}
            onChange={handleInputChange}
            onBlur={handleThcBlur}
            placeholder="THC"
            step="0.1"
            className={`w-full p-2 rounded-md text-sm pr-6 focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            aria-label="THC Percentage"
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
        <IconButton title="Copy Above" onClick={() => onCopy('above')} disabled={isFirst && isLast} className="hover:text-orange-400 disabled:text-gray-500"><ArrowUpIcon /></IconButton>
        <IconButton title="Copy Below" onClick={() => onCopy('below')} disabled={isFirst && isLast} className="hover:text-orange-400 disabled:text-gray-500"><ArrowDownIcon /></IconButton>
        <IconButton title="Delete Strain" onClick={onRemove} className="hover:opacity-80"><TrashXmarkIcon theme={theme} color="red" /></IconButton>
      </div>
    </div>
  );
};