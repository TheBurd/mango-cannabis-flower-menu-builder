
import React, { useState, useEffect, useCallback } from 'react';
import { Shelf, Strain, SortCriteria, Theme } from '../types';
import { StrainInputRow } from './StrainInputRow';
import { DropZone } from './common/DropZone';
import { Button } from './common/Button';
import { PlusIcon, TrashXmarkIcon, MinusCircleIcon, SortAscendingIcon, SortDescendingIcon } from './common/Icon';

interface ShelfComponentProps {
  shelf: Shelf; // shelf.strains is pre-sorted
  onAddStrain: () => void;
  onUpdateStrain: (strainId: string, updatedStrain: Partial<Strain>) => void;
  onRemoveStrain: (strainId: string) => void;
  onCopyStrain: (strainId: string, direction: 'above' | 'below') => void;
  onClearStrains: () => void;
  newlyAddedStrainId: string | null;
  onUpdateShelfSortCriteria: (key: SortCriteria['key']) => void;
  theme: Theme;
  onMoveStrain?: (fromShelfId: string, toShelfId: string, strainIndex: number, targetIndex?: number) => void;
  onReorderStrain?: (shelfId: string, fromIndex: number, toIndex: number) => void;
  dragState?: { strainId: string; shelfId: string; strainIndex: number } | null;
  onDragStart?: (strainId: string, shelfId: string, strainIndex: number) => void;
}

const CONFIRMATION_TIMEOUT = 3000; // 3 seconds

const SortButtonShelf: React.FC<{
  label: string;
  sortKey: SortCriteria['key'];
  currentSortCriteria: SortCriteria | null;
  onClick: () => void;
  shelfColor?: string; // To slightly adapt button color
}> = ({ label, sortKey, currentSortCriteria, onClick, shelfColor }) => {
  const isActive = currentSortCriteria?.key === sortKey;
  const direction = isActive ? currentSortCriteria.direction : null;
  // Basic color adaptation, could be more sophisticated
  const activeColor = shelfColor ? 'bg-white/30 hover:bg-white/40' : 'bg-orange-500 hover:bg-orange-600';
  const inactiveColor = shelfColor ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-500 hover:bg-gray-400';
  const buttonColor = isActive ? activeColor : inactiveColor;

  return (
    <Button
      onClick={onClick}
      variant="custom"
      size="sm"
      className={`flex items-center space-x-1 text-current text-xs !py-0.5 px-1.5 ${buttonColor}`}
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      {isActive && direction === 'asc' && <SortAscendingIcon className="w-3 h-3" />}
      {isActive && direction === 'desc' && <SortDescendingIcon className="w-3 h-3" />}
    </Button>
  );
};

export const ShelfComponent: React.FC<ShelfComponentProps> = ({
  shelf,
  onAddStrain,
  onUpdateStrain,
  onRemoveStrain,
  onCopyStrain,
  onClearStrains,
  newlyAddedStrainId,
  onUpdateShelfSortCriteria,
  theme,
  onMoveStrain,
  onReorderStrain,
  dragState,
  onDragStart,
}) => {
  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearStrainsClick = useCallback(() => {
    if (confirmClear) {
      onClearStrains();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }, [confirmClear, onClearStrains]);

  useEffect(() => {
    let timer: number;
    if (confirmClear) {
      timer = window.setTimeout(() => setConfirmClear(false), CONFIRMATION_TIMEOUT);
    }
    return () => clearTimeout(timer);
  }, [confirmClear]);
  
  const handleDeleteLastStrain = () => {
    if (shelf.strains.length > 0) {
      const lastStrainId = shelf.strains[shelf.strains.length - 1].id;
      onRemoveStrain(lastStrainId); 
    }
  };
  
  const sortOptions: Array<{ label: string; key: SortCriteria['key'] }> = [
    { label: "Name", key: "name" },
    { label: "Grower", key: "grower" },
    { label: "Class", key: "type" },
    { label: "THC%", key: "thc" },
    { label: "Last Jar", key: "isLastJar" },
  ];

  const handleDropBetweenStrains = (dragData: any, targetIndex: number) => {
    if (dragData.shelfId === shelf.id) {
      // Reordering within same shelf
      if (onReorderStrain) {
        onReorderStrain(shelf.id, dragData.strainIndex, targetIndex);
      }
    } else {
      // Moving between shelves
      if (onMoveStrain) {
        onMoveStrain(dragData.shelfId, shelf.id, dragData.strainIndex, targetIndex);
      }
    }
  };

  const handleDropAtEnd = (dragData: any) => {
    if (dragData.shelfId === shelf.id) {
      // Reordering within same shelf to end
      if (onReorderStrain) {
        onReorderStrain(shelf.id, dragData.strainIndex, shelf.strains.length);
      }
    } else {
      // Moving between shelves to end
      if (onMoveStrain) {
        onMoveStrain(dragData.shelfId, shelf.id, dragData.strainIndex);
      }
    }
  };

  return (
    <div 
      data-shelf-id={shelf.id}
      className={`rounded-lg shadow-md overflow-hidden border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
      } ${shelf.color}`}>
      <div className={`p-3 ${shelf.textColor} flex flex-col`}>
        <div className="flex justify-between items-start mb-1.5">
            <div>
                <h3 className="text-xl font-semibold">{shelf.name}</h3>
                <p className="text-xs opacity-90">
                {formatPrice(shelf.pricing.g)}/g | {formatPrice(shelf.pricing.eighth)}/8th | {formatPrice(shelf.pricing.quarter)}/Qtr | {formatPrice(shelf.pricing.half)}/Half | {formatPrice(shelf.pricing.oz)}/Oz
                </p>
            </div>
            <Button 
                onClick={handleClearStrainsClick} 
                variant="custom" 
                size="sm" 
                className={`bg-white/10 hover:bg-white/20 text-current !py-1 !px-2 flex items-center space-x-1 min-w-[80px] justify-center ${confirmClear ? 'bg-red-500/30 hover:bg-red-400/30' : ''}`}
            >
              <TrashXmarkIcon className="w-4 h-4" theme="dark" />
              <span className="text-xs">{confirmClear ? "Sure?" : "Clear"}</span>
            </Button>
        </div>
        {/* Shelf Sort Controls */}
        <div className="flex items-center space-x-1 border-t border-white/10 pt-1.5 mt-1 flex-wrap gap-y-1">
            <span className="text-xs opacity-80 mr-1">Sort this shelf:</span>
            {sortOptions.map(opt => (
                <SortButtonShelf
                  key={opt.key}
                  label={opt.label}
                  sortKey={opt.key}
                  currentSortCriteria={shelf.sortCriteria}
                  onClick={() => onUpdateShelfSortCriteria(opt.key)}
                  shelfColor={shelf.color}
                />
            ))}
        </div>
      </div>
      <div className={`p-3 space-y-2 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        {shelf.strains.length === 0 ? (
          <DropZone
            onDrop={(dragData) => handleDropAtEnd(dragData)}
            theme={theme}
            className="py-8 rounded-md"
            isVisible={!!dragState}
          >
            <div className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {dragState ? 'Drop strain here' : 'No strains on this shelf yet'}
            </div>
          </DropZone>
        ) : (
          <>
            {/* Drop zone at the beginning */}
            <DropZone
              onDrop={(dragData) => handleDropBetweenStrains(dragData, 0)}
              theme={theme}
              className="h-2 rounded"
              isVisible={!!dragState}
            />
            
            {shelf.strains.map((strain, index) => (
              <div key={strain.id}>
                <StrainInputRow
                  strain={strain}
                  onUpdate={(updatedStrain) => onUpdateStrain(strain.id, updatedStrain)}
                  onRemove={() => onRemoveStrain(strain.id)} 
                  onCopy={(direction) => onCopyStrain(strain.id, direction)}
                  isFirst={index === 0 && shelf.strains.length === 1} 
                  isLast={index === shelf.strains.length - 1 && shelf.strains.length === 1} 
                  isNewlyAdded={newlyAddedStrainId === strain.id}
                  theme={theme}
                  shelfId={shelf.id}
                  strainIndex={index}
                  isDragging={dragState?.strainId === strain.id}
                  onDragStart={onDragStart}
                />
                
                {/* Drop zone between strains */}
                <DropZone
                  onDrop={(dragData) => handleDropBetweenStrains(dragData, index + 1)}
                  theme={theme}
                  className="h-2 rounded"
                  isVisible={!!dragState}
                                 />
               </div>
            ))}
          </>
        )}
        <Button onClick={onAddStrain} variant="secondary" size="sm" className={`w-full flex items-center justify-center space-x-2 mt-2 ${
          theme === 'dark' 
            ? '!bg-gray-600 hover:!bg-gray-500 text-gray-300 hover:text-white'
            : '!bg-green-500/80 hover:!bg-green-400/80 text-green-50 hover:text-white'
        }`}>
          <PlusIcon className="w-5 h-5" />
          <span>Add Strain to {shelf.name}</span>
        </Button>
        {shelf.strains.length > 0 && (
           <Button 
            onClick={handleDeleteLastStrain} 
            variant="danger" 
            size="sm" 
            className={`w-full flex items-center justify-center space-x-2 mt-1 ${
              theme === 'dark'
                ? '!bg-red-700/80 hover:!bg-red-600/80 text-red-100 hover:text-white'
                : '!bg-red-500/80 hover:!bg-red-400/80 text-red-50 hover:text-white'
            }`}
          >
            <MinusCircleIcon className="w-5 h-5" />
            <span>Delete Last Strain</span>
          </Button>
        )}
      </div>
    </div>
  );
};