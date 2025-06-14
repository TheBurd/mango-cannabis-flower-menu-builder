import React, { forwardRef, useMemo, useEffect, useRef } from 'react';
import { Shelf, PreviewSettings, ArtboardSize, HeaderImageSize, SupportedStates } from '../types';
import { ARTBOARD_DIMENSIONS_MAP, HEADER_IMAGE_CONFIGS, STATE_THC_ICONS } from '../constants';
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
  const { artboardSize, baseFontSizePx, columns, forceShelfFit, headerImageSize, linePaddingMultiplier, showThcIcon } = settings;
  const artboardSpecs = ARTBOARD_DIMENSIONS_MAP[artboardSize];

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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentPadding = useMemo(() => getScaledValue(baseFontSizePx, 2, 10), [baseFontSizePx]);
  const columnGap = useMemo(() => getScaledValue(baseFontSizePx, 1.5, 8), [baseFontSizePx]);
  const rowGap = useMemo(() => getScaledValue(baseFontSizePx, 1.5, 8), [baseFontSizePx]);
  const rowGapPx = `${rowGap}px`;

  const contentAreaStyle: React.CSSProperties = {
    padding: `${contentPadding}px`,
    width: '100%',
    height: `calc(100% - ${headerImageDetails.height}px)`, // Adjust height for header
    boxSizing: 'border-box',
    columnCount: columns,
    columnGap: `${columnGap}px`,
    columnFill: 'auto', // Fill columns sequentially instead of balancing heights
    overflow: 'hidden', // Prevent content from overflowing its designated area
  };

  const shelvesWithStrains = useMemo(() => shelves.filter(shelf => shelf.strains.length > 0), [shelves]);

  const renderableShelves = useMemo(() => {
    return shelvesWithStrains.map(shelf => {
      // When forceShelfFit is true, prevent tables from breaking across columns (keep shelves together)
      // When forceShelfFit is false, allow shelves to split across columns (shelf splitting enabled)
      const applyAvoidBreak = forceShelfFit;
      
      // Calculate if shelf might overflow for subtle warning overlay
      let showOverflowWarning = false;
      if (applyAvoidBreak && shelf.strains.length > 0) {
        // Only show warning when shelf splitting is disabled AND shelf is genuinely too long
        // More accurate calculation of shelf height
        const estimatedRowHeight = baseFontSizePx * 1.8 * (1 + linePaddingMultiplier * 0.8);
        const estimatedHeaderHeight = baseFontSizePx * 2.5; // Shelf name + pricing
        const estimatedTableHeaderHeight = baseFontSizePx * 1.6; // Column headers
        const estimatedShelfHeight = estimatedHeaderHeight + estimatedTableHeaderHeight + (shelf.strains.length * estimatedRowHeight);
        
        // More accurate calculation of available column height
        const totalContentHeight = artboardSpecs.naturalHeight - headerImageDetails.height - (contentPadding * 2);
        const availableColumnHeight = totalContentHeight;
        
        // Only show warning if shelf is significantly too tall for a single column
        // Use a higher threshold (90%) and require a minimum number of strains to avoid false positives
        const isSignificantlyTooTall = estimatedShelfHeight > availableColumnHeight * 0.9;
        const hasEnoughStrains = shelf.strains.length >= 8; // Only warn for shelves with many strains
        
        showOverflowWarning = isSignificantlyTooTall && hasEnoughStrains;
      }
      
      return (
        <MenuTable
          key={shelf.id}
          shelf={shelf}
          strainsToRender={shelf.strains}
          baseFontSizePx={baseFontSizePx}
          linePaddingMultiplier={linePaddingMultiplier}
          marginBottomStyle={rowGapPx}
          applyAvoidBreakStyle={applyAvoidBreak}
          showOverflowWarning={showOverflowWarning}
        />
      );
    });
  }, [shelvesWithStrains, forceShelfFit, baseFontSizePx, linePaddingMultiplier, rowGapPx, artboardSpecs.naturalHeight, headerImageDetails.height, contentPadding, columns]);

  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const overflowElement = overflowRef.current;
      if (overflowElement && onOverflowDetected) {
        // Check if content is overflowing the container
        const hasVerticalOverflow = overflowElement.scrollHeight > overflowElement.clientHeight;
        const hasHorizontalOverflow = overflowElement.scrollWidth > overflowElement.clientWidth;
        const hasOverflow = hasVerticalOverflow || hasHorizontalOverflow;
        
        onOverflowDetected(hasOverflow);
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
            height: `calc(100% - ${headerImageDetails.height}px)`, // Also adjust placeholder height
            color: '#aaa', 
            fontSize: getScaledValue(baseFontSizePx, 2.5)
        }}>
          Add strains to shelves to see your menu.
        </div>
      )}
      
      {showThcIcon && (
        <img 
          src={STATE_THC_ICONS[currentState]}
          alt={`${currentState} THC Regulatory Icon`}
          draggable={false}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            width: '80px',
            height: 'auto',
            opacity: 1,
            zIndex: 10,
            userSelect: 'none', // Prevents selection
            pointerEvents: 'none', // Allows clicks to pass through to the artboard
          }}
        />
      )}
    </div>
  );
});

PreviewArtboard.displayName = 'PreviewArtboard';