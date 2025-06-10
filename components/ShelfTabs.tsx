import React, { useState } from 'react';
import { Shelf, Theme } from '../types';

interface ShelfTabsProps {
  shelves: Shelf[];
  onScrollToShelf: (shelfId: string) => void;
  theme: Theme;
}

export const ShelfTabs: React.FC<ShelfTabsProps> = ({ shelves, onScrollToShelf, theme }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

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

  return (
    <div className={`sticky top-0 z-30 ${containerBg} relative px-2 pb-2`}>
      <div className="flex items-end w-full">
        {shelves.map((shelf, index) => {
          const isHovered = hoveredTab === shelf.id;
          const displayName = isHovered ? 
            `${shelf.name} (${shelf.strains.length})` : 
            truncateShelfName(shelf.name, shelf.strains.length);
          
          return (
            <div
              key={shelf.id}
              onClick={() => onScrollToShelf(shelf.id)}
              onMouseEnter={() => setHoveredTab(shelf.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`
                relative cursor-pointer px-1.5 pr-3 py-1 flex-1 h-7 rounded-b-md
                ${shelf.color} ${shelf.textColor}
                ${isHovered ? 'transform scale-105 z-20 shadow-lg' : 'z-10 shadow-md'}
              `}
              style={{
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