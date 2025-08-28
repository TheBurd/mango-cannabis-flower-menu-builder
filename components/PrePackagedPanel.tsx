import React, { useEffect, useState, useRef } from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedShelfComponent } from './PrePackagedShelfComponent';
import { PrePackagedShelfTabs } from './PrePackagedShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { useScrollVelocity } from '../hooks/useScrollVelocity';
import { useVisibleStrains } from '../hooks/useVisibleStrains';

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

export const PrePackagedPanel = React.memo(React.forwardRef<HTMLDivElement, PrePackagedPanelProps>(({
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
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const showOverlayRef = useRef(false);
  const internalRef = React.useRef<HTMLDivElement>(null);
  
  // Combine refs
  const divRef = React.useCallback((node: HTMLDivElement) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    internalRef.current = node;
    setContainerElement(node);
  }, [ref]);
  
  // Track scroll velocity
  const { isScrolling, isScrollbarDragging } = useScrollVelocity({
    element: containerElement,
    threshold: 15, // Very low threshold - show on light scrolling
    hideDelay: 2500 // Stay visible much longer (2.5 seconds)
  });
  
  // Convert PrePackagedShelf to match Shelf interface for hooks
  const adaptedShelves = React.useMemo(() => {
    return shelves.map(shelf => ({
      ...shelf,
      strains: shelf.products.map(product => ({
        id: product.id,
        name: product.name,
        grower: product.brand,
        thc: product.thc,
        type: product.type,
        isLastJar: product.isLowStock || false,
        isSoldOut: product.isSoldOut
      }))
    }));
  }, [shelves]);
  
  // Track visible products
  const { allStrains, centerStrainIndex } = useVisibleStrains({
    shelves: adaptedShelves as any,
    containerElement,
    rootMargin: '-20% 0px -20% 0px'
  });
  
  // Show overlay immediately when scrolling
  useEffect(() => {
    const shouldShow = isScrolling || isScrollbarDragging;
    // Only update state if actually changed
    if (shouldShow !== showOverlayRef.current) {
      showOverlayRef.current = shouldShow;
      setShowOverlay(shouldShow);
    }
  }, [isScrolling, isScrollbarDragging]);
  
  
  return (
    <>
      <div 
        ref={divRef}
        id="prepackaged-panel" // Added ID for aria-controls
        className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-y-auto relative ${
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
    
    {/* Scroll Navigation Overlay */}
    <ScrollNavigationOverlay
      isVisible={showOverlay}
      strains={allStrains}
      centerStrainIndex={centerStrainIndex}
      containerElement={containerElement}
      theme={theme}
    />
  </>
  );
}));