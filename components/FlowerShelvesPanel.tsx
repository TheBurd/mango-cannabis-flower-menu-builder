import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Shelf, Strain, SortCriteria, Theme, SupportedStates } from '../types';
import { ShelfComponent } from './ShelfComponent';
import { ShelfTabs } from './ShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { ScrollOverlayFooter } from './common/ScrollOverlayFooter';
import { useAdvancedScrollOverlay } from '../hooks/useAdvancedScrollOverlay';

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
}

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
}, ref) => {
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [overlayEnabled, setOverlayEnabled] = useState(() => {
    // Load preference from localStorage, default to true
    const saved = localStorage.getItem('scrollOverlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
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
  
  // Use the advanced scroll overlay manager for better performance
  const scrollOverlayState = useAdvancedScrollOverlay({
    enabled: overlayEnabled,
    shelves,
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
            shelves={shelves}
            onScrollToShelf={onScrollToShelf}
            theme={theme}
            isDragging={false}
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
                <ShelfComponent
                  shelf={shelf}
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
