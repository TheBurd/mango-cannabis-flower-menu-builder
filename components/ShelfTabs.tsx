import React, { useState } from 'react';
import { Shelf, Theme } from '../types';

interface ShelfTabsProps {
  shelves: Shelf[];
  onScrollToShelf: (shelfId: string) => void;
  theme: Theme;
  isDragging?: boolean;
}

export const ShelfTabs: React.FC<ShelfTabsProps> = ({ shelves, onScrollToShelf, theme, isDragging = false }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [dragHoverTimeout, setDragHoverTimeout] = useState<number | null>(null);

  if (shelves.length === 0) return null;

  const truncateShelfName = (name: string, strainCount: number) => {
    const countText = ` (${strainCount})`;
    // Much more generous character budget - only truncate if really long
    const maxTotalLength = 15;
    
    if (name.length + countText.length <= maxTotalLength) {
      return name + countText;
    }
    
    // Only truncate if the name is really long
    const maxNameLength = maxTotalLength - countText.length - 2; // -2 for ".."
    return name.substring(0, Math.max(3, maxNameLength)) + '..' + countText;
  };

  const containerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  const handleDragHover = (shelfId: string) => {
    if (!isDragging) return;
    
    // Clear any existing timeout
    if (dragHoverTimeout) {
      clearTimeout(dragHoverTimeout);
    }
    
    // Set a new timeout to scroll after 800ms of hovering
    const timeout = window.setTimeout(() => {
      onScrollToShelf(shelfId);
    }, 800);
    
    setDragHoverTimeout(timeout);
  };

  const handleDragLeave = () => {
    if (dragHoverTimeout) {
      clearTimeout(dragHoverTimeout);
      setDragHoverTimeout(null);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (dragHoverTimeout) {
        clearTimeout(dragHoverTimeout);
      }
    };
  }, [dragHoverTimeout]);

  return (
    <div className={`sticky top-0 z-30 ${containerBg} relative px-2 pb-2`}>
      <div className="flex items-end w-full">
        {shelves.map((shelf, index) => {
          const isHovered = hoveredTab === shelf.id;
          const strainCount = shelf.strains?.length || 0;
          const displayName = isHovered ? 
            `${shelf.name} (${strainCount})` : 
            truncateShelfName(shelf.name, strainCount);
          
          return (
            <div
              key={shelf.id}
              onClick={() => onScrollToShelf(shelf.id)}
              onMouseEnter={() => {
                setHoveredTab(shelf.id);
                handleDragHover(shelf.id);
              }}
              onMouseLeave={() => {
                setHoveredTab(null);
                handleDragLeave();
              }}
              className={`
                relative cursor-pointer px-1.5 pr-3 py-1 flex-1 h-7 rounded-b-md
                ${shelf.color.startsWith('bg-') ? shelf.color : ''}
                ${shelf.textColor.startsWith('text-') ? shelf.textColor : ''}
                ${isHovered ? 'transform scale-105 z-20 shadow-lg' : 'z-10 shadow-md'}
              `}
              style={{
                backgroundColor: shelf.color.startsWith('bg-[') ? shelf.color.slice(3, -1) : (shelf.color.startsWith('bg-') ? undefined : shelf.color),
                color: shelf.textColor.startsWith('text-[') ? shelf.textColor.slice(5, -1) : (shelf.textColor.startsWith('text-') ? undefined : shelf.textColor),
                clipPath: 'polygon(0 0, 0 100%, calc(100% - 12px) 100%, 100% 0)',
                minWidth: isHovered ? 'auto' : '40px',
                maxWidth: isHovered ? 'none' : 'none',
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: isHovered ? 20 : 10 - index,
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              title={shelf.name}
            >
              <span className={`
                text-xs font-medium truncate block leading-5
                ${shelf.textColor}
                ${isHovered ? 'transform scale-105' : ''}
              `}
              style={{
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {displayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
