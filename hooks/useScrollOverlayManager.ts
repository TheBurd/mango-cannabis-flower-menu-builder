import { useEffect, useState, useRef, useCallback } from 'react';
import { Shelf } from '../types';

interface StrainVisibility {
  shelfId: string;
  strainId: string;
  strainName: string;
  shelfName: string;
  shelfColor: string;
  isVisible: boolean;
  visibilityRatio: number;
  index: number;
  isShelfHeader?: boolean;
  shelfType?: string;
  elementRect?: DOMRect;
}

interface ScrollOverlayState {
  // Scroll velocity tracking
  velocity: number;
  isScrolling: boolean;
  isScrollbarDragging: boolean;
  scrollDirection: 'up' | 'down' | null;
  
  // Strain visibility tracking
  visibleStrains: StrainVisibility[];
  allStrains: StrainVisibility[];
  centerStrainIndex: number;
  
  // Overlay display
  showOverlay: boolean;
}

interface UseScrollOverlayManagerOptions {
  enabled: boolean; // Master toggle for entire overlay system
  shelves: Shelf[];
  containerElement: HTMLElement | null;
  velocityThreshold?: number;
  hideDelay?: number;
  rootMargin?: string;
  intersectionThreshold?: number[];
}

export const useScrollOverlayManager = ({
  enabled,
  shelves,
  containerElement,
  velocityThreshold = 15,
  hideDelay = 2500,
  rootMargin = '-20% 0px -20% 0px',
  intersectionThreshold = [0, 0.25, 0.5, 0.75, 1.0]
}: UseScrollOverlayManagerOptions): ScrollOverlayState => {
  
  // State
  const [state, setState] = useState<ScrollOverlayState>({
    velocity: 0,
    isScrolling: false,
    isScrollbarDragging: false,
    scrollDirection: null,
    visibleStrains: [],
    allStrains: [],
    centerStrainIndex: 0,
    showOverlay: false
  });
  
  // Refs for performance optimization
  const lastScrollTop = useRef<number>(0);
  const lastScrollTime = useRef<number>(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();
  const isMouseDown = useRef<boolean>(false);
  const scrollbarWidth = useRef<number>(0);
  const cachedDimensions = useRef<{ scrollHeight: number; clientHeight: number; lastUpdate: number }>({
    scrollHeight: 0,
    clientHeight: 0,
    lastUpdate: 0
  });
  const prevCenterIndex = useRef<number>(0);
  
  // Observer and element tracking
  const observerRef = useRef<IntersectionObserver | null>(null);
  const strainElementsMap = useRef<Map<string, Element>>(new Map());
  const visibilityMap = useRef<Map<string, StrainVisibility>>(new Map());

  // Build complete strains list with proper indexing
  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, allStrains: [], visibleStrains: [] }));
      return;
    }

    const strainsInventory: StrainVisibility[] = [];
    let globalIndex = 0;
    
    shelves.forEach(shelf => {
      // Add shelf header
      const headerVisibility: StrainVisibility = {
        shelfId: shelf.id,
        strainId: `${shelf.id}-header`,
        strainName: shelf.name,
        shelfName: shelf.name,
        shelfColor: shelf.color,
        isVisible: false,
        visibilityRatio: 0,
        index: globalIndex++,
        isShelfHeader: true,
        shelfType: shelf.type || 'flower'
      };
      strainsInventory.push(headerVisibility);
      visibilityMap.current.set(`${shelf.id}-header`, headerVisibility);
      
      // Add all strains in the shelf
      shelf.strains.forEach(strain => {
        const visibility: StrainVisibility = {
          shelfId: shelf.id,
          strainId: strain.id,
          strainName: strain.name || 'Unnamed Strain',
          shelfName: shelf.name,
          shelfColor: shelf.color,
          isVisible: false,
          visibilityRatio: 0,
          index: globalIndex++,
          isShelfHeader: false,
          shelfType: shelf.type || 'flower'
        };
        strainsInventory.push(visibility);
        visibilityMap.current.set(strain.id, visibility);
      });
    });
    
    setState(prev => ({ ...prev, allStrains: strainsInventory }));
  }, [enabled, shelves]);

  // Cache DOM dimensions with throttling
  const updateDimensions = useCallback(() => {
    if (!containerElement || !enabled) return;
    
    const now = performance.now();
    // Only update dimensions every 100ms to prevent excessive layout calculations
    if (now - cachedDimensions.current.lastUpdate < 100) return;
    
    cachedDimensions.current = {
      scrollHeight: containerElement.scrollHeight,
      clientHeight: containerElement.clientHeight,
      lastUpdate: now
    };
  }, [containerElement, enabled]);

  // Unified scroll handler with RAF throttling
  const handleScroll = useCallback(() => {
    if (!containerElement || !enabled) return;

    // Use RAF for smooth 60fps updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const currentScrollTop = containerElement.scrollTop;
      const currentTime = performance.now();
      const timeDelta = currentTime - lastScrollTime.current || 1;
      const scrollDelta = currentScrollTop - lastScrollTop.current;
      
      // Calculate velocity (pixels per 100ms)
      const velocity = Math.abs(scrollDelta / timeDelta * 100);
      const scrollDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : null;
      
      // Update cached dimensions periodically
      updateDimensions();
      
      // Calculate center strain using actual DOM positions instead of scroll percentage
      let centerIndex = 0;
      const containerRect = containerElement.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      
      // Find the strain element closest to center
      let minDistance = Infinity;
      strainElementsMap.current.forEach((element, strainId) => {
        const rect = element.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - elementCenterY);
        
        if (distance < minDistance) {
          minDistance = distance;
          const strain = visibilityMap.current.get(strainId);
          if (strain) {
            centerIndex = strain.index;
          }
        }
      });
      
      // Only update if there are meaningful changes
      const shouldShow = velocity > velocityThreshold || isMouseDown.current;
      const centerChanged = centerIndex !== prevCenterIndex.current;
      
      if (shouldShow !== state.isScrolling || centerChanged || velocity !== state.velocity) {
        setState(prev => ({
          ...prev,
          velocity,
          isScrolling: shouldShow,
          isScrollbarDragging: isMouseDown.current,
          scrollDirection,
          centerStrainIndex: centerIndex,
          showOverlay: shouldShow
        }));
        
        prevCenterIndex.current = centerIndex;
      }
      
      // Store current values for next calculation
      lastScrollTop.current = currentScrollTop;
      lastScrollTime.current = currentTime;
      
      // Clear existing timeout and set new one
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      if (shouldShow) {
        hideTimeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            velocity: 0,
            isScrolling: false,
            isScrollbarDragging: false,
            scrollDirection: null,
            showOverlay: false
          }));
        }, hideDelay);
      }
    });
  }, [containerElement, enabled, velocityThreshold, hideDelay, updateDimensions, state.isScrolling, state.velocity]);

  // Intersection observer for visibility tracking
  const updateVisibility = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!enabled) return;
    
    entries.forEach(entry => {
      const strainId = entry.target.getAttribute('data-strain-id') || entry.target.getAttribute('data-product-id');
      if (strainId && visibilityMap.current.has(strainId)) {
        const strain = visibilityMap.current.get(strainId)!;
        strain.isVisible = entry.isIntersecting;
        strain.visibilityRatio = entry.intersectionRatio;
      }
    });
    
    const visible = Array.from(visibilityMap.current.values())
      .filter(s => s.isVisible)
      .sort((a, b) => a.index - b.index);
    
    setState(prev => ({ ...prev, visibleStrains: visible }));
  }, [enabled]);

  // Mouse event handlers for scrollbar detection
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!containerElement || !enabled) return;
    
    const rect = containerElement.getBoundingClientRect();
    const isNearScrollbar = e.clientX >= rect.right - scrollbarWidth.current - 5;
    
    if (isNearScrollbar) {
      isMouseDown.current = true;
      setState(prev => ({
        ...prev,
        isScrollbarDragging: true,
        isScrolling: true,
        showOverlay: true
      }));
    }
  }, [containerElement, enabled]);

  const handleMouseUp = useCallback(() => {
    if (!enabled) return;
    
    if (isMouseDown.current) {
      isMouseDown.current = false;
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isScrolling: false,
          isScrollbarDragging: false,
          showOverlay: false
        }));
      }, hideDelay);
    }
  }, [enabled, hideDelay]);

  const handleMouseMove = useCallback(() => {
    if (isMouseDown.current && enabled) {
      handleScroll();
    }
  }, [handleScroll, enabled]);

  // Calculate scrollbar width
  useEffect(() => {
    if (!containerElement || !enabled) return;
    
    const calculateScrollbarWidth = () => {
      const hasVerticalScrollbar = containerElement.scrollHeight > containerElement.clientHeight;
      if (hasVerticalScrollbar) {
        scrollbarWidth.current = containerElement.offsetWidth - containerElement.clientWidth;
      }
    };
    
    calculateScrollbarWidth();
    const resizeObserver = new ResizeObserver(calculateScrollbarWidth);
    resizeObserver.observe(containerElement);
    
    return () => resizeObserver.disconnect();
  }, [containerElement, enabled]);

  // Setup all event listeners and observers
  useEffect(() => {
    if (!containerElement || !enabled) {
      // Clean up when disabled
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      return;
    }

    // Setup scroll listener
    containerElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Setup mouse listeners
    containerElement.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Setup intersection observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(updateVisibility, {
      root: containerElement,
      rootMargin,
      threshold: intersectionThreshold
    });
    
    const observer = observerRef.current;
    strainElementsMap.current.clear();
    
    // Observe all strain elements
    const strainElements = containerElement.querySelectorAll('[data-strain-id], [data-product-id]');
    strainElements.forEach(element => {
      const strainId = element.getAttribute('data-strain-id') || element.getAttribute('data-product-id');
      if (strainId) {
        strainElementsMap.current.set(strainId, element);
        observer.observe(element);
      }
    });
    
    // Initial scroll handler call
    handleScroll();

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
      containerElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    containerElement, 
    enabled, 
    handleScroll, 
    handleMouseDown, 
    handleMouseUp, 
    handleMouseMove, 
    updateVisibility, 
    rootMargin, 
    intersectionThreshold
  ]);

  // Return disabled state when not enabled
  if (!enabled) {
    return {
      velocity: 0,
      isScrolling: false,
      isScrollbarDragging: false,
      scrollDirection: null,
      visibleStrains: [],
      allStrains: [],
      centerStrainIndex: 0,
      showOverlay: false
    };
  }

  return state;
};