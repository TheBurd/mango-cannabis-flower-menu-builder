import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import domtoimage from 'dom-to-image';
import { Shelf, PreviewSettings } from '../types';
import { PreviewControls } from './PreviewControls';
import { PreviewArtboard } from './PreviewArtboard';
import { ARTBOARD_DIMENSIONS_MAP, INITIAL_PREVIEW_SETTINGS } from '../constants';
import { ExportAction } from '../App';

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 10; 

interface MenuPreviewPanelProps {
  shelves: Shelf[];
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  needsRefreshSignal: boolean;
  hasUnrefreshedChanges: boolean; 
  exportAction: ExportAction | null;
  onExportComplete: () => void;
}

export const MenuPreviewPanel: React.FC<MenuPreviewPanelProps> = ({
  shelves,
  settings,
  onSettingsChange,
  needsRefreshSignal,
  hasUnrefreshedChanges, 
  exportAction,
  onExportComplete,
}) => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const artboardContainerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null); 
  const isPanning = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const artboardNaturalDimensions = useMemo(() => {
    return ARTBOARD_DIMENSIONS_MAP[settings.artboardSize];
  }, [settings.artboardSize]);

  const centerView = useCallback((targetZoom: number) => {
    if (artboardContainerRef.current) {
      const containerWidth = artboardContainerRef.current.offsetWidth;
      const containerHeight = artboardContainerRef.current.offsetHeight;
      
      const newPanX = containerWidth / 2;
      const newPanY = containerHeight / 2;
      
      setPanOffset({ x: newPanX, y: newPanY });
      onSettingsChange({ zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom)) });
    }
  }, [onSettingsChange]);

  const fitToWindow = useCallback(() => {
    if (artboardContainerRef.current && artboardNaturalDimensions) {
      const containerWidth = artboardContainerRef.current.offsetWidth - 32; 
      const containerHeight = artboardContainerRef.current.offsetHeight - 32;

      const scaleX = containerWidth / artboardNaturalDimensions.naturalWidth;
      const scaleY = containerHeight / artboardNaturalDimensions.naturalHeight;
      const newZoom = Math.min(scaleX, scaleY);
      centerView(newZoom);
    }
  }, [centerView, artboardNaturalDimensions]);

  useEffect(() => {
    fitToWindow();
  }, [fitToWindow, artboardNaturalDimensions]); 

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; 
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) {
        return;
    }
    isPanning.current = true;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    artboardContainerRef.current?.style.setProperty('cursor', 'grabbing');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMousePosition.current.x;
    const dy = e.clientY - lastMousePosition.current.y;
    setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isPanning.current = false;
    artboardContainerRef.current?.style.setProperty('cursor', 'grab');
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!artboardContainerRef.current) return;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? settings.zoomLevel * zoomFactor : settings.zoomLevel / zoomFactor;
    const clampedNewZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    const rect = artboardContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; 
    const mouseY = e.clientY - rect.top;

    const canvasPointX = (mouseX - panOffset.x) / settings.zoomLevel;
    const canvasPointY = (mouseY - panOffset.y) / settings.zoomLevel;

    const newPanX = mouseX - (canvasPointX * clampedNewZoom);
    const newPanY = mouseY - (canvasPointY * clampedNewZoom);
    
    setPanOffset({ x: newPanX, y: newPanY });
    onSettingsChange({ zoomLevel: clampedNewZoom });
  };

  const handleZoomChangeFromControls = (newZoom: number) => {
     if (!artboardContainerRef.current) return;
    const clampedNewZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    
    const containerWidth = artboardContainerRef.current.offsetWidth;
    const containerHeight = artboardContainerRef.current.offsetHeight;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const canvasPointX = (centerX - panOffset.x) / settings.zoomLevel;
    const canvasPointY = (centerY - panOffset.y) / settings.zoomLevel;

    const newPanX = centerX - (canvasPointX * clampedNewZoom);
    const newPanY = centerY - (canvasPointY * clampedNewZoom);

    setPanOffset({ x: newPanX, y: newPanY });
    onSettingsChange({ zoomLevel: clampedNewZoom });
  };
  
  const resetZoomAndPan = () => {
    const initialZoomForCurrentArtboard = INITIAL_PREVIEW_SETTINGS.zoomLevel || 0.25;
    centerView(initialZoomForCurrentArtboard); 
  }

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
            return new Promise<void>((resolve, reject) => {
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
          const imageMimeType = exportType === 'png' ? 'image/png' : 'image/jpeg';
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
    <div 
      id="menu-preview-panel" 
      className="flex-1 flex flex-col bg-gray-800 p-1 rounded-lg shadow-lg relative min-h-0 min-w-0"
    >
      <PreviewControls
        settings={settings}
        onSettingsChange={onSettingsChange} 
        onZoomIn={() => handleZoomChangeFromControls(settings.zoomLevel * 1.2)}
        onZoomOut={() => handleZoomChangeFromControls(settings.zoomLevel / 1.2)}
        onFitToWindow={fitToWindow}
        onResetZoom={resetZoomAndPan}
        currentZoom={settings.zoomLevel} 
        onDirectZoomChange={handleZoomChangeFromControls}
      />
      <div 
        ref={artboardContainerRef} 
        className="flex-1 bg-gray-900/50 overflow-hidden flex justify-center items-center rounded-b-md min-h-0 min-w-0 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave} 
        onWheel={handleWheel}
        style={{ cursor: 'grab' }}
        role="application"
        aria-label="Menu Preview Artboard - Click and drag to pan, scroll to zoom"
      >
        <div 
          style={{
            position: 'absolute',
            left: 0, 
            top: 0,
            width: '1px', 
            height: '1px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${settings.zoomLevel})`,
            transformOrigin: '0 0', 
            willChange: 'transform', 
          }}
        >
          <PreviewArtboard 
            ref={artboardRef} 
            shelves={shelves} 
            settings={settings}
            needsRefreshSignal={needsRefreshSignal} 
          />
        </div>
      </div>
    </div>
  );
};
