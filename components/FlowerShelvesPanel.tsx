import React from 'react';
import { Shelf, Strain, SortCriteria, Theme } from '../types';
import { ShelfComponent } from './ShelfComponent';
import { ShelfTabs } from './ShelfTabs';

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
  dragState?: { strainId: string; shelfId: string; strainIndex: number } | null;
  onDragStart?: (strainId: string, shelfId: string, strainIndex: number) => void;
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
  onReorderStrain,
  dragState,
  onDragStart,
}, ref) => {
  return (
    <div 
      ref={ref}
      id="flower-shelves-panel" // Added ID for aria-controls
      className={`no-print flex-shrink-0 rounded-lg shadow-lg overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
      style={style} // Apply dynamic width for resizable panel
    >
      <ShelfTabs 
        shelves={shelves}
        onScrollToShelf={onScrollToShelf}
        theme={theme}
        isDragging={!!dragState}
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
              onReorderStrain={onReorderStrain}
              dragState={dragState}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
});