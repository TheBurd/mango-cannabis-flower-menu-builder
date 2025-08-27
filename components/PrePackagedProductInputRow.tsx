import React, { useState, useEffect, useRef } from 'react';
import { PrePackagedProduct, PrePackagedShelf, StrainType, PrePackagedWeight, Theme } from '../types';
import { DebouncedInput } from './common/DebouncedInput';
import { Select } from './common/Select';
import { Icon } from './common/Icon';

interface PrePackagedProductInputRowProps {
  product: PrePackagedProduct;
  onUpdate: (updatedProduct: Partial<PrePackagedProduct>) => void;
  onRemove: () => void;
  onCopy: (direction: 'above' | 'below') => void;
  onMove?: (fromShelfId: string, toShelfId: string, productIndex: number, targetIndex?: number) => void;
  onReorder?: (shelfId: string, fromIndex: number, toIndex: number) => void;
  onDragStart?: (productId: string, shelfId: string, productIndex: number) => void;
  theme: Theme;
  isNewlyAdded: boolean;
  shelfId: string;
  productIndex: number;
  availableShelves: PrePackagedShelf[];
  isDragging: boolean;
  isControlsDisabled?: boolean;
  shelfColor: string; // Added for low stock highlighting
}

export const PrePackagedProductInputRow: React.FC<PrePackagedProductInputRowProps> = ({
  product,
  onUpdate,
  onRemove,
  onCopy,
  onMove,
  onReorder,
  onDragStart,
  theme,
  isNewlyAdded,
  shelfId,
  productIndex,
  availableShelves,
  isDragging,
  isControlsDisabled,
  shelfColor,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);

  // Flash effect for newly added products
  useEffect(() => {
    if (isNewlyAdded && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isNewlyAdded]);

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && !isControlsDisabled) {
      onDragStart(product.id, shelfId, productIndex);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    if (onReorder && !isControlsDisabled) {
      const draggedData = e.dataTransfer.getData('text/plain');
      if (draggedData) {
        try {
          const { productIndex: draggedIndex } = JSON.parse(draggedData);
          if (draggedIndex !== productIndex) {
            onReorder(shelfId, draggedIndex, productIndex);
          }
        } catch (error) {
          console.error('Error parsing drag data:', error);
        }
      }
    }
  };

  const strainTypeOptions = [
    { value: StrainType.SATIVA, label: 'Sativa' },
    { value: StrainType.SATIVA_HYBRID, label: 'Sativa-Hybrid' },
    { value: StrainType.HYBRID, label: 'Hybrid' },
    { value: StrainType.INDICA_HYBRID, label: 'Indica-Hybrid' },
    { value: StrainType.INDICA, label: 'Indica' },
  ];

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
      style={lowStockBackgroundStyle}
      className={`p-3 rounded-lg border transition-all duration-200 ${
        isNewlyAdded ? 'ring-2 ring-blue-500 animate-pulse' : ''
      } ${
        isDragging ? 'opacity-50' : ''
      } ${
        draggedOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 
        theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
      } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
      draggable={!isControlsDisabled}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* First Row - Main product info */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        {/* Product Name */}
        <div className="col-span-4">
          <DebouncedInput
            value={product.name}
            onChange={(value) => onUpdate({ name: (value || '').toString() })}
            placeholder="Strain name"
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100 border-gray-600'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Brand */}
        <div className="col-span-3">
          <DebouncedInput
            value={product.brand}
            onChange={(value) => onUpdate({ brand: (value || '').toString() })}
            placeholder="Brand"
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100 border-gray-600'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Type */}
        <div className="col-span-2">
          <Select
            value={product.type}
            onChange={(e) => onUpdate({ type: e.target.value as StrainType })}
            options={strainTypeOptions}
            className={`w-full p-2 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
              theme === 'dark'
                ? 'bg-gray-500 text-gray-100 border-gray-600'
                : 'bg-gray-50 text-gray-900 border border-gray-300'
            }`}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Price - Enhanced for typing */}
        <div className="col-span-3">
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10">$</span>
            <DebouncedInput
              value={product.price === 0 ? '' : product.price.toFixed(2)}
              onChange={(value) => {
                // Parse dollar amount, allowing typing
                const cleanValue = value?.toString().replace(/[^\d.]/g, '') || '0';
                const price = parseFloat(cleanValue) || 0;
                onUpdate({ price });
              }}
              placeholder="0.00"
              className={`w-full p-2 pl-6 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 ${
                theme === 'dark'
                  ? 'bg-gray-500 placeholder-gray-400 text-gray-100 border-gray-600'
                  : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
              }`}
              theme={theme}
              disabled={isControlsDisabled}
            />
          </div>
        </div>
      </div>
      
      {/* Second Row - Additional details and controls */}
      <div className="grid grid-cols-12 gap-2">
        {/* THC % */}
        <div className="col-span-2">
          <DebouncedInput
            value={product.thc?.toString() || ''}
            onChange={(value) => {
              const thc = !value || value === '' ? null : parseFloat(value.toString()) || 0;
              onUpdate({ thc });
            }}
            placeholder="THC%"
            type="number"
            step="0.1"
            min="0"
            max="100"
            className={`w-full p-2 rounded-md text-xs focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100 border-gray-600'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Terpenes % */}
        <div className="col-span-2">
          <DebouncedInput
            value={product.terpenes?.toString() || ''}
            onChange={(value) => {
              const terpenes = !value || value === '' ? null : parseFloat(value.toString()) || 0;
              onUpdate({ terpenes });
            }}
            placeholder="Terp%"
            type="number"
            step="0.1"
            min="0"
            max="10"
            className={`w-full p-2 rounded-md text-xs focus:ring-orange-500 focus:border-orange-500 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              theme === 'dark'
                ? 'bg-gray-500 placeholder-gray-400 text-gray-100 border-gray-600'
                : 'bg-gray-50 placeholder-gray-500 text-gray-900 border border-gray-300'
            }`}
            theme={theme}
            disabled={isControlsDisabled}
          />
        </div>

        {/* Low Stock Checkbox with Label */}
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={product.isLowStock}
            onChange={(e) => onUpdate({ isLowStock: e.target.checked })}
            disabled={isControlsDisabled}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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

        {/* Actions */}
        <div className="col-span-4 flex items-center justify-end gap-1">
        {/* Move Button */}
        {onMove && moveOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMoveOptions(!showMoveOptions)}
              disabled={isControlsDisabled}
              className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-500 focus:ring-offset-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-offset-white'
              }`}
              title="Move to shelf"
            >
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
            
            {showMoveOptions && (
              <div className={`absolute top-full right-0 mt-1 z-10 min-w-32 rounded-md shadow-lg ${
                theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
              }`}>
                {moveOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onMove(shelfId, option.value, productIndex);
                      setShowMoveOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md ${
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

        {/* Copy Down Button */}
        <button
          onClick={() => onCopy('below')}
          disabled={isControlsDisabled}
          className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-500 focus:ring-offset-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-offset-white'
          }`}
          title="Copy below"
        >
          <Icon name="copy" className="w-4 h-4" />
        </button>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          disabled={isControlsDisabled}
          className={`p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
            theme === 'dark'
              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:ring-offset-gray-700'
              : 'text-red-600 hover:text-red-700 hover:bg-red-100 focus:ring-offset-white'
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