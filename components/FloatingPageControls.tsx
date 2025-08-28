import React, { useState } from 'react';
import { Theme } from '../types';
import { Icon } from './common/Icon';

interface FloatingPageControlsProps {
  currentPage: number;
  totalPages: number;
  onAddPage: () => void;
  onRemovePage: (pageNumber: number) => void;
  onGoToPage: (pageNumber: number) => void;
  onToggleAutoPageBreaks: () => void;
  autoPageBreaks: boolean;
  theme: Theme;
  className?: string;
}

export const FloatingPageControls: React.FC<FloatingPageControlsProps> = ({
  currentPage,
  totalPages,
  onAddPage,
  onRemovePage,
  onGoToPage,
  onToggleAutoPageBreaks,
  autoPageBreaks,
  theme,
  className = ''
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      onRemovePage(currentPage);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className={`absolute bottom-4 right-4 flex items-center space-x-3 z-40 ${className}`}>
      {/* Auto Toggle */}
      <button
        onClick={onToggleAutoPageBreaks}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm
          ${theme === 'dark' 
            ? 'bg-gray-800/90 border border-gray-700 text-gray-300 hover:bg-gray-700/90' 
            : 'bg-white/90 border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
        title={`${autoPageBreaks ? 'Disable' : 'Enable'} automatic page breaks`}
      >
        <div className={`
          w-2 h-2 rounded-full transition-colors
          ${autoPageBreaks 
            ? 'bg-blue-500' 
            : theme === 'dark' 
              ? 'bg-gray-500' 
              : 'bg-gray-400'
          }
        `} />
        <span>Auto</span>
      </button>

      {/* Page Navigation */}
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg
        ${theme === 'dark' 
          ? 'bg-gray-800/90 border border-gray-700 text-gray-300' 
          : 'bg-white/90 border border-gray-300 text-gray-700'
        }
      `}>
        {/* Previous Page */}
        <button
          onClick={() => onGoToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={`
            p-1 rounded transition-colors
            ${currentPage <= 1 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          title="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Indicator */}
        <span className="px-2 text-sm font-medium whitespace-nowrap">
          {currentPage}/{totalPages}
        </span>

        {/* Next Page */}
        <button
          onClick={() => onGoToPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`
            p-1 rounded transition-colors
            ${currentPage >= totalPages 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          title="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Delete Current Page */}
        {totalPages > 1 && (
          <button
            onClick={handleDeleteConfirm}
            className={`
              p-1 rounded transition-colors ml-2 border-l pl-2
              ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}
              ${confirmDelete 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : 'hover:bg-red-100 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400'
              }
            `}
            title={confirmDelete ? "Click again to confirm deletion" : "Delete current page"}
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add Page Button */}
      <button
        onClick={onAddPage}
        className={`
          w-10 h-10 rounded-full transition-all duration-200
          ${theme === 'dark' 
            ? 'bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700 text-gray-300 hover:text-white' 
            : 'bg-white/90 hover:bg-white border border-gray-300 text-gray-600 hover:text-gray-800'
          }
          hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        title="Add new page"
      >
        <Icon name="plus" className="w-5 h-5" />
      </button>
    </div>
  );
};