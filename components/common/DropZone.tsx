import React, { useState } from 'react';
import { Theme } from '../../types';

interface DropZoneProps {
  onDrop: (dragData: any) => void;
  theme: Theme;
  className?: string;
  children?: React.ReactNode;
  isVisible?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  onDrop, 
  theme, 
  className = '', 
  children,
  isVisible = true 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const dragDataString = e.dataTransfer.getData('text/plain');
      const dragData = JSON.parse(dragDataString);
      onDrop(dragData);
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
  };

  if (!isVisible) return <>{children}</>;

  return (
    <div
      className={`${className} ${
        isDragOver 
          ? `border-2 border-dashed border-orange-400 bg-orange-50 ${
              theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
            }` 
          : 'border-2 border-dashed border-transparent'
      } transition-all duration-150 ease-in-out`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div className={`text-center py-2 text-sm font-medium ${
          theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
        }`}>
          Drop strain here
        </div>
      )}
    </div>
  );
}; 