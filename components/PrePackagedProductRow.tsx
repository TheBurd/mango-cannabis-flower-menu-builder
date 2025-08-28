import React from 'react';
import { PrePackagedProduct, PrePackagedWeight, StrainType, Theme, SupportedStates, PrePackagedShelf } from '../types';
import { STRAIN_TYPES_ORDERED, THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE, STRAIN_TYPE_VISUALS } from '../constants';
import { IconButton } from './common/IconButton';
import { DebouncedInput } from './common/DebouncedInput';
import { Select } from './common/Select';
import { StrainTypeDropdown } from './common/StrainTypeDropdown';
import { InventoryStatusBadge } from './common/InventoryStatusBadge';
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

export const PrePackagedProductRow = React.memo<PrePackagedProductRowProps>(({
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


  return (
    <div 
      className={`p-5 rounded-xl shadow-sm border transition-all duration-300 cursor-move relative ${
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-700/95' 
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50/50'
      } ${isDragging 
        ? 'opacity-50 scale-95 shadow-lg' 
        : 'hover:shadow-lg hover:border-orange-300/60 hover:-translate-y-0.5'
      } ${isNewlyAdded ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
      style={{
        backgroundImage: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(249, 250, 251, 0.6) 100%)',
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-20 hover:opacity-40 transition-opacity ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
      </div>

      <div className="pl-4">
        {/* Row 1: Core Product Information */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Product Name */}
          <div className={`${isFiftyPercentOff ? 'col-span-3' : 'col-span-4'}`}>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Product Name
            </label>
            <DebouncedInput
              value={product.name}
              onChange={handleNameChange}
              type="text"
              placeholder="Enter product name"
              className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              autoFocus={isNewlyAdded}
              aria-label="Product Name"
              debounceMs={150}
            />
          </div>

          {/* Brand */}
          <div className={`${isFiftyPercentOff ? 'col-span-2' : 'col-span-3'}`}>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Brand
            </label>
            <DebouncedInput
              value={product.brand}
              onChange={handleBrandChange}
              type="text"
              placeholder="Brand/Grower"
              className={`w-full p-2.5 rounded-lg text-sm border font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              aria-label="Brand or Grower"
              debounceMs={150}
            />
          </div>

          {/* Original Shelf (for 50% off only) */}
          {isFiftyPercentOff && (
            <div className="col-span-2">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Original Shelf
              </label>
              <Select
                value={product.originalShelf || ''}
                onChange={handleOriginalShelfChange}
                options={[
                  { value: '', label: 'Select Original Shelf' },
                  ...availableShelves
                    .filter(shelf => shelf.name !== '50% OFF STRAINS')
                    .map(shelf => ({ value: shelf.name, label: shelf.name }))
                ]}
                className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-gray-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                aria-label="Original Shelf"
              />
            </div>
          )}

          {/* Weight */}
          <div className="col-span-2">
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Weight
            </label>
            <Select
              value={product.weight}
              onChange={handleWeightChange}
              options={weightOptions}
              className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-gray-100'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              aria-label="Package Weight"
            />
          </div>

          {/* Price */}
          <div className={`${isFiftyPercentOff ? 'col-span-3' : 'col-span-3'} relative`}>
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Price
            </label>
            <div className="relative">
              <DebouncedInput
                value={product.price}
                onChange={handlePriceChange}
                type="number"
                placeholder="0.00"
                step="0.01"
                className={`w-full p-2.5 rounded-lg text-sm pl-7 font-semibold border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-green-400'
                    : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-green-600'
                }`}
                theme={theme}
                aria-label="Fixed Price"
                debounceMs={150}
              />
              <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>$</span>
            </div>
          </div>
        </div>

        {/* Row 2: Attributes Section */}
        <div className={`p-4 rounded-xl mb-4 border transition-all duration-200 ${
          theme === 'dark' 
            ? 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-800/40' 
            : 'bg-gray-50/40 border-gray-200/40 hover:bg-gray-50/60'
        }`}>
          <div className="flex items-center mb-3">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500'
            }`}></div>
            <h4 className={`text-xs font-semibold uppercase tracking-wide ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Product Attributes
            </h4>
          </div>
          <div className="grid grid-cols-12 gap-3">
            {/* THC */}
            <div className="col-span-3">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                THC %
              </label>
              <div className="relative">
                <DebouncedInput
                  value={product.thc}
                  onChange={handleThcChange}
                  onBlur={handleThcBlur}
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  className={`w-full p-2.5 rounded-lg text-sm pr-6 border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                      : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
                  }`}
                  theme={theme}
                  aria-label="THC Percentage"
                  debounceMs={150}
                />
                <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>%</span>
              </div>
            </div>

            {/* Terpenes */}
            <div className="col-span-3">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Terpenes %
              </label>
              <div className="relative">
                <DebouncedInput
                  value={product.terpenes || ''}
                  onChange={handleTerpenesChange}
                  onBlur={handleTerpenesBlur}
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  className={`w-full p-2.5 rounded-lg text-sm pr-6 border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                      : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
                  }`}
                  theme={theme}
                  aria-label="Terpene Percentage"
                  debounceMs={150}
                />
                <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>%</span>
              </div>
            </div>

            {/* Strain Type */}
            <div className="col-span-3">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Strain Type
              </label>
              <StrainTypeDropdown
                value={product.type}
                onChange={handleTypeChange}
                theme={theme}
                className="w-full"
              />
            </div>

            {/* Inventory Status */}
            <div className="col-span-3">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Inventory Status
              </label>
              <InventoryStatusBadge
                value={product.inventoryStatus || ''}
                onChange={(value) => handleInventoryStatusChange(value)}
                theme={theme}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Additional Information */}
        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Net Weight */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Net Weight
            </label>
            <DebouncedInput
              value={product.netWeight || ''}
              onChange={handleNetWeightChange}
              type="text"
              placeholder="3.52g"
              className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              aria-label="Net Weight (e.g., 3.52g)"
              debounceMs={150}
            />
          </div>

          {/* Notes */}
          <div className="col-span-6">
            <label className={`block text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Notes
            </label>
            <DebouncedInput
              value={product.notes || ''}
              onChange={handleNotesChange}
              type="text"
              placeholder="Display info, batch details, etc."
              className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              aria-label="Notes"
              debounceMs={150}
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-3 flex justify-end space-x-1">
            <IconButton 
              title="Copy Above" 
              onClick={() => onCopy('above')} 
              className={`p-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-orange-400'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
              }`}
            >
              <ArrowUpIcon className="w-4 h-4" />
            </IconButton>
            <IconButton 
              title="Copy Below" 
              onClick={() => onCopy('below')}
              className={`p-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-orange-400'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
              }`}
            >
              <ArrowDownIcon className="w-4 h-4" />
            </IconButton>
            <IconButton 
              title="Delete Product" 
              onClick={onRemove}
              className={`p-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400'
                  : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
              }`}
            >
              <TrashXmarkIcon theme={theme} color="red" className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Product indicator icon */}
      <div className={`absolute top-4 right-4 p-1.5 rounded-full opacity-10 ${
        theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'
      }`}>
        <PackageIcon className="w-3 h-3 text-current" />
      </div>
    </div>
  );
});