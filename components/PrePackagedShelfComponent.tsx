import React, { useRef, useState } from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedProductInputRow } from './PrePackagedProductInputRow';
import { Icon } from './common/Icon';
import { CustomDropdown } from './common/CustomDropdown';
import { getShelfAccentColor, hexToRgba } from '../utils/colorUtils';

interface PrePackagedShelfComponentProps {
  shelf: PrePackagedShelf;
  onAddProduct: () => void;
  onUpdateProduct: (productId: string, updatedProduct: Partial<PrePackagedProduct>) => void;
  onRemoveProduct: (productId: string) => void;
  onCopyProduct: (productId: string, direction: 'above' | 'below') => void;
  onClearProducts: () => void;
  newlyAddedProductId: string | null;
  onUpdateShelfSortCriteria: (key: PrePackagedSortCriteria['key']) => void;
  theme: Theme;
  onMoveProduct?: (fromShelfId: string, toShelfId: string, productIndex: number, targetIndex?: number) => void;
  onMoveProductUp?: (shelfId: string, productIndex: number) => void;
  onMoveProductDown?: (shelfId: string, productIndex: number) => void;
  availableShelves: PrePackagedShelf[];
  currentState?: SupportedStates;
  isControlsDisabled?: boolean;
  onTogglePricingVisibility?: (showPricing: boolean) => void;
  visibleProducts?: Array<{ product: PrePackagedProduct; originalIndex: number }>;
  isSearchActive?: boolean;
}

export const PrePackagedShelfComponent: React.FC<PrePackagedShelfComponentProps> = ({
  shelf,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  onCopyProduct,
  onClearProducts,
  newlyAddedProductId,
  onUpdateShelfSortCriteria,
  theme,
  onMoveProduct,
  onMoveProductUp,
  onMoveProductDown,
  availableShelves,
  currentState: _currentState,
  isControlsDisabled,
  onTogglePricingVisibility,
  visibleProducts,
  isSearchActive = false,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);
  
  // Track when any dropdown is open to prevent hover conflicts
  const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false);


  const sortOptions: Array<{ value: PrePackagedSortCriteria['key']; label: string }> = [
    { value: 'name', label: 'Name' },
    { value: 'brand', label: 'Brand' },
    { value: 'type', label: 'Type' },
    { value: 'thc', label: 'THC%' },
    { value: 'terpenes', label: 'Terpenes%' },
    { value: 'price', label: 'Price' },
    { value: 'isLowStock', label: 'Low Stock' },
    { value: 'isSoldOut', label: 'Sold Out' },
  ];

  const toggleAccentColor = getShelfAccentColor(shelf.color);
  const toggleBackground = toggleAccentColor ? hexToRgba(toggleAccentColor, 0.18) : 'rgba(255,255,255,0.12)';
  const toggleBorder = toggleAccentColor ? hexToRgba(toggleAccentColor, 0.35) : 'rgba(255,255,255,0.2)';
  const extractBracketColor = (val: string, prefix: string) => {
    const match = val.match(new RegExp(`^${prefix}-\\[(.+)\\]$`));
    return match?.[1] || null;
  };
  const bgBracket = extractBracketColor(shelf.color, 'bg');
  const textBracket = extractBracketColor(shelf.textColor, 'text');
  const isBgClass = shelf.color.startsWith('bg-') && !bgBracket;
  const isTextClass = shelf.textColor.startsWith('text-') && !textBracket;
  const bgStyle = !isBgClass ? { backgroundColor: bgBracket || shelf.color } : undefined;
  const textStyle = !isTextClass ? { color: textBracket || shelf.textColor } : undefined;

  const handlePricingToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTogglePricingVisibility?.(event.target.checked);
  };

  const productsWithIndex = visibleProducts ?? (shelf.products || []).map((product, index) => ({ product, originalIndex: index }));
  const moveEnabled = !isSearchActive;

  const SortButton: React.FC<{ label: string; sortKey: PrePackagedSortCriteria['key'] }> = ({ label, sortKey }) => {
    const isActive = shelf.sortCriteria?.key === sortKey;
    const direction = isActive ? shelf.sortCriteria?.direction : null;
    const buttonColor = isActive ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20';
    return (
      <button
        onClick={() => onUpdateShelfSortCriteria(sortKey)}
        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${buttonColor} text-current`}
        title={`Sort by ${label}`}
      >
        <span>{label}</span>
        {isActive && direction === 'asc' && <Icon name="sort-asc" className="w-3 h-3" />}
        {isActive && direction === 'desc' && <Icon name="sort-desc" className="w-3 h-3" />}
      </button>
    );
  };

  return (
    <div
      ref={shelfRef}
      className={`rounded-lg border shadow-md overflow-hidden transition-all duration-200 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
      id={`shelf-${shelf.id}`}
    >
      {/* Shelf Header */}
      <div
        className={`p-3 ${isBgClass ? shelf.color : ''} ${isTextClass ? shelf.textColor : ''}`}
        style={
          !isBgClass || !isTextClass
            ? { backgroundColor: isBgClass ? undefined : bgBracket || shelf.color, color: isTextClass ? undefined : textBracket || shelf.textColor }
            : undefined
        }
      >
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1 min-w-[220px] flex flex-col gap-1">
            <h3 className={`text-xl font-semibold leading-tight ${isTextClass ? shelf.textColor : ''}`} style={textStyle}>
              {shelf.name} ({productsWithIndex.length || 0})
            </h3>
            <div className="flex items-center flex-wrap gap-2 text-sm text-inherit">
              <span className="text-xs opacity-80">Sort this shelf:</span>
              {sortOptions.map((opt) => (
                <SortButton key={opt.value} label={opt.label} sortKey={opt.value} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[140px]">
            {(productsWithIndex.length || 0) > 0 && (
              <button
                onClick={onClearProducts}
                disabled={isControlsDisabled}
                className="px-3 py-2 rounded bg-white/15 hover:bg-white/25 text-current transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center"
                title="Clear all products"
              >
                <Icon name="trash" className="w-4 h-4" />
                <span className="ml-1 text-sm">Clear</span>
              </button>
            )}
            <label
              className="flex items-center gap-2 text-xs font-medium opacity-90 flex-wrap rounded px-2 py-1 border text-left"
              style={{
                backgroundColor: toggleBackground,
                borderColor: toggleBorder,
              }}
            >
              <input
                type="checkbox"
                checked={!shelf.hidePricing}
                onChange={handlePricingToggleChange}
                disabled={isControlsDisabled}
                className="w-4 h-4 rounded border-white/40 bg-transparent"
              />
              <span className="whitespace-pre leading-tight">
                {'Show pricing\nin preview'}
              </span>
            </label>
          </div>
        </div>
      </div>


      {/* Products List */}
      <div className="space-y-2 px-3 pb-3 pt-2">
        {productsWithIndex.map(({ product, originalIndex }, index) => (
          <PrePackagedProductInputRow
            key={product.id}
            product={product}
            onUpdate={(updatedProduct) => onUpdateProduct(product.id, updatedProduct)}
            onRemove={() => onRemoveProduct(product.id)}
            onCopy={(direction) => onCopyProduct(product.id, direction)}
            onMove={moveEnabled ? onMoveProduct : undefined}
            onMoveUp={moveEnabled && onMoveProductUp ? () => onMoveProductUp(shelf.id, originalIndex) : undefined}
            onMoveDown={moveEnabled && onMoveProductDown ? () => onMoveProductDown(shelf.id, originalIndex) : undefined}
            theme={theme}
            isNewlyAdded={product.id === newlyAddedProductId}
            shelfId={shelf.id}
            productIndex={originalIndex}
            availableShelves={availableShelves}
            isFirst={index === 0}
            isLast={index === productsWithIndex.length - 1}
            isControlsDisabled={isControlsDisabled}
            shelfColor={shelf.color}
            isAnyDropdownOpen={isAnyDropdownOpen}
            onDropdownOpenChange={setIsAnyDropdownOpen}
          />
        ))}
      </div>

      {/* Add Product Button */}
      <button
        onClick={onAddProduct}
        disabled={isControlsDisabled}
        className={`w-full mt-2 p-3 border-2 border-dashed rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark'
            ? 'border-gray-600 text-gray-200 hover:border-gray-500'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        <Icon name="plus" className="w-5 h-5 inline mr-2" />
        Add Product
      </button>
    </div>
  );
};
