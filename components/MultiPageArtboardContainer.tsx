import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import { AnyShelf, PreviewSettings, SupportedStates, Theme, isPrePackagedShelf } from '../types';
import { PreviewArtboard } from './PreviewArtboard';
import { PrePackagedArtboard } from './PrePackagedArtboard';
import { ContentDistributor } from '../utils/ContentDistributor';

interface MultiPageArtboardContainerProps {
  shelves: AnyShelf[];
  settings: PreviewSettings;
  currentState: SupportedStates;
  theme: Theme;
  onOverflowDetected?: (hasOverflow: boolean) => void;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  onAddPage: () => void;
  onRemovePage: (pageNumber: number) => void;
  onGoToPage: (pageNumber: number) => void;
  onToggleAutoPageBreaks: () => void;
}

export const MultiPageArtboardContainer = forwardRef<HTMLDivElement, MultiPageArtboardContainerProps>(
  ({ 
    shelves, 
    settings, 
    currentState, 
    theme,
    onOverflowDetected, 
    onSettingsChange,
    onAddPage,
    onRemovePage,
    onGoToPage,
    onToggleAutoPageBreaks
  }, ref) => {
    const [contentDistributor] = useState(() => new ContentDistributor(settings));
    
    // Update content distributor when settings change
    useEffect(() => {
      contentDistributor.updateSettings(settings);
    }, [settings, contentDistributor]);

    // Calculate content distribution
    const contentDistribution = useMemo(() => {
      return contentDistributor.distributeContent(shelves);
    }, [shelves, contentDistributor, settings]);

    // Auto page breaks are now handled directly by the artboard components
    // This provides more accurate measurement-based page count updates

    // Get shelves for current page - for CSS column approach, all shelves are rendered
    // and CSS transforms handle the visual pagination
    const currentPageShelves = useMemo(() => {
      return contentDistributor.getAllShelvesForPage(shelves);
    }, [shelves, contentDistributor]);

    // Detect overflow and report it - now handled by individual artboard components
    // The artboard components will call onOverflowDetected directly with their measurements

    // Determine if we should render in Pre-Packaged mode
    const isPrePackagedMode = useMemo(() => {
      return currentPageShelves.length > 0 && isPrePackagedShelf(currentPageShelves[0]);
    }, [currentPageShelves]);

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    };

    const pageWrapperStyle: React.CSSProperties = {
      position: 'relative',
      transition: 'all 0.3s ease-in-out',
    };

    return (
      <div style={containerStyle}>
        {/* DEPRECATED: Multi-page navigation info - hidden for now but preserved for future development
            This UI was designed to show page count and auto-breaks status for multi-page functionality */}
        {false && settings.pageCount > 1 && (
          <div className={`
            mb-4 px-4 py-2 rounded-lg text-sm
            ${theme === 'dark' 
              ? 'bg-gray-800 text-gray-300 border border-gray-700' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
            }
          `}>
            <div className="flex items-center justify-center space-x-4">
              <span>
                Page {settings.currentPage} of {settings.pageCount}
              </span>
              {settings.autoPageBreaks && (
                <span className={`
                  px-2 py-1 rounded text-xs
                  ${theme === 'dark' 
                    ? 'bg-blue-900/50 text-blue-300' 
                    : 'bg-blue-100 text-blue-600'
                  }
                `}>
                  Auto
                </span>
              )}
              <span className="text-xs opacity-75">
                {currentPageShelves.length} shelves on this page
              </span>
            </div>
          </div>
        )}

        {/* Current Page Artboard */}
        <div style={pageWrapperStyle} ref={ref}>
          {isPrePackagedMode ? (
            <PrePackagedArtboard
              shelves={currentPageShelves}
              settings={settings}
              currentState={currentState}
              onOverflowDetected={onOverflowDetected}
            />
          ) : (
            <PreviewArtboard
              shelves={currentPageShelves}
              settings={settings}
              currentState={currentState}
              onOverflowDetected={onOverflowDetected}
            />
          )}
        </div>


        {/* DEPRECATED: Page Preview Thumbnails - hidden for now but preserved for future development
            These thumbnails allowed quick navigation between pages in multi-page mode */}
        {false && settings.pageCount > 1 && (
          <div className={`
            absolute bottom-4 left-4 right-16 flex items-center justify-center space-x-2
            pointer-events-none
          `}>
            {Array.from({ length: settings.pageCount }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onGoToPage(pageNumber)}
                  className={`
                    w-3 h-4 rounded-sm border transition-all duration-200 pointer-events-auto
                    ${pageNumber === settings.currentPage 
                      ? theme === 'dark' 
                        ? 'bg-blue-500 border-blue-400' 
                        : 'bg-blue-600 border-blue-500'
                      : theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                    }
                  `}
                  title={`Page ${pageNumber} - ${currentPageShelves.length} shelves`}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {currentPageShelves.length === 0 && (
          <div className={`
            absolute inset-0 flex items-center justify-center
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <div className="text-center">
              <p className="text-lg mb-2">Page {settings.currentPage} is empty</p>
              <p className="text-sm opacity-75">
                Add content to shelves or navigate to a page with content
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiPageArtboardContainer.displayName = 'MultiPageArtboardContainer';