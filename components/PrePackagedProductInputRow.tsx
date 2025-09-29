import React, { useState, useEffect, useRef } from 'react';
import { PrePackagedProduct, PrePackagedShelf, StrainType, PrePackagedWeight, Theme } from '../types';
import { DebouncedInput } from './common/DebouncedInput';
import { Select } from './common/Select';
import { StrainTypeDropdown } from './common/StrainTypeDropdown';
import { InventoryStatusBadge } from './common/InventoryStatusBadge';
import { Icon } from './common/Icon';

interface PrePackagedProductInputRowProps {
  product: PrePackagedProduct;
  onUpdate: (updatedProduct: Partial<PrePackagedProduct>) => void;
  onRemove: () => void;
  onCopy: (direction: 'above' | 'below') => void;
  onMove?: (fromShelfId: string, toShelfId: string, productIndex: number, targetIndex?: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  theme: Theme;
  isNewlyAdded: boolean;
  shelfId: string;
  productIndex: number;
  availableShelves: PrePackagedShelf[];
  isFirst: boolean;
  isLast: boolean;
  isControlsDisabled?: boolean;
  shelfColor: string; // Added for low stock highlighting
  // Dropdown conflict prevention
  isAnyDropdownOpen?: boolean; // Whether any dropdown in this shelf is open
  onDropdownOpenChange?: (isOpen: boolean) => void; // Callback when dropdown state changes
}

export const PrePackagedProductInputRow: React.FC<PrePackagedProductInputRowProps> = ({
  product,
  onUpdate,
  onRemove,
  onCopy,
  onMove,
  onMoveUp,
  onMoveDown,
  theme,
  isNewlyAdded,
  shelfId,
  productIndex,
  availableShelves,
  isFirst,
  isLast,
  isControlsDisabled,
  shelfColor,
  isAnyDropdownOpen = false,
  onDropdownOpenChange,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Flash effect for newly added products
  useEffect(() => {
    if (isNewlyAdded && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isNewlyAdded]);

  // Auto-expand notes input if product has existing notes
  useEffect(() => {
    if (product.notes && product.notes.trim() !== '') {
      setShowNotesInput(true);
    }
  }, [product.notes]);



  // Weight is now handled at shelf level - removed weightOptions

  const moveOptions = availableShelves
    .filter(shelf => shelf.id !== shelfId)
    .map(shelf => ({
      value: shelf.id,
      label: shelf.name,
    }));

  // Extract hex color from Tailwind bg class or custom color
  const getShelfColorHex = (colorClass: string): string => {
    if (colorClass.includes('bg-[') && colorClass.includes(']')) {
      // Extract hex color from bg-[#color] format
      const match = colorClass.match(/bg-\[(.+)\]/);
      return match ? match[1] : '#6B7280';
    }
    return '#6B7280'; // Default gray if can't parse
  };

  const shelfColorHex = getShelfColorHex(shelfColor);
  const lowStockBackgroundStyle = product.isLowStock ? {
    backgroundColor: `${shelfColorHex}20` // 20 for ~12% opacity
  } : {};

  return (
    <div
      ref={rowRef}
      data-product-id={product.id}
      className={`p-5 rounded-xl shadow-sm border transition-all duration-300 relative ${
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-700/95' 
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50/50'
      } ${!isAnyDropdownOpen ? 'hover:shadow-lg hover:border-orange-300/60 hover:-translate-y-0.5' : ''
      } ${isNewlyAdded ? 'ring-2 ring-orange-500 ring-opacity-50' : ''} ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={{
        ...lowStockBackgroundStyle,
        backgroundImage: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(249, 250, 251, 0.6) 100%)',
      }}
    >
      {/* Move Up/Down Arrows */}
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex flex-col space-y-0.5 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <button
          onClick={onMoveUp}
          disabled={isControlsDisabled || isFirst}
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
            isFirst ? 'invisible' : ''
          }`}
          title="Move up"
        >
          <Icon name="chevron-up" className="w-3 h-3" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isControlsDisabled || isLast}
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
            isLast ? 'invisible' : ''
          }`}
          title="Move down"
        >
          <Icon name="chevron-down" className="w-3 h-3" />
        </button>
      </div>

      <div className="pl-4 space-y-3">
        {/* Row 1: Product Name & Brand */}
        <div className="grid grid-cols-7 gap-4">
          {/* Product Name */}
          <div className="col-span-4">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Product Name
            </label>
            <DebouncedInput
              value={product.name}
              onChange={(value) => onUpdate({ name: (value || '').toString() })}
              placeholder="Enter product name"
              className={`w-full p-2 rounded-lg text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              disabled={isControlsDisabled}
            />
          </div>

          {/* Brand */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Brand
            </label>
            <DebouncedInput
              value={product.brand}
              onChange={(value) => onUpdate({ brand: (value || '').toString() })}
              placeholder="Brand/Grower"
              className={`w-full p-2 rounded-lg text-sm border font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              disabled={isControlsDisabled}
            />
          </div>
        </div>

        {/* Row 2: Strain Type, Price, THC%, Terpenes% */}
        <div className="grid grid-cols-12 gap-4">
          {/* Strain Type */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Strain Type
            </label>
            <StrainTypeDropdown
              value={product.type}
              onChange={(type) => onUpdate({ type })}
              theme={theme}
              className="w-full"
              disabled={isControlsDisabled}
              onOpenChange={onDropdownOpenChange}
            />
          </div>

          {/* Price */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Price
            </label>
            <div className="relative">
              <DebouncedInput
                value={product.price === 0 ? '' : product.price.toFixed(2)}
                onChange={(value) => {
                  // Parse dollar amount, allowing typing
                  const cleanValue = value?.toString().replace(/[^\d.]/g, '') || '0';
                  const price = parseFloat(cleanValue) || 0;
                  onUpdate({ price });
                }}
                placeholder="0.00"
                className={`w-full p-2 rounded-lg text-sm pl-6 font-semibold border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-green-400'
                    : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-green-600'
                }`}
                theme={theme}
                disabled={isControlsDisabled}
              />
              <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>$</span>
            </div>
          </div>

          {/* THC */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              THC %
            </label>
            <div className="relative">
              <DebouncedInput
                value={product.thc?.toString() || ''}
                onChange={(value) => {
                  const thc = !value || value === '' ? null : parseFloat(value.toString()) || 0;
                  onUpdate({ thc });
                }}
                placeholder="0.0"
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={`w-full p-2 rounded-lg text-sm pr-5 border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                    : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
                }`}
                theme={theme}
                disabled={isControlsDisabled}
              />
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>%</span>
            </div>
          </div>

          {/* Terpenes */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Terpenes %
            </label>
            <div className="relative">
              <DebouncedInput
                value={product.terpenes?.toString() || ''}
                onChange={(value) => {
                  const terpenes = !value || value === '' ? null : parseFloat(value.toString()) || 0;
                  onUpdate({ terpenes });
                }}
                placeholder="0.0"
                type="number"
                step="0.1"
                min="0"
                max="10"
                className={`w-full p-2 rounded-lg text-sm pr-5 border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                    : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
                }`}
                theme={theme}
                disabled={isControlsDisabled}
              />
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>%</span>
            </div>
          </div>
        </div>

        {/* Row 3: Inventory Status & Notes */}
        <div className="grid grid-cols-6 gap-4">
          {/* Inventory Status */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Inventory Status
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={product.isLowStock || false}
                  onChange={(e) => onUpdate({ isLowStock: e.target.checked })}
                  disabled={isControlsDisabled}
                  className="w-3.5 h-3.5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  id={`low-stock-${product.id}`}
                />
                <label 
                  htmlFor={`low-stock-${product.id}`}
                  className={`text-xs cursor-pointer select-none ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Low Stock
                </label>
              </div>
              
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={product.isSoldOut || false}
                  onChange={(e) => onUpdate({ isSoldOut: e.target.checked })}
                  disabled={isControlsDisabled}
                  className="w-3.5 h-3.5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  id={`sold-out-${product.id}`}
                />
                <label 
                  htmlFor={`sold-out-${product.id}`}
                  className={`text-xs cursor-pointer select-none flex items-center ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {product.isSoldOut && <span className="mr-1 text-red-500 text-[8px]">●</span>}
                  Sold Out
                </label>
              </div>
            </div>
          </div>

          {/* Notes Toggle */}
          <div className="col-span-3">
            <label className={`block text-xs font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Notes
            </label>
            <button
              onClick={() => setShowNotesInput(!showNotesInput)}
              disabled={isControlsDisabled}
              className={`w-full p-2 rounded-lg text-sm border transition-colors transition-background-color transition-border-color duration-150 flex items-center justify-center ${
                showNotesInput || (product.notes && product.notes.trim() !== '')
                  ? theme === 'dark'
                    ? 'text-blue-400 bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/30'
                    : 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100'
                  : theme === 'dark'
                    ? 'text-gray-400 bg-gray-600 border-gray-500 hover:text-gray-100 hover:bg-gray-500'
                    : 'text-gray-600 bg-white border-gray-300 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title={showNotesInput ? "Hide notes" : "Add notes"}
            >
              <Icon name={showNotesInput ? "minus-circle" : "plus"} className="w-4 h-4 mr-1" />
              {showNotesInput || (product.notes && product.notes.trim() !== '') ? 'Hide Notes' : 'Add Notes'}
            </button>
          </div>
        </div>

        {/* Product Notes Input - positioned below Row 3 */}
        {showNotesInput && (
          <div className={`mt-2 p-3 rounded-lg border ${
            theme === 'dark' 
              ? 'border-gray-600/50 bg-gray-800/20' 
              : 'border-gray-200/60 bg-gray-50/40'
          }`}>
            <label className={`block text-xs font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Product Notes
            </label>
            <DebouncedInput
              value={product.notes || ''}
              onChange={(value) => {
                onUpdate({ notes: value.toString() });
              }}
              placeholder="Display info, batch details, special instructions..."
              className={`w-full p-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 placeholder-gray-400 text-gray-100'
                  : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
              }`}
              theme={theme}
              disabled={isControlsDisabled}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-1 pt-1">
          {/* Move Button */}
          {onMove && moveOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMoveOptions(!showMoveOptions)}
                disabled={isControlsDisabled}
                className={`p-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-600 text-gray-400 hover:text-orange-400'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
                }`}
                title="Move to shelf"
              >
                <Icon name="arrow-right" className="w-4 h-4" />
              </button>
              
              {showMoveOptions && (
                <div className={`absolute top-full right-0 mt-1 z-[100] min-w-32 rounded-lg shadow-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                }`}>
                  {moveOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onMove(shelfId, option.value, productIndex);
                        setShowMoveOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={() => onCopy('below')}
            disabled={isControlsDisabled}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-600 text-gray-400 hover:text-orange-400'
                : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
            }`}
            title="Copy below"
          >
            <Icon name="copy" className="w-4 h-4" />
          </button>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            disabled={isControlsDisabled}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400'
                : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
            }`}
            title="Remove product"
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};