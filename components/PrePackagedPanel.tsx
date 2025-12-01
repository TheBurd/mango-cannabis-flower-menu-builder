import React, { useEffect, useState, useCallback, useImperativeHandle, useMemo } from 'react';
import { PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, Theme, SupportedStates } from '../types';
import { PrePackagedShelfComponent } from './PrePackagedShelfComponent';
import { PrePackagedShelfTabs } from './PrePackagedShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { ScrollOverlayFooter } from './common/ScrollOverlayFooter';
import { useAdvancedScrollOverlay } from '../hooks/useAdvancedScrollOverlay';
import { MagnifyingGlassIcon } from './common/Icon';

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

type ProductSearchField = 'name' | 'brand' | 'type' | 'shelf' | 'all';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<ProductSearchField>('name');
  const [overlayEnabled, setOverlayEnabled] = useState(() => {
    // Load preference from localStorage, default to true
    const saved = localStorage.getItem('prepackagedScrollOverlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [overlayHovered, setOverlayHovered] = useState(false);
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  
  // Combine refs - target the scrollable container
  const scrollContainerRef = React.useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);
  
  const divRef = React.useCallback((node: HTMLDivElement) => {
    internalRef.current = node;
  }, []);

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => internalRef.current, [internalRef.current]);

  const searchFieldOptions: Array<{ value: ProductSearchField; label: string }> = useMemo(() => ([
    { value: 'name', label: 'Product Name' },
    { value: 'brand', label: 'Grow/Brand' },
    { value: 'type', label: 'Class' },
    { value: 'all', label: 'Any Field' },
    { value: 'shelf', label: 'Shelf' },
  ]), []);

  const { shelvesForDisplay, isSearchActive, totalSearchMatches } = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 0;

    const results = shelves.map((shelf) => {
      const baseProducts = (shelf.products || []).map((product, index) => ({ product, originalIndex: index }));

      if (!hasQuery) {
        return { shelf, visibleProducts: baseProducts };
      }

      const shelfNameMatches = searchField === 'shelf' && shelf.name.toLowerCase().includes(normalizedQuery);

      const filteredProducts = baseProducts.filter(({ product }) => {
        const name = (product.name || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const type = (product.type || '').toLowerCase();
        switch (searchField) {
          case 'name':
            return name.includes(normalizedQuery);
          case 'brand':
            return brand.includes(normalizedQuery);
          case 'type':
            return type.includes(normalizedQuery);
          case 'all':
            return name.includes(normalizedQuery) || brand.includes(normalizedQuery) || type.includes(normalizedQuery);
          case 'shelf':
            return shelfNameMatches;
          default:
            return false;
        }
      });

      return {
        shelf,
        visibleProducts: shelfNameMatches ? baseProducts : filteredProducts,
      };
    });

    const filteredResults = hasQuery
      ? results.filter((entry) => entry.visibleProducts.length > 0)
      : results;

    const totalMatches = filteredResults.reduce((sum, entry) => sum + entry.visibleProducts.length, 0);

    return {
      shelvesForDisplay: filteredResults,
      isSearchActive: hasQuery,
      totalSearchMatches: hasQuery ? totalMatches : null,
    };
  }, [shelves, searchField, searchQuery]);

  const shelvesToRender: PrePackagedShelf[] = useMemo(() => {
    return shelvesForDisplay.map(({ shelf, visibleProducts }) => ({
      ...shelf,
      products: visibleProducts.map(({ product }) => product),
    }));
  }, [shelvesForDisplay]);

  // Keep tabs/overlay stable even if search yields zero matches
  const shelvesForTabsAndOverlay = useMemo(() => {
    if (isSearchActive && shelvesToRender.length === 0) {
      return shelves;
    }
    return shelvesToRender;
  }, [isSearchActive, shelves, shelvesToRender]);
  
  // Convert PrePackagedShelf to match Shelf interface for unified hook
  const adaptedShelves = React.useMemo(() => {
    return shelvesForTabsAndOverlay.map(shelf => ({
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
  }, [shelvesForTabsAndOverlay]);
  
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
            shelves={shelvesForTabsAndOverlay}
            onScrollToShelf={onScrollToShelf}
            theme={theme}
          />
        </div>
        <div className={`flex flex-col gap-2 px-3 py-2 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900/70' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchFieldOptions.find(opt => opt.value === searchField)?.label ?? 'Product'}...`}
                className={`w-full pl-9 pr-10 py-2 rounded-md text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/30'
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/30'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={`flex rounded-md overflow-hidden border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              {searchFieldOptions.map((option, index) => {
                const isActive = option.value === searchField;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSearchField(option.value)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    } ${index !== searchFieldOptions.length - 1 ? (theme === 'dark' ? 'border-r border-gray-700' : 'border-r border-gray-200') : ''}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {isSearchActive && (
            <div className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-semibold text-orange-500">{totalSearchMatches ?? 0}</span>
              <span>matches across {shelvesForDisplay.length} shelf{shelvesForDisplay.length === 1 ? '' : 's'} - reordering is disabled while search is active</span>
            </div>
          )}
        </div>
        
        {/* Scrollable content area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-3 p-1">
            {shelvesForDisplay.length === 0 ? (
              <div className={`p-6 text-center text-sm rounded-md border ${theme === 'dark' ? 'border-gray-700 text-gray-300 bg-gray-800/70' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                No products found for "{searchQuery.trim()}". Try a different search term or switch fields.
              </div>
            ) : (
              shelvesForDisplay.map(({ shelf, visibleProducts }) => (
                <div key={shelf.id} data-shelf-id={shelf.id}>
                  <PrePackagedShelfComponent
                    shelf={shelf}
                    visibleProducts={visibleProducts}
                    isSearchActive={isSearchActive}
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
              ))
            )}
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
          isVisible={scrollOverlayState.showOverlay || overlayHovered}
          strains={scrollOverlayState.allStrains}
          centerStrainIndex={scrollOverlayState.centerStrainIndex}
          containerElement={containerElement}
          theme={theme}
          onHoverChange={(hovering) => setOverlayHovered(hovering)}
          onStrainClick={(strainId, shelfId) => {
            if (!containerElement) return;
            const shelfEl = containerElement.querySelector(`[data-shelf-id="${shelfId}"]`);
            const target = shelfEl?.querySelector<HTMLElement>(`[data-product-id="${strainId}"]`);
            target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          }}
        />
      )}
    </>
  );
});

export const PrePackagedPanel = React.memo(PrePackagedPanelBase);
