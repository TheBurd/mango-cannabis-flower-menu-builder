import React, { useEffect, useState, useRef } from 'react';
import { Shelf, Strain, SortCriteria, Theme, SupportedStates } from '../types';
import { ShelfComponent } from './ShelfComponent';
import { ShelfTabs } from './ShelfTabs';
import { ScrollNavigationOverlay } from './common/ScrollNavigationOverlay';
import { useScrollVelocity } from '../hooks/useScrollVelocity';
import { useVisibleStrains } from '../hooks/useVisibleStrains';

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
  
  // Track scroll velocity and detect fast scrolling
  const { isScrolling, isScrollbarDragging } = useScrollVelocity({
    element: containerElement,
    threshold: 15, // Very low threshold - show on light scrolling
    hideDelay: 2500 // Stay visible much longer (2.5 seconds)
  });
  
  // Track visible strains
  const { allStrains, centerStrainIndex } = useVisibleStrains({
    shelves,
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
        id="flower-shelves-panel" // Added ID for aria-controls
        className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-y-auto relative ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } ${isControlsDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={style} // Apply dynamic width for resizable panel
      >
      <ShelfTabs 
        shelves={shelves}
        onScrollToShelf={onScrollToShelf}
        theme={theme}
        isDragging={false}
      />
      <div className="space-y-3 p-1"> {/* Added padding inside scrollable area */}
        {shelves.map(shelf => (
          <div key={shelf.id} data-shelf-id={shelf.id}>
            <ShelfComponent
              shelf={shelf} // shelf.strains is already sorted
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
});