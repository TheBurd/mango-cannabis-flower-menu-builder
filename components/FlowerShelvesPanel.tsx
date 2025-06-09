
import React from 'react';
import { Shelf, Strain, SortCriteria } from '../types';
import { ShelfComponent } from './ShelfComponent';

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
}

export const FlowerShelvesPanel: React.FC<FlowerShelvesPanelProps> = ({
  shelves,
  onAddStrain,
  onUpdateStrain,
  onRemoveStrain,
  onCopyStrain,
  onClearShelfStrains,
  newlyAddedStrainId,
  style,
  onUpdateShelfSortCriteria,
}) => {
  return (
    <div 
      id="flower-shelves-panel" // Added ID for aria-controls
      className="no-print flex-shrink-0 bg-gray-800 p-1 rounded-lg shadow-lg overflow-y-auto"
      style={style} // Apply dynamic width for resizable panel
    >
      <div className="space-y-3 p-1"> {/* Added padding inside scrollable area */}
        {shelves.map(shelf => (
          <ShelfComponent
            key={shelf.id}
            shelf={shelf} // shelf.strains is already sorted
            onAddStrain={() => onAddStrain(shelf.id)}
            onUpdateStrain={(strainId, updatedStrain) => onUpdateStrain(shelf.id, strainId, updatedStrain)}
            onRemoveStrain={(strainId) => onRemoveStrain(shelf.id, strainId)} 
            onCopyStrain={(strainId, direction) => onCopyStrain(shelf.id, strainId, direction)}
            onClearStrains={() => onClearShelfStrains(shelf.id)}
            newlyAddedStrainId={newlyAddedStrainId}
            onUpdateShelfSortCriteria={(key) => onUpdateShelfSortCriteria(shelf.id, key)}
          />
        ))}
      </div>
    </div>
  );
};