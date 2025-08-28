import React, { forwardRef, useMemo, useEffect, useRef } from 'react';
import { Shelf, PreviewSettings, ArtboardSize, HeaderImageSize, SupportedStates } from '../types';
import { ARTBOARD_DIMENSIONS_MAP, HEADER_IMAGE_CONFIGS, STATE_THC_ICONS } from '../constants';
import { ContentDistributor } from '../utils/ContentDistributor';
import { MenuTable } from './MenuTable';

interface PreviewArtboardProps {
  shelves: Shelf[];
  settings: PreviewSettings;
  currentState: SupportedStates;
  onOverflowDetected?: (hasOverflow: boolean) => void;
}

const getScaledValue = (base: number, multiplier: number, min: number = 0) => Math.max(min, base * multiplier); 

const getHeaderImageDetails = (artboardSize: ArtboardSize, headerSize: HeaderImageSize): { src?: string; height: number; } => {
  if (headerSize === HeaderImageSize.NONE) {
    return { height: 0 };
  }
  const configSet = HEADER_IMAGE_CONFIGS[artboardSize];
  if (!configSet) return { height: 0 };

  const config = configSet[headerSize as Exclude<HeaderImageSize, HeaderImageSize.NONE>];
  if (config) {
    return { src: config.src, height: config.naturalHeight };
  }
  return { height: 0 }; // Fallback if a specific size (Large/Small) is missing for an artboard
};


export const PreviewArtboard = forwardRef<HTMLDivElement, PreviewArtboardProps>((
  { shelves, settings, currentState, onOverflowDetected }, ref
) => {
  const { artboardSize, baseFontSizePx, columns, forceShelfFit, headerImageSize, linePaddingMultiplier, showThcIcon, showSoldOutProducts, showMenuDate, menuDateText, menuDatePosition } = settings;
  const artboardSpecs = ARTBOARD_DIMENSIONS_MAP[artboardSize];

  // Create content distributor for multi-page transforms
  const contentDistributor = useMemo(() => new ContentDistributor(settings), [settings]);

  const headerImageDetails = useMemo(() => 
    getHeaderImageDetails(artboardSize, headerImageSize), 
    [artboardSize, headerImageSize]
  );

  const artboardStyle: React.CSSProperties = {
    position: 'relative',
    width: `${artboardSpecs.naturalWidth}px`,
    height: `${artboardSpecs.naturalHeight}px`,
    backgroundColor: 'white',
    boxShadow: '0 0 15px rgba(0,0,0,0.3)',
    overflow: 'hidden', // Clip content at artboard boundaries
    display: 'flex',
    flexDirection: 'column',
  };

  // Fixed padding and gap to prevent content width from shrinking as font size increases  
  const contentPadding = useMemo(() => Math.max(30, baseFontSizePx * 1.4), [baseFontSizePx]); // Increased base padding
  const columnGap = useMemo(() => Math.max(12, baseFontSizePx * 0.8), [baseFontSizePx]); // Reduced scaling
  const rowGap = useMemo(() => getScaledValue(baseFontSizePx, 1.5, 8), [baseFontSizePx]);
  const rowGapPx = `${rowGap}px`;

  // Get column transform for current page
  const pageTransform = useMemo(() => {
    return contentDistributor.getColumnTransformForPage(settings.currentPage);
  }, [contentDistributor, settings.currentPage]);

  // REVERTED: Back to single-page layout (multi-page temporarily disabled)
  const totalContentWidth = useMemo(() => {
    const artboardWidth = artboardSpecs.naturalWidth;
    // Calculate correct width based on artboard size
    // For 8.5x11 Portrait (2550px artboard): should be 2550px content width
    // Use proportional padding that maintains correct ratios for all sizes
    const paddingRatio = 0; // No padding reduction from artboard width for now
    const availableWidth = artboardWidth - (artboardWidth * paddingRatio);
    // Simple single artboard width for standard layout
    return availableWidth;
  }, [artboardSpecs.naturalWidth]);

  // Standard column count (no page multiplication)
  const effectiveColumnCount = columns;
  
  // Footer height calculation - only when showing footer content
  const footerHeight = (showThcIcon || (showMenuDate && menuDateText)) ? 100 : 0;

  // Calculate exact column width to ensure perfect alignment
  const exactColumnWidth = useMemo(() => {
    const availableWidth = artboardSpecs.naturalWidth - (contentPadding * 2);
    const totalGapWidth = (columns - 1) * columnGap;
    return (availableWidth - totalGapWidth) / columns;
  }, [artboardSpecs.naturalWidth, contentPadding, columnGap, columns]);

  const contentAreaStyle: React.CSSProperties = {
    padding: `${contentPadding}px`,
    width: `${totalContentWidth}px`, // Single artboard width
    height: `calc(100% - ${headerImageDetails.height}px - ${footerHeight}px)`, // Adjust height for header and footer
    boxSizing: 'border-box',
    columnCount: effectiveColumnCount, // User's selected column count
    columnGap: `${columnGap}px`,
    // Remove columnWidth to prevent CSS from overriding columnCount
    // columnWidth: `${exactColumnWidth}px`, // REMOVED: Conflicts with columnCount
    columnFill: 'auto', // Fill columns sequentially instead of balancing heights
    // REVERTED: Standard overflow behavior for single-page layout
    overflow: 'hidden', // Prevent content from overflowing artboard boundaries
    // transform: pageTransform.transform, // DISABLED: No multi-page transforms
    // transition: 'transform 0.3s ease-in-out', // DISABLED: No page transitions
    position: 'relative',
  };

  const shelvesWithStrains = useMemo(() => shelves.filter(shelf => shelf.strains.length > 0), [shelves]);

  const renderableShelves = useMemo(() => {
    return shelvesWithStrains.map(shelf => {
      // Filter strains based on sold out status
      const filteredStrains = showSoldOutProducts 
        ? shelf.strains 
        : shelf.strains.filter(strain => !strain.isSoldOut);
      
      // When forceShelfFit is true, prevent tables from breaking across columns (keep shelves together)
      // When forceShelfFit is false, allow shelves to split across columns (shelf splitting enabled)
      const applyAvoidBreak = forceShelfFit;
      
      // Calculate if shelf might overflow for subtle warning overlay
      let showOverflowWarning = false;
      if (applyAvoidBreak && filteredStrains.length > 0) {
        // Only show warning when shelf splitting is disabled AND shelf is genuinely too long
        // More accurate calculation of shelf height
        const estimatedRowHeight = baseFontSizePx * 1.8 * (1 + linePaddingMultiplier * 0.8);
        const estimatedHeaderHeight = baseFontSizePx * 2.5; // Shelf name + pricing
        const estimatedTableHeaderHeight = baseFontSizePx * 1.6; // Column headers
        const estimatedShelfHeight = estimatedHeaderHeight + estimatedTableHeaderHeight + (filteredStrains.length * estimatedRowHeight);
        
        // More accurate calculation of available column height
        const totalContentHeight = artboardSpecs.naturalHeight - headerImageDetails.height - (contentPadding * 2);
        const availableColumnHeight = totalContentHeight;
        
        // Only show warning if shelf is significantly too tall for a single column
        // Use a higher threshold (90%) and require a minimum number of strains to avoid false positives
        const isSignificantlyTooTall = estimatedShelfHeight > availableColumnHeight * 0.9;
        const hasEnoughStrains = filteredStrains.length >= 8; // Only warn for shelves with many strains
        
        showOverflowWarning = isSignificantlyTooTall && hasEnoughStrains;
      }
      
      return (
        <MenuTable
          key={shelf.id}
          shelf={shelf}
          strainsToRender={filteredStrains}
          baseFontSizePx={baseFontSizePx}
          linePaddingMultiplier={linePaddingMultiplier}
          marginBottomStyle={rowGapPx}
          applyAvoidBreakStyle={applyAvoidBreak}
          showOverflowWarning={showOverflowWarning}
          currentState={currentState}
        />
      );
    });
  }, [shelvesWithStrains, forceShelfFit, baseFontSizePx, linePaddingMultiplier, rowGapPx, artboardSpecs.naturalHeight, headerImageDetails.height, contentPadding, columns, showSoldOutProducts]);

  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const overflowElement = overflowRef.current;
      if (overflowElement && onOverflowDetected) {
        // REVERTED: Simple single-page overflow detection
        const hasVerticalOverflow = overflowElement.scrollHeight > overflowElement.clientHeight;
        const hasHorizontalOverflow = overflowElement.scrollWidth > overflowElement.clientWidth;
        const hasOverflow = hasVerticalOverflow || hasHorizontalOverflow;
        
        onOverflowDetected(hasOverflow);
        
        // DISABLED: Multi-page auto creation logic
        // if (settings.autoPageBreaks && hasOverflow) {
        //   // Multi-page functionality disabled
        // }
      }
    };

    // Check overflow immediately
    checkOverflow();

    // Set up a ResizeObserver to detect content changes
    const overflowElement = overflowRef.current;
    if (overflowElement) {
      const resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      
      resizeObserver.observe(overflowElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onOverflowDetected, renderableShelves, settings]);

  return (
    <div
      ref={ref}
      style={artboardStyle}
      className="print-artboard-outer"
      data-testid="preview-artboard"
    >
      {headerImageDetails.src && headerImageDetails.height > 0 && (
        <img 
          src={headerImageDetails.src} 
          alt="Menu Header" 
          draggable={false}
          style={{ 
            width: '100%', 
            height: `${headerImageDetails.height}px`, 
            objectFit: 'cover', // Ensures the image covers the area, might crop
            display: 'block', // Removes any extra space below the image
            userSelect: 'none', // Prevents selection
            pointerEvents: 'none', // Allows clicks to pass through to the artboard
          }} 
        />
      )}
      {renderableShelves.length > 0 ? (
        <div style={contentAreaStyle} className="menu-content-area" ref={overflowRef}>
          {renderableShelves}
        </div>
      ) : (
        <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: `calc(100% - ${headerImageDetails.height}px - ${footerHeight}px)`, // Also adjust placeholder height for footer
            color: '#aaa', 
            fontSize: getScaledValue(baseFontSizePx, 2.5)
        }}>
          Add strains to shelves to see your menu.
        </div>
      )}
      
      {/* Footer area - contains THC icon and optional menu date */}
      {(showThcIcon || (showMenuDate && menuDateText)) && (
        <div
          className="artboard-footer"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${footerHeight}px`,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: `${contentPadding}px`,
            paddingRight: `${contentPadding}px`,
            borderTop: showMenuDate ? '1px solid #e5e7eb' : 'none', // Subtle border when showing date
            zIndex: 10,
          }}
        >
          {/* Left side - Menu Date */}
          <div className="footer-left" style={{ flex: menuDatePosition === 'center' ? 1 : 'none' }}>
            {showMenuDate && menuDateText && (
              <span
                style={{
                  fontSize: getScaledValue(baseFontSizePx, 1.2, 10),
                  color: '#6b7280',
                  fontWeight: 500,
                  userSelect: 'none',
                  textAlign: menuDatePosition === 'center' ? 'center' : 'left',
                }}
              >
                {menuDateText}
              </span>
            )}
          </div>
          
          {/* Right side - THC Icon */}
          <div className="footer-right">
            {showThcIcon && (
              <img 
                src={STATE_THC_ICONS[currentState]}
                alt={`${currentState} THC Regulatory Icon`}
                draggable={false}
                style={{
                  width: '80px',
                  height: 'auto',
                  opacity: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PreviewArtboard.displayName = 'PreviewArtboard';