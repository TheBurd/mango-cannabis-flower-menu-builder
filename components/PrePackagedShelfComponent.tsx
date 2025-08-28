import React, { useEffect, useRef, useState } from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedProductInputRow } from './PrePackagedProductInputRow';
import { Icon } from './common/Icon';
import { CustomDropdown } from './common/CustomDropdown';

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
  currentState,
  isControlsDisabled,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newly added product
  useEffect(() => {
    if (newlyAddedProductId && shelf.products.some(p => p.id === newlyAddedProductId)) {
      setTimeout(() => {
        const productElement = document.querySelector(`[data-product-id="${newlyAddedProductId}"]`);
        if (productElement) {
          productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [newlyAddedProductId, shelf.products]);


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

  return (
    <div
      ref={shelfRef}
      className={`rounded-lg border-2 p-4 transition-all duration-200 ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}
      id={`shelf-${shelf.id}`}
    >
      {/* Shelf Header */}
      <div className={`rounded-md p-3 mb-4 ${shelf.color}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-bold ${shelf.textColor}`}>
            {shelf.name} ({shelf.products.length})
          </h3>
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <CustomDropdown
              value={shelf.sortCriteria?.key || ''}
              onChange={(value) => onUpdateShelfSortCriteria(value as PrePackagedSortCriteria['key'])}
              options={sortOptions}
              placeholder="Sort by..."
              className="text-sm"
              theme={theme}
            />
            
            {/* Clear Products Button */}
            {shelf.products.length > 0 && (
              <button
                onClick={onClearProducts}
                disabled={isControlsDisabled}
                className={`p-2 rounded ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Clear all products"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Products List */}
      <div className="space-y-2">
        {shelf.products.map((product, index) => (
          <PrePackagedProductInputRow
            key={product.id}
            product={product}
            onUpdate={(updatedProduct) => onUpdateProduct(product.id, updatedProduct)}
            onRemove={() => onRemoveProduct(product.id)}
            onCopy={(direction) => onCopyProduct(product.id, direction)}
            onMove={onMoveProduct}
            onMoveUp={onMoveProductUp ? () => onMoveProductUp(shelf.id, index) : undefined}
            onMoveDown={onMoveProductDown ? () => onMoveProductDown(shelf.id, index) : undefined}
            theme={theme}
            isNewlyAdded={product.id === newlyAddedProductId}
            shelfId={shelf.id}
            productIndex={index}
            availableShelves={availableShelves}
            isFirst={index === 0}
            isLast={index === shelf.products.length - 1}
            isControlsDisabled={isControlsDisabled}
            shelfColor={shelf.color}
          />
        ))}
      </div>

      {/* Add Product Button */}
      <button
        onClick={onAddProduct}
        disabled={isControlsDisabled}
        className={`w-full mt-4 p-3 border-2 border-dashed rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
            : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'
        }`}
      >
        <Icon name="plus" className="w-5 h-5 inline mr-2" />
        Add Product
      </button>
    </div>
  );
};