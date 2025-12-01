import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Shelf, Strain, SortCriteria, Theme, SupportedStates } from '../types';
import { ShelfComponent } from './ShelfComponent';
import { ShelfTabs } from './ShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { ScrollOverlayFooter } from './common/ScrollOverlayFooter';
import { useAdvancedScrollOverlay } from '../hooks/useAdvancedScrollOverlay';
import { MagnifyingGlassIcon } from './common/Icon';

interface FlowerShelvesPanelProps {
  shelves: Shelf[]; // Will receive processed (sorted) shelves
  onAddStrain: (shelfId: string) => void;
  onUpdateStrain: (shelfId: string, strainId: string, updatedStrain: Partial<Strain>) => void;
  onRemoveStrain: (shelfId: string, strainId: string) => void;
  onCopyStrain: (shelfId: string, strainId: string, direction: 'above' | 'below') => void;
  onClearShelfStrains: (shelfId: string) => void;
  newlyAddedStrainId: string | null;
  style?: React.CSSProperties;
  onUpdateShelfSortCriteria: (shelfId: string, key: SortCriteria['key']) => void;
  onScrollToShelf: (shelfId: string) => void;
  theme: Theme;
  onMoveStrain?: (fromShelfId: string, toShelfId: string, strainIndex: number, targetIndex?: number) => void;
  onReorderStrain?: (shelfId: string, fromIndex: number, toIndex: number) => void;
  currentState?: SupportedStates; // Current app state for shelf hierarchy
  isControlsDisabled?: boolean;
  onMoveStrainUp?: (shelfId: string, strainIndex: number) => void;
  onMoveStrainDown?: (shelfId: string, strainIndex: number) => void;
  scrollTarget?: { mode: 'bulk' | 'prepackaged'; shelfId: string; itemId: string } | null;
  onScrollTargetHandled?: () => void;
  onToggleShelfPricingVisibility: (shelfId: string, showPricing: boolean) => void;
}

type StrainSearchField = 'name' | 'grower' | 'type' | 'shelf' | 'all';

export const FlowerShelvesPanel = React.forwardRef<HTMLDivElement, FlowerShelvesPanelProps>(({
  shelves,
  onAddStrain,
  onUpdateStrain,
  onRemoveStrain,
  onCopyStrain,
  onClearShelfStrains,
  newlyAddedStrainId,
  style,
  onUpdateShelfSortCriteria,
  onScrollToShelf,
  theme,
  onMoveStrain,
  onMoveStrainUp,
  onMoveStrainDown,
  currentState,
  isControlsDisabled,
  scrollTarget,
  onScrollTargetHandled,
  onToggleShelfPricingVisibility,
}, ref) => {
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<StrainSearchField>('name');
  const [overlayEnabled, setOverlayEnabled] = useState(() => {
    // Load preference from localStorage, default to true
    const saved = localStorage.getItem('scrollOverlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [overlayHovered, setOverlayHovered] = useState(false);
  const internalRef = React.useRef<HTMLDivElement>(null);
  
  // Combine refs - target the scrollable container
  const scrollContainerRef = React.useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);
  
  const divRef = React.useCallback((node: HTMLDivElement) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    internalRef.current = node;
  }, [ref]);

  const searchFieldOptions: Array<{ value: StrainSearchField; label: string }> = useMemo(() => ([
    { value: 'name', label: 'Strain Name' },
    { value: 'grower', label: 'Grow/Brand' },
    { value: 'type', label: 'Class' },
    { value: 'all', label: 'Any Field' },
    { value: 'shelf', label: 'Shelf' },
  ]), []);

  const { shelvesForDisplay, isSearchActive, totalSearchMatches } = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 0;

    const results = shelves.map((shelf) => {
      const baseStrains = shelf.strains.map((strain, index) => ({ strain, originalIndex: index }));

      if (!hasQuery) {
        return { shelf, visibleStrains: baseStrains };
      }

      const shelfNameMatches = searchField === 'shelf' && shelf.name.toLowerCase().includes(normalizedQuery);

      const filteredStrains = baseStrains.filter(({ strain }) => {
        const name = (strain.name || '').toLowerCase();
        const grower = (strain.grower || '').toLowerCase();
        const type = (strain.type || '').toLowerCase();
        switch (searchField) {
          case 'name':
            return name.includes(normalizedQuery);
          case 'grower':
            return grower.includes(normalizedQuery);
          case 'type':
            return type.includes(normalizedQuery);
          case 'all':
            return name.includes(normalizedQuery) || grower.includes(normalizedQuery) || type.includes(normalizedQuery);
          case 'shelf':
            return shelfNameMatches;
          default:
            return false;
        }
      });

      return {
        shelf,
        visibleStrains: shelfNameMatches ? baseStrains : filteredStrains,
      };
    });

    const filteredResults = hasQuery
      ? results.filter((entry) => entry.visibleStrains.length > 0)
      : results;

    const totalMatches = filteredResults.reduce((sum, entry) => sum + entry.visibleStrains.length, 0);

    return {
      shelvesForDisplay: filteredResults,
      isSearchActive: hasQuery,
      totalSearchMatches: hasQuery ? totalMatches : null,
    };
  }, [shelves, searchField, searchQuery]);

  const shelvesToRender: Shelf[] = useMemo(() => {
    return shelvesForDisplay.map(({ shelf, visibleStrains }) => ({
      ...shelf,
      strains: visibleStrains.map(({ strain }) => strain),
    }));
  }, [shelvesForDisplay]);

  // Keep tabs/overlay stable even if search yields zero matches
  const shelvesForTabsAndOverlay = useMemo(() => {
    if (isSearchActive && shelvesToRender.length === 0) {
      return shelves;
    }
    return shelvesToRender;
  }, [isSearchActive, shelves, shelvesToRender]);
  
  // Use the advanced scroll overlay manager for better performance
  const scrollOverlayState = useAdvancedScrollOverlay({
    enabled: overlayEnabled,
    shelves: shelvesForTabsAndOverlay,
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
    localStorage.setItem('scrollOverlayEnabled', JSON.stringify(enabled));
  }, []);

  // Scroll newly created or duplicated strains into view reliably
  useEffect(() => {
    if (!scrollTarget || scrollTarget.mode !== 'bulk') return;
    if (!containerElement) return;

    const { shelfId, itemId } = scrollTarget;

    const scrollIntoView = () => {
      const shelfElement = containerElement.querySelector(`[data-shelf-id="${shelfId}"]`);
      if (!shelfElement) return false;
      const itemElement = shelfElement.querySelector<HTMLElement>(`[data-strain-id="${itemId}"]`);
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
        id="flower-shelves-panel"
        className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-hidden relative flex flex-col ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={style}
      >
        {/* Header with tabs */}
        <div className="flex-shrink-0">
          <ShelfTabs 
            shelves={shelvesForTabsAndOverlay}
            onScrollToShelf={onScrollToShelf}
            theme={theme}
            isDragging={false}
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
                placeholder={`Search by ${searchFieldOptions.find(opt => opt.value === searchField)?.label ?? 'Strain'}...`}
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
                No strains found for "{searchQuery.trim()}". Try a different search term or switch fields.
              </div>
            ) : (
              shelvesForDisplay.map(({ shelf, visibleStrains }) => (
                <div key={shelf.id} data-shelf-id={shelf.id}>
                  <ShelfComponent
                    shelf={shelf}
                    visibleStrains={visibleStrains}
                    isSearchActive={isSearchActive}
                    onAddStrain={() => onAddStrain(shelf.id)}
                    onUpdateStrain={(strainId, updatedStrain) => onUpdateStrain(shelf.id, strainId, updatedStrain)}
                    onRemoveStrain={(strainId) => onRemoveStrain(shelf.id, strainId)} 
                    onCopyStrain={(strainId, direction) => onCopyStrain(shelf.id, strainId, direction)}
                    onClearStrains={() => onClearShelfStrains(shelf.id)}
                    newlyAddedStrainId={newlyAddedStrainId}
                    onUpdateShelfSortCriteria={(key) => onUpdateShelfSortCriteria(shelf.id, key)}
                    theme={theme}
                    onMoveStrain={onMoveStrain}
                    onMoveStrainUp={onMoveStrainUp}
                    onMoveStrainDown={onMoveStrainDown}
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
            const target = shelfEl?.querySelector<HTMLElement>(`[data-strain-id="${strainId}"]`);
            target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          }}
        />
      )}
    </>
  );
});
