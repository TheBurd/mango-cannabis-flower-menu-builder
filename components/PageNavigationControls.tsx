import React from 'react';
import { Theme } from '../types';
import { PageExportData } from '../utils/PageManager';

interface PageNavigationControlsProps {
  currentPage: number;
  totalPages: number;
  pageData: PageExportData[];
  theme: Theme;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageNumber: number) => void;
  onAddPage: () => void;
  onRemovePage: (pageNumber: number) => void;
  className?: string;
}

export const PageNavigationControls: React.FC<PageNavigationControlsProps> = ({
  currentPage,
  totalPages,
  pageData,
  theme,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onAddPage,
  onRemovePage,
  className = ''
}) => {
  if (totalPages <= 1) {
    // Show add page button even if only one page
    return (
      <div className={`flex items-center justify-end space-x-2 ${className}`}>
        <button
          onClick={onAddPage}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
          }`}
          title="Add new page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between space-x-4 ${className}`}>
      {/* Page Info */}
      <div className={`text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Page {currentPage} of {totalPages}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center space-x-2">
        {/* Previous Page Button */}
        <button
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:bg-gray-800'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 disabled:bg-gray-100'
          }`}
          title="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Indicators */}
        <div className="flex items-center space-x-1">
          {pageData.map((page) => {
            const isCurrentPage = page.pageNumber === currentPage;
            const isEmpty = page.isEmpty;
            
            return (
              <button
                key={page.pageNumber}
                onClick={() => onGoToPage(page.pageNumber)}
                className={`relative w-8 h-6 rounded text-xs font-medium transition-all duration-200 ${
                  isCurrentPage
                    ? theme === 'dark'
                      ? 'bg-orange-600 text-white border-2 border-orange-500'
                      : 'bg-orange-500 text-white border-2 border-orange-400'
                    : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-2 border-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 border-2 border-gray-300'
                }`}
                title={`Page ${page.pageNumber}${isEmpty ? ' (empty)' : ` - ${page.shelves.length} shelves`}`}
              >
                {page.pageNumber}
                {isEmpty && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:bg-gray-800'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 disabled:bg-gray-100'
          }`}
          title="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page Management */}
      <div className="flex items-center space-x-1">
        {/* Add Page Button */}
        <button
          onClick={onAddPage}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-green-700 hover:bg-green-600 text-green-100 hover:text-white'
              : 'bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800'
          }`}
          title="Add new page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Delete Current Page Button (only if more than 1 page and not page 1) */}
        {totalPages > 1 && currentPage > 1 && (
          <button
            onClick={() => onRemovePage(currentPage)}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'bg-red-700 hover:bg-red-600 text-red-100 hover:text-white'
                : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800'
            }`}
            title={`Delete page ${currentPage}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Compact version for smaller spaces
 */
export const CompactPageNavigationControls: React.FC<
  Omit<PageNavigationControlsProps, 'pageData'> & { isEmpty?: boolean }
> = ({
  currentPage,
  totalPages,
  isEmpty = false,
  theme,
  onPreviousPage,
  onNextPage,
  onAddPage,
  onRemovePage,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={onPreviousPage}
        disabled={currentPage <= 1}
        className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
          theme === 'dark'
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
        }`}
        title="Previous page"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Info */}
      <div className={`text-xs px-2 py-1 rounded ${
        theme === 'dark' 
          ? 'bg-gray-800 text-gray-300' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {currentPage}/{totalPages}
        {isEmpty && <span className="text-yellow-500 ml-1">●</span>}
      </div>

      {/* Next Button */}
      <button
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
        className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
          theme === 'dark'
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
        }`}
        title="Next page"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Add Page Button */}
      <button
        onClick={onAddPage}
        className={`p-1.5 rounded transition-colors ${
          theme === 'dark'
            ? 'hover:bg-green-700 text-green-400 hover:text-white'
            : 'hover:bg-green-100 text-green-600 hover:text-green-700'
        }`}
        title="Add page"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Delete Page Button (only if more than 1 page and not page 1) */}
      {totalPages > 1 && currentPage > 1 && (
        <button
          onClick={() => onRemovePage(currentPage)}
          className={`p-1.5 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-red-700 text-red-400 hover:text-white'
              : 'hover:bg-red-100 text-red-600 hover:text-red-700'
          }`}
          title={`Delete page ${currentPage}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};