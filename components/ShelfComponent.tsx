import React, { useState, useCallback, useEffect } from 'react';
import { Shelf, Strain, SortCriteria, Theme, SupportedStates } from '../types';
import { StrainInputRow } from './StrainInputRow';
import { DropZone } from './common/DropZone';
import { Button } from './common/Button';
import { PlusIcon, TrashXmarkIcon, MinusCircleIcon, SortAscendingIcon, SortDescendingIcon } from './common/Icon';
import { getPatternPath } from '../utils/assets';
import { getShelfAccentColor, hexToRgba } from '../utils/colorUtils';

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
  onMoveStrainUp?: (shelfId: string, strainIndex: number) => void;
  onMoveStrainDown?: (shelfId: string, strainIndex: number) => void;
  onReorderStrain?: (shelfId: string, fromIndex: number, toIndex: number) => void;
  availableShelves?: Shelf[]; // For 50% OFF shelf original shelf selection
  currentState?: SupportedStates; // Current app state for shelf hierarchy
  isControlsDisabled?: boolean;
  onTogglePricingVisibility?: (showPricing: boolean) => void;
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
  onMoveStrainUp,
  onMoveStrainDown,
  onReorderStrain,
  availableShelves = [],
  currentState,
  onTogglePricingVisibility,
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
  
  const isFiftyPercentOff = shelf.name === "50% OFF STRAINS";
  
  // CSS for infused shelf pattern
  const infusedShelfCSS = `
    .infused-shelf-container > div:first-child::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("${getPatternPath('sick-ass-pattern.svg')}");
      background-size: 300px 300px;
      background-repeat: repeat;
      background-position: 0 0;
      filter: hue-rotate(30deg) saturate(0.4) brightness(1.8) opacity(0.08);
      pointer-events: none;
      z-index: 0;
    }
    .infused-shelf-container > div:first-child {
      position: relative;
    }
    .infused-shelf-container > div:first-child > * {
      position: relative;
      z-index: 1;
    }
  `;
  
  const sortOptions: Array<{ label: string; key: SortCriteria['key'] }> = [
    { label: "Name", key: "name" },
    { label: "Grower", key: "grower" },
    { label: "Class", key: "type" },
    { label: "THC%", key: "thc" },
    { label: "Last Jar", key: "isLastJar" },
    { label: "Sold Out", key: "isSoldOut" },
    ...(isFiftyPercentOff ? [{ label: "Original Shelf", key: "originalShelf" as SortCriteria['key'] }] : []),
  ];

  const weightTiers = shelf.medicalPricing ? [
    { label: '1g', rec: shelf.pricing?.g, med: shelf.medicalPricing.g },
    { label: '3.5g', rec: shelf.pricing?.eighth, med: shelf.medicalPricing.eighth },
    { label: '7g', rec: shelf.pricing?.quarter, med: shelf.medicalPricing.quarter },
    { label: '14g', rec: shelf.pricing?.half, med: shelf.medicalPricing.half },
    { label: '28g', rec: shelf.pricing?.oz, med: shelf.medicalPricing.oz },
  ].filter(tier => typeof tier.rec === 'number' && typeof tier.med === 'number') : [];

  const pricingGridStyle: React.CSSProperties | undefined = weightTiers.length > 0 ? {
    display: 'grid',
    gridTemplateColumns: `auto repeat(${weightTiers.length}, auto)`,
    columnGap: '6px',
    rowGap: '2px',
    textAlign: 'right',
  } : undefined;

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

  const handlePricingToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTogglePricingVisibility?.(event.target.checked);
  };

  const toggleAccentColor = getShelfAccentColor(shelf.color);
  const toggleBackground = toggleAccentColor ? hexToRgba(toggleAccentColor, 0.18) : 'rgba(255,255,255,0.12)';
  const toggleBorder = toggleAccentColor ? hexToRgba(toggleAccentColor, 0.35) : 'rgba(255,255,255,0.2)';

  return (
    <>
      {shelf.isInfused && (
        <style dangerouslySetInnerHTML={{ __html: infusedShelfCSS }} />
      )}
      <div 
        data-shelf-id={shelf.id}
        className={`rounded-lg shadow-md overflow-hidden border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
        } ${shelf.color} ${shelf.isInfused ? 'infused-shelf-container' : ''}`}>
      <div className={`p-3 ${shelf.textColor} flex flex-col`}>
        <div className="flex flex-wrap justify-between items-start gap-3 mb-1.5">
            <div className="flex-1 min-w-[160px] flex items-center">
                <h3 className="text-xl font-semibold">{shelf.name}</h3>
                {!shelf.hidePricing && (
                  shelf.medicalPricing && pricingGridStyle ? (
                    <div className="text-xs opacity-90 mt-1 flex flex-col items-end gap-1">
                      <div className="grid text-right" style={pricingGridStyle}>
                        <span className="px-1 text-right font-semibold" />
                        {weightTiers.map(tier => (
                          <span key={`editor-weight-${tier.label}`} className="px-1 text-center font-semibold">
                            {tier.label}
                          </span>
                        ))}
                        <span className="px-1 py-0.5 text-right font-semibold uppercase">Med</span>
                        {weightTiers.map(tier => (
                          <span key={`editor-med-${tier.label}`} className="px-1 py-0.5 text-right">
                            {formatPrice(tier.med ?? 0)}
                          </span>
                        ))}
                        <span className="px-1 py-0.5 text-right font-semibold uppercase">Rec</span>
                        {weightTiers.map(tier => (
                          <span key={`editor-rec-${tier.label}`} className="px-1 py-0.5 text-right">
                            {formatPrice(tier.rec ?? 0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs opacity-90 text-right mt-1">
                      {shelf.isInfused && shelf.pricing?.fiveG ? 
                        `${formatPrice(shelf.pricing?.g || 0)}/g | ${formatPrice(shelf.pricing?.fiveG || 0)}/5g` :
                        `${formatPrice(shelf.pricing?.g || 0)}/g | ${formatPrice(shelf.pricing?.eighth || 0)}/8th | ${formatPrice(shelf.pricing?.quarter || 0)}/Qtr | ${formatPrice(shelf.pricing?.half || 0)}/Half | ${formatPrice(shelf.pricing?.oz || 0)}/Oz`
                      }
                    </p>
                  )
                )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button 
                  onClick={handleClearStrainsClick} 
                  variant="custom" 
                  size="sm" 
                  className={`bg-white/10 hover:bg-white/20 text-current !py-1 !px-2 flex items-center space-x-1 min-w-[80px] justify-center ${confirmClear ? 'bg-red-500/30 hover:bg-red-400/30' : ''}`}
              >
                <TrashXmarkIcon className="w-4 h-4" theme="dark" />
                <span className="text-xs">{confirmClear ? "Sure?" : "Clear"}</span>
              </Button>
              <label
                className="flex items-center gap-2 text-xs opacity-90 flex-wrap rounded px-2 py-1 border"
                style={{
                  backgroundColor: toggleBackground,
                  borderColor: toggleBorder,
                }}
              >
                <input
                  type="checkbox"
                  checked={!shelf.hidePricing}
                  onChange={handlePricingToggleChange}
                  className="w-4 h-4 rounded border-white/40 bg-transparent"
                  style={{ accentColor: '#ffffff' }}
                />
                <span className="whitespace-pre">
                  {'Show pricing\nin preview'}
                </span>
              </label>
            </div>
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
            isVisible={false}
          >
            <div className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {'No strains on this shelf yet'}
            </div>
          </DropZone>
        ) : (
          <>
            {/* Drop zone at the beginning */}
            <DropZone
              onDrop={(dragData) => handleDropBetweenStrains(dragData, 0)}
              theme={theme}
              className="h-2 rounded"
              isVisible={false}
            />
            
            {shelf.strains.map((strain, index) => (
              <div key={strain.id}>
                <StrainInputRow
                  strain={strain}
                  onUpdate={(updatedStrain) => onUpdateStrain(strain.id, updatedStrain)}
                  onRemove={() => onRemoveStrain(strain.id)} 
                  onCopy={(direction) => onCopyStrain(strain.id, direction)}
                  onMoveUp={onMoveStrainUp ? () => onMoveStrainUp(shelf.id, index) : undefined}
                  onMoveDown={onMoveStrainDown ? () => onMoveStrainDown(shelf.id, index) : undefined}
                  isFirst={index === 0} 
                  isLast={index === shelf.strains.length - 1} 
                  isNewlyAdded={newlyAddedStrainId === strain.id}
                  theme={theme}
                  shelfId={shelf.id}
                  strainIndex={index}
                  isFiftyPercentOff={isFiftyPercentOff}
                  availableShelves={availableShelves}
                  currentState={currentState}
                  isInfused={shelf.isInfused}
                />
                
                {/* Drop zone between strains */}
                <DropZone
                  onDrop={(dragData) => handleDropBetweenStrains(dragData, index + 1)}
                  theme={theme}
                  className="h-2 rounded"
                  isVisible={false}
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
    </>
  );
};
