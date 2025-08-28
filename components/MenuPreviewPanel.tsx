import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import domtoimage from 'dom-to-image';
import { Shelf, PrePackagedShelf, PreviewSettings, SupportedStates, Theme, MenuMode, AnyShelf, isPrePackagedShelf } from '../types';
import { PreviewControlsTop } from './PreviewControlsTop';
import { PreviewControlsBottom } from './PreviewControlsBottom';
import { PreviewArtboard } from './PreviewArtboard';
import { PrePackagedArtboard } from './PrePackagedArtboard';
import { MultiPageArtboardContainer } from './MultiPageArtboardContainer';
import { FloatingPageControls } from './FloatingPageControls';
import { ARTBOARD_DIMENSIONS_MAP, INITIAL_PREVIEW_SETTINGS } from '../constants';
import { ExportAction } from '../App';
// import html2canvas from 'html2canvas'; // Removed - not needed for this implementation

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 10; 

interface MenuPreviewPanelProps {
  shelves: AnyShelf[];
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  exportAction: ExportAction | null;
  onExportComplete: () => void;
  currentState: SupportedStates;
  theme: Theme;
  onOverflowDetected?: (hasOverflow: boolean) => void;
  onAutoFormat?: () => void;
  hasContentOverflow?: boolean;
  isOptimizing?: boolean;
  isControlsDisabled?: boolean;
  // Multi-page management
  onAddPage: () => void;
  onRemovePage: (pageNumber: number) => void;
  onGoToPage: (pageNumber: number) => void;
  onToggleAutoPageBreaks: () => void;
}

export const MenuPreviewPanel: React.FC<MenuPreviewPanelProps> = ({
  shelves,
  settings,
  onSettingsChange,
  exportAction,
  onExportComplete,
  currentState,
  theme,
  onOverflowDetected,
  onAutoFormat,
  hasContentOverflow: hasOverflow,
  isOptimizing,
  isControlsDisabled,
  onAddPage,
  onRemovePage,
  onGoToPage,
  onToggleAutoPageBreaks,
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hasContentOverflow, setHasContentOverflow] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  const artboardNaturalDimensions = useMemo(() => {
    return ARTBOARD_DIMENSIONS_MAP[settings.artboardSize];
  }, [settings.artboardSize]);

  const centerView = useCallback((targetZoom: number) => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Center the artboard in the container
      setPanOffset({ x: 0, y: 0 });
      onSettingsChange({ zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom)) });
    }
  }, [onSettingsChange]);

  const fitToWindow = useCallback(() => {
    if (containerRef.current && artboardNaturalDimensions) {
      const containerWidth = containerRef.current.offsetWidth - 32; 
      const containerHeight = containerRef.current.offsetHeight - 32;

      const scaleX = containerWidth / artboardNaturalDimensions.naturalWidth;
      const scaleY = containerHeight / artboardNaturalDimensions.naturalHeight;
      const newZoom = Math.min(scaleX, scaleY);
      centerView(newZoom);
    }
  }, [centerView, artboardNaturalDimensions]);

  useEffect(() => {
    fitToWindow();
  }, [fitToWindow, artboardNaturalDimensions]);

  // Listen for fit-to-window trigger from menu commands
  useEffect(() => {
    if (settings.fitToWindowTrigger) {
      fitToWindow();
    }
  }, [settings.fitToWindowTrigger, fitToWindow]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };
  
  // Use useEffect to add wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomFactor = 0.1;
      const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
      const newZoom = Math.max(0.1, Math.min(3.0, settings.zoomLevel + delta));
      
      // Get mouse position relative to container
      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      // Get container center
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;
      
      // Calculate offset from center to mouse
      const offsetX = mouseX - containerCenterX;
      const offsetY = mouseY - containerCenterY;
      
      // Calculate zoom change
      const zoomChange = newZoom / settings.zoomLevel;
      
      // Adjust pan offset to zoom around mouse position
      const newPanX = panOffset.x - (offsetX * (zoomChange - 1));
      const newPanY = panOffset.y - (offsetY * (zoomChange - 1));
      
      setPanOffset({ x: newPanX, y: newPanY });
      onSettingsChange({ zoomLevel: newZoom });
    };

    // Add event listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [settings.zoomLevel, panOffset.x, panOffset.y, onSettingsChange]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(settings.zoomLevel * 1.2, 3.0);
    onSettingsChange({ zoomLevel: newZoom });
  }, [settings.zoomLevel, onSettingsChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(settings.zoomLevel / 1.2, 0.1);
    onSettingsChange({ zoomLevel: newZoom });
  }, [settings.zoomLevel, onSettingsChange]);

  const handleZoomChangeFromControls = (newZoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(3.0, newZoom));
    onSettingsChange({ zoomLevel: clampedZoom });
  };
  
  const resetZoomAndPan = () => {
    // Only reset zoom and pan, not all preview settings
    onSettingsChange({ zoomLevel: INITIAL_PREVIEW_SETTINGS.zoomLevel });
    setPanOffset({ x: 0, y: 0 });
  };

  const handleOverflowDetected = useCallback((hasOverflow: boolean) => {
    setHasContentOverflow(hasOverflow);
  }, []);

  useEffect(() => {
    if (exportAction && artboardRef.current) {
      const nodeToCapture = artboardRef.current;
      const { type: exportType, filename, artboardSize: exportArtboardSize } = exportAction;
      const exportDimensions = ARTBOARD_DIMENSIONS_MAP[exportArtboardSize];

      if (!exportDimensions) {
        console.error("Invalid artboard size for export:", exportArtboardSize);
        onExportComplete();
        return;
      }

      const originalParent = nodeToCapture.parentElement;
      const originalNextSibling = nodeToCapture.nextSibling;

      if (!originalParent) {
        console.error("Artboard element has no parent. Cannot proceed with export.");
        onExportComplete();
        return;
      }

      const captureWrapper = document.createElement('div');
      captureWrapper.style.position = 'absolute';
      captureWrapper.style.left = '-99999px'; // Position off-screen
      captureWrapper.style.top = '-99999px';
      captureWrapper.style.width = `${exportDimensions.naturalWidth}px`;
      captureWrapper.style.height = `${exportDimensions.naturalHeight}px`;
      captureWrapper.style.overflow = 'hidden';
      
      const originalStyles = {
        boxShadow: nodeToCapture.style.boxShadow,
        position: nodeToCapture.style.position,
        left: nodeToCapture.style.left,
        top: nodeToCapture.style.top,
        transform: nodeToCapture.style.transform,
        backgroundColor: nodeToCapture.style.backgroundColor,
      };

      nodeToCapture.style.boxShadow = 'none';
      nodeToCapture.style.position = 'static'; // Allow natural flow in sized wrapper
      nodeToCapture.style.left = 'auto';
      nodeToCapture.style.top = 'auto';
      nodeToCapture.style.transform = 'none'; // Remove on-screen scaling/panning transform

      document.body.appendChild(captureWrapper);
      captureWrapper.appendChild(nodeToCapture);
      
      // Add minimal CSS override for dom-to-image
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Ensure fonts render properly */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Ensure backgrounds are preserved */
        tbody tr[style*="#fff7ed"] {
          background-color: #fff7ed !important;
        }
        tbody tr[style*="#fff7ed"] td {
          background-color: #fff7ed !important;
        }
        /* Prevent unwanted text wrapping during export */
        table {
          table-layout: fixed !important;
        }
        td {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        /* Allow first column (strain names) to wrap if needed but prevent random wrapping */
        td:first-child {
          white-space: normal !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: none !important;
        }
        /* Ensure consistent font weight rendering */
        td span, td div {
          font-weight: inherit !important;
        }

        /* Force consistent rendering for last jar strains */
        tbody tr[style*="#fff7ed"] {
          background-color: #fff7ed !important;
          border-left: 3px solid #fe9426 !important; /* Simple border on the row instead of pseudo-element */
        }
        tbody tr[style*="#fff7ed"] td {
          background-color: #fff7ed !important;
          font-weight: 500 !important; /* Keep consistent font weight */
        }
        tbody tr[style*="#fff7ed"] td:first-child {
          font-weight: 500 !important; /* Ensure strain names use consistent weight */
        }
        tbody tr[style*="#fff7ed"] td:last-child {
          font-weight: 500 !important; /* Ensure THC column uses consistent weight */
        }
        /* Force more predictable column widths during export */
        table {
          width: 100% !important;
        }
        colgroup col:first-child {
          width: 35% !important;
        }
        colgroup col:nth-child(2) {
          width: 30% !important;
        }
        colgroup col:nth-child(3) {
          width: 15% !important;
        }
        colgroup col:nth-child(4) {
          width: 20% !important;
        }
        /* Hide overflow warnings during export */
        .shelf-overflow-warning {
          display: none !important;
        }
        
        /* PrePackaged Table Export Styling */
        /* Ensure consistent table styling for pre-packaged products */
        table[style*="border-collapse: separate"] {
          border-collapse: separate !important;
          border-spacing: 0 !important;
        }
        
        /* Ensure pre-packaged table headers render consistently */
        th[style*="background-color: #f8fafc"] {
          background-color: #f8fafc !important;
          font-weight: 600 !important;
        }
        
        /* Ensure alternating row colors render properly */
        tbody tr:nth-child(even) {
          background-color: #fafbfc !important;
        }
        
        tbody tr:nth-child(odd) {
          background-color: white !important;
        }
        
        /* Ensure brand emphasis renders correctly */
        td[style*="font-weight: 600"] {
          font-weight: 600 !important;
        }
        
        /* Ensure price styling renders consistently */
        td span[style*="color: #059669"] {
          color: #059669 !important;
          font-weight: 700 !important;
        }
        
        /* Ensure inventory status colors render properly */
        td[style*="color: #dc2626"] {
          color: #dc2626 !important;
        }
        
        td[style*="color: #d97706"] {
          color: #d97706 !important;
        }
      `;
      document.head.appendChild(styleElement);

      const performCapture = async () => {
        try {
          // 1. Wait for fonts to be ready
          await document.fonts.ready;

          // 2. Wait for images within the nodeToCapture to load
          const images = Array.from(nodeToCapture.getElementsByTagName('img'));
          const imageLoadPromises = images.map(img => {
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve(); // Already loaded and valid
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => {
                console.warn(`Failed to load image during export: ${img.src}`);
                resolve(); // Resolve even on error to not block export, but log it
              };
            });
          });
          
          // Timeout for all image loading
          const imageLoadingOverallTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Image loading for export timed out after 5 seconds')), 5000)
          );
          
          await Promise.race([
            Promise.all(imageLoadPromises),
            imageLoadingOverallTimeout
          ]).catch(err => {
            console.warn("Image loading issue during export (overall timeout or multiple errors):", err);
            // Proceeding with capture anyway
          });

          // A small delay for rendering to settle
          await new Promise(resolve => setTimeout(resolve, 100));

          // Use dom-to-image for export
          const imageExtension = exportType === 'png' ? 'png' : 'jpg';
          
          let dataUrl: string;
          if (exportType === 'png') {
            dataUrl = await domtoimage.toPng(nodeToCapture, {
              width: exportDimensions.naturalWidth,
              height: exportDimensions.naturalHeight,
              bgcolor: '#ffffff',
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
              }
            });
          } else {
            dataUrl = await domtoimage.toJpeg(nodeToCapture, {
              width: exportDimensions.naturalWidth,
              height: exportDimensions.naturalHeight,
              bgcolor: '#ffffff',
              quality: 0.92,
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
              }
            });
          }

          // Convert data URL to blob and download
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename || 'mango-menu'}.${imageExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } else {
            console.error("Failed to create blob from data URL.");
          }

        } catch (err) {
          console.error("Error exporting image with dom-to-image:", err);
        } finally {
          // Restore original styles and position
          nodeToCapture.style.boxShadow = originalStyles.boxShadow;
          nodeToCapture.style.position = originalStyles.position;
          nodeToCapture.style.left = originalStyles.left;
          nodeToCapture.style.top = originalStyles.top;
          nodeToCapture.style.transform = originalStyles.transform;
          nodeToCapture.style.backgroundColor = originalStyles.backgroundColor;

          // Move node back to its original place in the DOM
          if (originalParent && nodeToCapture.parentElement === captureWrapper) {
            originalParent.insertBefore(nodeToCapture, originalNextSibling);
          } else if (nodeToCapture.parentElement === captureWrapper) {
             console.warn("Original parent for artboard was lost during export. Fallback might be needed.");
             // As a fallback, if originalParent is somehow lost, append to where it was (if possible)
             // or consider re-rendering/managing state if this becomes an issue.
             // For now, this relies on originalParent still being valid.
             document.body.appendChild(nodeToCapture); // This is not ideal, but better than leaving in wrapper
          }
          
          // Clean up the wrapper and style element
          if (captureWrapper.parentElement) {
            captureWrapper.parentElement.removeChild(captureWrapper);
          }
          if (styleElement.parentElement) {
            styleElement.parentElement.removeChild(styleElement);
          }
          onExportComplete();
        }
      };

      performCapture();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportAction, onExportComplete]); // Dependencies include exportAction and onExportComplete

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <PreviewControlsTop
        settings={settings}
        onSettingsChange={onSettingsChange}
        theme={theme}
        isControlsDisabled={isControlsDisabled}
        onAutoFormat={onAutoFormat}
        isOptimizing={isOptimizing}
        hasContentOverflow={hasOverflow}
      />
      
      <div className="flex-1 relative overflow-hidden">
        {/* Content Overflow Warning */}
        {hasContentOverflow && (
          <div className="absolute top-4 right-4 z-50">
            <div className={`bg-red-100 border-l-4 border-red-500 p-3 rounded-r-md shadow-lg max-w-sm ${
              theme === 'dark' ? 'bg-red-900/80 text-red-200' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Content Overflow Detected
                  </p>
                  <p className="text-xs mt-1">
                    Some content is extending beyond the artboard boundaries. Consider reducing font size, increasing columns, or enabling shelf splitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full h-full relative overflow-hidden cursor-${isPanning ? 'grabbing' : 'grab'} ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{
            backgroundImage: `radial-gradient(circle, ${
              theme === 'dark' ? '#374151' : '#d1d5db'
            } 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: `${panOffset.x % 20}px ${panOffset.y % 20}px`,
          }}
        >
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${settings.zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <MultiPageArtboardContainer
              ref={artboardRef}
              shelves={shelves}
              settings={settings}
              currentState={currentState}
              theme={theme}
              onOverflowDetected={onOverflowDetected || handleOverflowDetected}
              onSettingsChange={onSettingsChange}
              onAddPage={onAddPage}
              onRemovePage={onRemovePage}
              onGoToPage={onGoToPage}
              onToggleAutoPageBreaks={onToggleAutoPageBreaks}
            />
          </div>
        </div>

        {/* DEPRECATED: Multi-page functionality - hidden for now but preserved for future development
            FloatingPageControls provided clean bottom-right navigation with page count, arrows, and auto toggle */}
        {false && (
          <FloatingPageControls
            currentPage={settings.currentPage}
            totalPages={settings.pageCount}
            onAddPage={onAddPage}
            onRemovePage={onRemovePage}
            onGoToPage={onGoToPage}
            onToggleAutoPageBreaks={onToggleAutoPageBreaks}
            autoPageBreaks={settings.autoPageBreaks}
            theme={theme}
          />
        )}
      </div>

      <PreviewControlsBottom
        settings={settings}
        onSettingsChange={onSettingsChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToWindow={() => onSettingsChange({ fitToWindowTrigger: Date.now() })}
        onResetZoom={resetZoomAndPan}
        currentZoom={settings.zoomLevel}
        theme={theme}
        currentState={currentState}
        isControlsDisabled={isControlsDisabled}
      />
    </div>
  );
};
