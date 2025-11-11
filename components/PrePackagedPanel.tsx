import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedShelfComponent } from './PrePackagedShelfComponent';
import { PrePackagedShelfTabs } from './PrePackagedShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { ScrollOverlayFooter } from './common/ScrollOverlayFooter';
import { useAdvancedScrollOverlay } from '../hooks/useAdvancedScrollOverlay';

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
  scrollTarget?: { mode: 'bulk' | 'prepackaged'; shelfId: string; itemId: string } | null;
  onScrollTargetHandled?: () => void;
  onToggleShelfPricingVisibility: (shelfId: string, showPricing: boolean) => void;
}

const PrePackagedPanelBase = React.forwardRef<HTMLDivElement | null, PrePackagedPanelProps>((props, ref) => {
  const {
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
    scrollTarget,
    onScrollTargetHandled,
    onToggleShelfPricingVisibility,
  } = props;

  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [overlayEnabled, setOverlayEnabled] = useState(() => {
    // Load preference from localStorage, default to true
    const saved = localStorage.getItem('prepackagedScrollOverlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  
  // Combine refs - target the scrollable container
  const scrollContainerRef = React.useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);
  
  const divRef = React.useCallback((node: HTMLDivElement) => {
    internalRef.current = node;
  }, []);

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => internalRef.current, [internalRef.current]);
  
  // Convert PrePackagedShelf to match Shelf interface for unified hook
  const adaptedShelves = React.useMemo(() => {
    return shelves.map(shelf => ({
      ...shelf,
      strains: (shelf.products || []).map(product => ({
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
  
  // Use the advanced scroll overlay manager for better performance
  const scrollOverlayState = useAdvancedScrollOverlay({
    enabled: overlayEnabled,
    shelves: adaptedShelves as any,
    containerElement,
    velocityThreshold: 15,
    hideDelay: 2500,
    rootMargin: '-20% 0px -20% 0px',
    maxVisibleStrains: 50,
    performanceMode: 'auto' // Auto-detects performance needs
  });
  
  // Handle overlay toggle with persistence
  const handleOverlayToggle = useCallback((enabled: boolean) => {
    setOverlayEnabled(enabled);
    localStorage.setItem('prepackagedScrollOverlayEnabled', JSON.stringify(enabled));
  }, []);

  // Scroll newly created or duplicated products into view reliably
  useEffect(() => {
    if (!scrollTarget || scrollTarget.mode !== 'prepackaged') return;
    if (!containerElement) return;

    const { shelfId, itemId } = scrollTarget;

    const scrollIntoView = () => {
      const shelfElement = containerElement.querySelector(`[data-shelf-id="${shelfId}"]`);
      if (!shelfElement) return false;
      const itemElement = shelfElement.querySelector<HTMLElement>(`[data-product-id="${itemId}"]`);
      if (!itemElement) return false;
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      onScrollTargetHandled?.();
      return true;
    };

    if (scrollIntoView()) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollIntoView();
    }, 75);

    return () => window.clearTimeout(timeout);
  }, [scrollTarget, containerElement, onScrollTargetHandled]);

  
  return (
    <>
      <div 
        ref={divRef}
        id="prepackaged-panel"
        className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-hidden relative flex flex-col ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={style}
      >
        {/* Header with tabs */}
        <div className="flex-shrink-0">
          <PrePackagedShelfTabs 
            shelves={shelves}
            onScrollToShelf={onScrollToShelf}
            theme={theme}
          />
        </div>
        
        {/* Scrollable content area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-3 p-1">
            {shelves.map(shelf => (
              <div key={shelf.id} data-shelf-id={shelf.id}>
                <PrePackagedShelfComponent
                  shelf={shelf}
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
                  onTogglePricingVisibility={(show) => onToggleShelfPricingVisibility(shelf.id, show)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with overlay toggle - wrapped to allow tooltip overflow */}
        <div className="relative" style={{ overflow: 'visible' }}>
          <ScrollOverlayFooter
            enabled={overlayEnabled}
            onToggle={handleOverlayToggle}
            theme={theme}
            performanceLevel={scrollOverlayState.performanceLevel}
            frameSkipCount={scrollOverlayState.frameSkipCount}
            currentFPS={scrollOverlayState.currentFPS}
            avgFrameTime={scrollOverlayState.avgFrameTime}
            totalStrains={scrollOverlayState.totalStrains}
            memoryUsage={scrollOverlayState.memoryUsage}
            dropFrameRate={scrollOverlayState.dropFrameRate}
          />
        </div>
      </div>
    
      {/* Scroll Overlay - only rendered when enabled */}
      {overlayEnabled && (
        <ScrollNavigationOverlay
          isVisible={scrollOverlayState.showOverlay}
          strains={scrollOverlayState.allStrains}
          centerStrainIndex={scrollOverlayState.centerStrainIndex}
          containerElement={containerElement}
          theme={theme}
        />
      )}
    </>
  );
});

export const PrePackagedPanel = React.memo(PrePackagedPanelBase);
