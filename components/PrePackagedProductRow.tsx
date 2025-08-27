import React from 'react';
import { PrePackagedProduct, PrePackagedWeight, StrainType, Theme, SupportedStates, PrePackagedShelf } from '../types';
import { STRAIN_TYPES_ORDERED, THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE, STRAIN_TYPE_VISUALS } from '../constants';
import { IconButton } from './common/IconButton';
import { DebouncedInput } from './common/DebouncedInput';
import { Select } from './common/Select';
import { TrashXmarkIcon, ArrowUpIcon, ArrowDownIcon, PackageIcon } from './common/Icon';

interface PrePackagedProductRowProps {
  product: PrePackagedProduct;
  onUpdate: (updatedProduct: Partial<PrePackagedProduct>) => void;
  onRemove: () => void;
  onCopy: (direction: 'above' | 'below') => void;
  isFirst: boolean;
  isLast: boolean;
  isNewlyAdded?: boolean;
  theme: Theme;
  shelfId: string;
  productIndex: number;
  onDragStart?: (productId: string, shelfId: string, productIndex: number) => void;
  isDragging?: boolean;
  isFiftyPercentOff?: boolean; // Whether this product is in the 50% OFF shelf
  availableShelves?: PrePackagedShelf[]; // Available shelves for original shelf selection
  currentState?: SupportedStates; // Current app state for shelf hierarchy
}

export const PrePackagedProductRow: React.FC<PrePackagedProductRowProps> = ({
  product,
  onUpdate,
  onRemove,
  onCopy,
  isFirst,
  isLast,
  isNewlyAdded,
  theme,
  shelfId,
  productIndex,
  onDragStart,
  isDragging = false,
  isFiftyPercentOff = false,
  availableShelves = [],
  currentState,
}) => {
  // Input handlers
  const handleNameChange = (value: string | number | null) => {
    onUpdate({ name: value as string });
  };

  const handleBrandChange = (value: string | number | null) => {
    onUpdate({ brand: value as string });
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

  const handleTerpenesChange = (value: string | number | null) => {
    onUpdate({ terpenes: value as number | null });
  };

  const handleTerpenesBlur = (value: string | number | null) => {
    if (value !== null && value !== '') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        onUpdate({ terpenes: parseFloat(numValue.toFixed(THC_DECIMAL_PLACES)) });
      }
    }
  };

  const handleTypeChange = (type: StrainType) => {
    onUpdate({ type });
  };

  const handleWeightChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ weight: event.target.value as PrePackagedWeight });
  };

  const handlePriceChange = (value: string | number | null) => {
    if (value !== null && value !== '') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        onUpdate({ price: parseFloat(numValue.toFixed(2)) });
      }
    } else {
      onUpdate({ price: 0 });
    }
  };

  const handleNetWeightChange = (value: string | number | null) => {
    onUpdate({ netWeight: value as string });
  };

  const handleInventoryStatusChange = (value: string | number | null) => {
    onUpdate({ inventoryStatus: value as string });
  };

  const handleNotesChange = (value: string | number | null) => {
    onUpdate({ notes: value as string });
  };

  const handleOriginalShelfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ originalShelf: event.target.value });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(product.id, shelfId, productIndex);
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({
      productId: product.id,
      shelfId: shelfId,
      productIndex: productIndex,
      product: product
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset any drag state if needed
    e.dataTransfer.clearData();
  };

  // Weight options for dropdown
  const weightOptions = [
    { value: PrePackagedWeight.EIGHTH, label: '3.5g (Eighth)' },
    { value: PrePackagedWeight.QUARTER, label: '7g (Quarter)' },
    { value: PrePackagedWeight.HALF, label: '14g (Half)' },
    { value: PrePackagedWeight.OUNCE, label: '28g (Ounce)' },
  ];

  // Common inventory status options
  const inventoryStatusOptions = [
    { value: '', label: 'Select Status...' },
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Last 5 Units', label: 'Last 5 Units' },
    { value: 'Last 3 Units', label: 'Last 3 Units' },
    { value: 'Last Unit', label: 'Last Unit' },
    { value: 'Out of Stock', label: 'Out of Stock' },
  ];

  return (
    <div 
      className={`p-3 rounded-md shadow grid grid-cols-12 gap-2 items-start cursor-move transition-opacity ${
        theme === 'dark' 
          ? `bg-gray-600 text-gray-200` 
          : `bg-white text-gray-800`
      } ${isDragging ? 'opacity-50' : 'hover:shadow-lg'}`}
      style={{
        position: 'relative',
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Row 1: Main product info */}
      {/* Product Name */}
      <DebouncedInput
        value={product.name}
        onChange={handleNameChange}
        type="text"
        placeholder="Product Name"
        className={`${isFiftyPercentOff ? 'col-span-3' : 'col-span-4'} p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        theme={theme}
        autoFocus={isNewlyAdded}
        aria-label="Product Name"
        debounceMs={150}
      />

      {/* Brand (emphasized field) */}
      <DebouncedInput
        value={product.brand}
        onChange={handleBrandChange}
        type="text"
        placeholder="Brand/Grower"
        className={`${isFiftyPercentOff ? 'col-span-2' : 'col-span-3'} p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 font-semibold ${
          theme === 'dark'
            ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
            : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
        }`}
        theme={theme}
        aria-label="Brand or Grower"
        debounceMs={150}
      />

      {/* Original Shelf (for 50% off only) */}
      {isFiftyPercentOff && (
        <div className="col-span-2">
          <Select
            value={product.originalShelf || ''}
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

      {/* Weight Selector */}
      <div className={`${isFiftyPercentOff ? 'col-span-2' : 'col-span-2'}`}>
        <Select
          value={product.weight}
          onChange={handleWeightChange}
          options={weightOptions}
          className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
            theme === 'dark'
              ? 'bg-gray-500 text-gray-100'
              : 'bg-gray-50 text-gray-900 border border-gray-300'
          }`}
          aria-label="Package Weight"
        />
      </div>

      {/* Price Input (emphasized) */}
      <div className={`${isFiftyPercentOff ? 'col-span-3' : 'col-span-3'} relative`}>
        <DebouncedInput
          value={product.price}
          onChange={handlePriceChange}
          type="number"
          placeholder="Price"
          step="0.01"
          className={`w-full p-2 rounded-md text-sm pl-6 font-semibold text-green-600 focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            theme === 'dark'
              ? 'bg-gray-500 placeholder-gray-400 text-green-400'
              : 'bg-gray-50 placeholder-gray-500 text-green-600 border border-gray-300'
          }`}
          theme={theme}
          aria-label="Fixed Price"
          debounceMs={150}
        />
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold ${
          theme === 'dark' ? 'text-green-400' : 'text-green-600'
        }`}>$</span>
      </div>

      {/* Row 2: THC and Terpenes */}
      <div className="col-span-12 grid grid-cols-12 gap-2 mt-2">
        {/* THC Percentage */}
        <div className="col-span-3 relative">
          <DebouncedInput
            value={product.thc}
            onChange={handleThcChange}
            onBlur={handleThcBlur}
            type="number"
            placeholder="THC %"
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

        {/* Terpenes Percentage (new field) */}
        <div className="col-span-3 relative">
          <DebouncedInput
            value={product.terpenes || ''}
            onChange={handleTerpenesChange}
            onBlur={handleTerpenesBlur}
            type="number"
            placeholder="Terpenes %"
            step="0.1"
            className={`w-full p-2 rounded-md text-sm pr-6 focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            aria-label="Terpene Percentage"
            debounceMs={150}
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>%</span>
        </div>

        {/* Net Weight */}
        <div className="col-span-3">
          <DebouncedInput
            value={product.netWeight || ''}
            onChange={handleNetWeightChange}
            type="text"
            placeholder="Net Weight"
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            aria-label="Net Weight (e.g., 3.52g)"
            debounceMs={150}
          />
        </div>

        {/* Inventory Status */}
        <div className="col-span-3">
          <Select
            value={product.inventoryStatus || ''}
            onChange={(e) => handleInventoryStatusChange(e.target.value)}
            options={inventoryStatusOptions}
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 text-gray-100'
                : 'bg-gray-50 text-gray-900 border border-gray-300'
            }`}
            aria-label="Inventory Status"
          />
        </div>
      </div>

      {/* Row 3: Strain Type Toggles */}
      <div className="col-span-12 grid grid-cols-5 gap-1 mt-2">
        {STRAIN_TYPES_ORDERED.map(typeKey => {
          const visual = STRAIN_TYPE_VISUALS[typeKey];
          const isActive = product.type === typeKey;
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

      {/* Row 4: Notes field and action buttons */}
      <div className="col-span-9 mt-2">
        <DebouncedInput
          value={product.notes || ''}
          onChange={handleNotesChange}
          type="text"
          placeholder="Notes (e.g., Has Display, Batch Info...)"
          className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
            theme === 'dark'
              ? 'bg-gray-500 placeholder-gray-400 text-gray-100'
              : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
          }`}
          theme={theme}
          aria-label="Notes"
          debounceMs={150}
        />
      </div>

      {/* Action Buttons */}
      <div className="col-span-3 flex justify-end space-x-1 mt-2">
        <IconButton title="Copy Above" onClick={() => onCopy('above')} className="hover:text-orange-400">
          <ArrowUpIcon />
        </IconButton>
        <IconButton title="Copy Below" onClick={() => onCopy('below')} className="hover:text-orange-400">
          <ArrowDownIcon />
        </IconButton>
        <IconButton title="Delete Product" onClick={onRemove} className="hover:opacity-80">
          <TrashXmarkIcon theme={theme} color="red" />
        </IconButton>
      </div>

      {/* Product indicator icon */}
      <div className="absolute top-2 right-2">
        <PackageIcon className={`w-4 h-4 opacity-30 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`} />
      </div>
    </div>
  );
};