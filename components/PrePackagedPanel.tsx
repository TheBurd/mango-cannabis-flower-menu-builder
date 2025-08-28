import React from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedShelfComponent } from './PrePackagedShelfComponent';
import { PrePackagedShelfTabs } from './PrePackagedShelfTabs';

interface PrePackagedPanelProps {
  shelves: PrePackagedShelf[]; // Will receive processed (sorted) shelves
  onAddProduct: (shelfId: string) => void;
  onUpdateProduct: (shelfId: string, productId: string, updatedProduct: Partial<PrePackagedProduct>) => void;
  onRemoveProduct: (shelfId: string, productId: string) => void;
  onCopyProduct: (shelfId: string, productId: string, direction: 'above' | 'below') => void;
  onClearShelfProducts: (shelfId: string) => void;
  newlyAddedProductId: string | null;
  style?: React.CSSProperties;
  onUpdateShelfSortCriteria: (shelfId: string, key: PrePackagedSortCriteria['key']) => void;
  onScrollToShelf: (shelfId: string) => void;
  theme: Theme;
  onMoveProduct?: (fromShelfId: string, toShelfId: string, productIndex: number, targetIndex?: number) => void;
  onMoveProductUp?: (shelfId: string, productIndex: number) => void;
  onMoveProductDown?: (shelfId: string, productIndex: number) => void;
  currentState?: SupportedStates; // Current app state for shelf hierarchy
  isControlsDisabled?: boolean;
}

export const PrePackagedPanel = React.forwardRef<HTMLDivElement, PrePackagedPanelProps>(({
  shelves,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  onCopyProduct,
  onClearShelfProducts,
  newlyAddedProductId,
  style,
  onUpdateShelfSortCriteria,
  onScrollToShelf,
  theme,
  onMoveProduct,
  onMoveProductUp,
  onMoveProductDown,
  currentState,
  isControlsDisabled,
}, ref) => {
  return (
    <div 
      ref={ref}
      id="prepackaged-panel" // Added ID for aria-controls
      className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={style} // Apply dynamic width for resizable panel
    >
      <PrePackagedShelfTabs 
        shelves={shelves}
        onScrollToShelf={onScrollToShelf}
        theme={theme}
      />
      <div className="space-y-3 p-1"> {/* Added padding inside scrollable area */}
        {shelves.map(shelf => (
          <div key={shelf.id} data-shelf-id={shelf.id}>
            <PrePackagedShelfComponent
              shelf={shelf} // shelf.products is already sorted
              onAddProduct={() => onAddProduct(shelf.id)}
              onUpdateProduct={(productId, updatedProduct) => onUpdateProduct(shelf.id, productId, updatedProduct)}
              onRemoveProduct={(productId) => onRemoveProduct(shelf.id, productId)} 
              onCopyProduct={(productId, direction) => onCopyProduct(shelf.id, productId, direction)}
              onClearProducts={() => onClearShelfProducts(shelf.id)}
              newlyAddedProductId={newlyAddedProductId}
              onUpdateShelfSortCriteria={(key) => onUpdateShelfSortCriteria(shelf.id, key)}
              theme={theme}
              onMoveProduct={onMoveProduct}
              onMoveProductUp={onMoveProductUp}
              onMoveProductDown={onMoveProductDown}
              availableShelves={shelves}
              currentState={currentState}
              isControlsDisabled={isControlsDisabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
});