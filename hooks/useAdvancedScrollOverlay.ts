import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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

interface AdvancedScrollOverlayState {
  // Core state
  velocity: number;
  isScrolling: boolean;
  isScrollbarDragging: boolean;
  scrollDirection: 'up' | 'down' | null;
  
  // Optimized strain tracking
  visibleStrains: StrainVisibility[];
  allStrains: StrainVisibility[];
  centerStrainIndex: number;
  
  // Performance metrics
  performanceLevel: 'high' | 'medium' | 'low';
  frameSkipCount: number;
  
  // Enhanced performance metrics for tooltips
  currentFPS?: number;
  avgFrameTime?: number;
  totalStrains?: number;
  memoryUsage?: number;
  dropFrameRate?: number;
  
  // Display control
  showOverlay: boolean;
}

interface UseAdvancedScrollOverlayOptions {
  enabled: boolean;
  shelves: Shelf[];
  containerElement: HTMLElement | null;
  velocityThreshold?: number;
  hideDelay?: number;
  rootMargin?: string;
  intersectionThreshold?: number[];
  maxVisibleStrains?: number; // For virtual scrolling
  performanceMode?: 'auto' | 'high' | 'balanced' | 'battery';
}

export const useAdvancedScrollOverlay = ({
  enabled,
  shelves,
  containerElement,
  velocityThreshold = 15,
  hideDelay = 2500,
  rootMargin = '-20% 0px -20% 0px',
  intersectionThreshold = [0, 0.5, 1.0], // Reduced thresholds for performance
  maxVisibleStrains = 50, // Virtual scrolling limit
  performanceMode = 'auto'
}: UseAdvancedScrollOverlayOptions): AdvancedScrollOverlayState => {
  
  // Enhanced state with performance metrics
  const [state, setState] = useState<AdvancedScrollOverlayState>({
    velocity: 0,
    isScrolling: false,
    isScrollbarDragging: false,
    scrollDirection: null,
    visibleStrains: [],
    allStrains: [],
    centerStrainIndex: 0,
    performanceLevel: 'high',
    frameSkipCount: 0,
    currentFPS: 60,
    avgFrameTime: 16.67,
    totalStrains: 0,
    memoryUsage: 0,
    dropFrameRate: 0,
    showOverlay: false
  });
  
  // Enhanced performance monitoring refs
  const performanceMetrics = useRef({
    lastFrameTime: performance.now(),
    frameCount: 0,
    dropCount: 0,
    avgFrameTime: 16.67, // Target 60fps
    lastPerformanceCheck: 0,
    currentFPS: 60,
    renderLatency: 0,
    memoryUsage: 0,
    frameHistory: [] as number[], // Track last 30 frames for better FPS calculation
    lastStrainCount: 0,
    performanceResetTime: 0
  });
  
  // Optimized refs
  const lastScrollTop = useRef<number>(0);
  const lastScrollTime = useRef<number>(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();
  const skipFrameRef = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const scrollbarWidth = useRef<number>(0);
  
  // Virtual scrolling optimization
  const cachedElements = useRef<Map<string, { element: Element; rect: DOMRect; lastUpdate: number }>>(new Map());
  const elementQueryCache = useRef<{ elements: Element[]; lastUpdate: number; containerHash: string }>({
    elements: [],
    lastUpdate: 0,
    containerHash: ''
  });
  
  // Observer management
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibilityMap = useRef<Map<string, StrainVisibility>>(new Map());

  // Stable performance detection with hysteresis to prevent fluctuations
  const performanceLevelRef = useRef<'high' | 'medium' | 'low'>('high');
  const performanceStabilityRef = useRef<number>(0);
  
  const detectPerformanceLevel = useCallback(() => {
    const metrics = performanceMetrics.current;
    const now = performance.now();
    
    // Update performance metrics more frequently for better responsiveness
    if (now - metrics.lastPerformanceCheck < 1000) return; // Check every 1 second
    metrics.lastPerformanceCheck = now;
    
    // Calculate current strain count
    const strainCount = shelves.reduce((count, shelf) => {
      const items = 'strains' in shelf ? shelf.strains : shelf.products || [];
      return count + items.length;
    }, 0);
    
    // Calculate current FPS from frame history
    if (metrics.frameHistory.length > 10) {
      const recentFrames = metrics.frameHistory.slice(-30); // Last 30 frames
      const avgFrameTime = recentFrames.reduce((sum, time) => sum + time, 0) / recentFrames.length;
      metrics.currentFPS = Math.round(1000 / avgFrameTime);
      metrics.avgFrameTime = avgFrameTime;
    }
    
    // Estimate memory usage based on strain count and complexity
    metrics.memoryUsage = Math.round((strainCount * 0.2 + metrics.frameHistory.length * 0.1) * 100) / 100;
    
    let detectedLevel: 'high' | 'medium' | 'low' = 'high';
    
    // DYNAMIC PERFORMANCE DETECTION - Can go up OR down based on current conditions
    
    // 1. Frame time based detection
    if (metrics.avgFrameTime > 40 || metrics.currentFPS < 25) { // < 25fps
      detectedLevel = 'low';
    } else if (metrics.avgFrameTime > 25 || metrics.currentFPS < 40) { // < 40fps  
      detectedLevel = 'medium';
    }
    
    // 2. Strain count based thresholds (can improve performance when count decreases)
    if (performanceMode === 'auto') {
      // IMPROVEMENT: Allow upgrading performance when strain count is low
      if (strainCount < 100) {
        detectedLevel = 'high'; // Force high performance for small menus
      } else if (strainCount < 300 && detectedLevel === 'low') {
        detectedLevel = 'medium'; // Allow upgrade from low to medium
      } else if (strainCount > 500 && detectedLevel === 'high') {
        detectedLevel = 'medium'; // Downgrade from high to medium for large menus
      } else if (strainCount > 1000) {
        detectedLevel = 'low'; // Force low for very large menus
      }
    } else if (performanceMode === 'battery') {
      detectedLevel = 'low';
    } else if (performanceMode === 'balanced') {
      detectedLevel = 'medium';
    }
    
    // 3. RESET LOGIC: If strain count decreased significantly, allow immediate upgrade
    if (strainCount < metrics.lastStrainCount * 0.7) { // 30% reduction in strains
      metrics.performanceResetTime = now;
      performanceStabilityRef.current = 0; // Reset stability counter
    }
    metrics.lastStrainCount = strainCount;
    
    // 4. Stability logic - but allow faster upgrades after resets
    const isRecentReset = now - metrics.performanceResetTime < 5000; // 5 seconds after reset
    const stabilityRequired = isRecentReset ? 1 : 2; // Require fewer checks after reset
    
    if (detectedLevel === performanceLevelRef.current) {
      performanceStabilityRef.current = 0; // Reset stability counter
    } else {
      performanceStabilityRef.current++;
      
      // Change level after stability checks (faster for upgrades)
      if (performanceStabilityRef.current >= stabilityRequired) {
        performanceLevelRef.current = detectedLevel;
        performanceStabilityRef.current = 0;
        setState(prev => ({ 
          ...prev, 
          performanceLevel: detectedLevel,
          // Also update metrics for the footer
          currentFPS: metrics.currentFPS,
          avgFrameTime: Math.round(metrics.avgFrameTime * 100) / 100,
          totalStrains: strainCount,
          memoryUsage: metrics.memoryUsage,
          dropFrameRate: Math.round((metrics.dropCount / Math.max(metrics.frameCount, 1)) * 100)
        }));
      }
    }
  }, [shelves, performanceMode]);

  // Complete strain inventory - ALWAYS includes all strains for accurate overlay
  const virtualizedStrains = useMemo(() => {
    if (!enabled) return [];
    
    const strainsInventory: StrainVisibility[] = [];
    let globalIndex = 0;
    
    // IMPORTANT: Always process ALL shelves and ALL strains to prevent overlay inconsistencies
    // Performance optimizations are applied at the processing level, not the data level
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
      
      // Add ALL strains/products in the shelf - handle both shelf types with extra safety
      const items = ('strains' in shelf ? shelf.strains : shelf.products) || [];
      if (items && Array.isArray(items)) {
        items.forEach(strain => {
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
      }
    });
    
    return strainsInventory;
  }, [enabled, shelves]); // Remove performance level dependency

  // Enhanced element querying with better cross-shelf support
  const getCachedElements = useCallback(() => {
    if (!containerElement) return [];
    
    const cache = elementQueryCache.current;
    const now = performance.now();
    
    // More frequent cache invalidation for better accuracy, less frequent in low performance
    const cacheTime = state.performanceLevel === 'low' ? 1000 : 
                     state.performanceLevel === 'medium' ? 750 : 500;
    
    // Simpler cache key - just use scroll height and element count for validation
    const containerHash = `${containerElement.scrollHeight}-${containerElement.childElementCount}`;
    
    if (cache.containerHash === containerHash && 
        now - cache.lastUpdate < cacheTime && 
        cache.elements.length > 0) {
      return cache.elements;
    }
    
    // Enhanced element querying to ensure we get all strain elements across shelves
    const elements: Element[] = [];
    
    // Primary selectors for strain and product elements
    const strainElements = containerElement.querySelectorAll('[data-strain-id]:not([data-strain-id=""])');
    const productElements = containerElement.querySelectorAll('[data-product-id]:not([data-product-id=""])');
    
    // Combine and sort elements by their position in the DOM
    const allElements = [...Array.from(strainElements), ...Array.from(productElements)];
    
    // Sort by document position to maintain proper order across shelves
    allElements.sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    
    // Filter out elements that don't have valid strain/product IDs
    for (const element of allElements) {
      const strainId = element.getAttribute('data-strain-id');
      const productId = element.getAttribute('data-product-id');
      
      if ((strainId && strainId.trim() !== '') || (productId && productId.trim() !== '')) {
        elements.push(element);
      }
    }
    
    elementQueryCache.current = {
      elements,
      lastUpdate: now,
      containerHash
    };
    
    return elements;
  }, [containerElement, state.performanceLevel]);

  // High-performance scroll handler with adaptive frame skipping
  const handleScroll = useCallback(() => {
    if (!containerElement || !enabled) return;

    const now = performance.now();
    const frameTime = now - performanceMetrics.current.lastFrameTime;
    performanceMetrics.current.lastFrameTime = now;
    
    // Enhanced performance metrics tracking
    performanceMetrics.current.frameCount++;
    performanceMetrics.current.avgFrameTime = 
      (performanceMetrics.current.avgFrameTime * 0.9) + (frameTime * 0.1);
    
    // Track frame history for accurate FPS calculation
    performanceMetrics.current.frameHistory.push(frameTime);
    if (performanceMetrics.current.frameHistory.length > 30) {
      performanceMetrics.current.frameHistory.shift(); // Keep only last 30 frames
    }
    
    // Track dropped frames (frames > 33ms = below 30fps)
    if (frameTime > 33) {
      performanceMetrics.current.dropCount++;
    }
    
    // Adaptive frame skipping based on performance
    const skipFrames = state.performanceLevel === 'low' ? 2 : 
                      state.performanceLevel === 'medium' ? 1 : 0;
    
    if (skipFrameRef.current < skipFrames) {
      skipFrameRef.current++;
      return;
    }
    skipFrameRef.current = 0;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const currentScrollTop = containerElement.scrollTop;
      const currentTime = performance.now();
      const timeDelta = currentTime - lastScrollTime.current || 1;
      const scrollDelta = currentScrollTop - lastScrollTop.current;
      
      // Calculate velocity with smoothing
      const rawVelocity = Math.abs(scrollDelta / timeDelta * 100);
      const velocity = state.velocity * 0.7 + rawVelocity * 0.3; // Smooth velocity changes
      const scrollDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : null;
      
      // Fixed center calculation - more reliable across shelves
      let centerIndex = 0;
      const elements = getCachedElements();
      
      if (elements.length > 0 && virtualizedStrains.length > 0) {
        const containerRect = containerElement.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        
        let minDistance = Infinity;
        let foundValidElement = false;
        
        // Performance optimization: limit element processing based on performance level
        // But ensure we still find the correct center element
        const maxElements = state.performanceLevel === 'low' ? 
          Math.min(100, elements.length) : // Increased minimum to prevent missing elements
          state.performanceLevel === 'medium' ? 
          Math.min(200, elements.length) : 
          elements.length;
        
        for (let i = 0; i < maxElements; i++) {
          const element = elements[i];
          try {
            const rect = element.getBoundingClientRect();
            
            // Skip elements that are completely off-screen
            if (rect.height === 0 || rect.top > window.innerHeight + 100 || rect.bottom < -100) {
              continue;
            }
            
            const elementCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(centerY - elementCenterY);
            
            if (distance < minDistance) {
              const strainId = element.getAttribute('data-strain-id') || element.getAttribute('data-product-id');
              const strain = strainId ? visibilityMap.current.get(strainId) : null;
              
              if (strain && strain.index !== undefined) {
                minDistance = distance;
                centerIndex = strain.index;
                foundValidElement = true;
              }
            }
          } catch (error) {
            // Skip problematic elements
            console.debug('Error processing element in scroll overlay:', error);
            continue;
          }
        }
        
        // Fallback: Use scroll position if element-based calculation fails
        if (!foundValidElement && virtualizedStrains.length > 0) {
          const scrollProgress = containerElement.scrollHeight > containerElement.clientHeight ? 
            currentScrollTop / (containerElement.scrollHeight - containerElement.clientHeight) : 0;
          centerIndex = Math.min(
            Math.max(0, Math.floor(scrollProgress * virtualizedStrains.length)),
            virtualizedStrains.length - 1
          );
        }
      }
      
      const shouldShow = velocity > velocityThreshold || isMouseDown.current;
      
      // Batch state updates
      setState(prev => ({
        ...prev,
        velocity,
        isScrolling: shouldShow,
        isScrollbarDragging: isMouseDown.current,
        scrollDirection,
        centerStrainIndex: centerIndex,
        showOverlay: shouldShow,
        frameSkipCount: skipFrameRef.current
      }));
      
      lastScrollTop.current = currentScrollTop;
      lastScrollTime.current = currentTime;
      
      // Manage hide timeout
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      
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
  }, [containerElement, enabled, velocityThreshold, hideDelay, getCachedElements, state.performanceLevel, state.velocity]);

  // Lightweight intersection observer for visibility tracking
  const updateVisibility = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!enabled) return;
    
    // Batch updates for performance
    const updates: StrainVisibility[] = [];
    
    entries.forEach(entry => {
      const strainId = entry.target.getAttribute('data-strain-id') || entry.target.getAttribute('data-product-id');
      if (strainId && visibilityMap.current.has(strainId)) {
        const strain = visibilityMap.current.get(strainId)!;
        strain.isVisible = entry.isIntersecting;
        strain.visibilityRatio = entry.intersectionRatio;
        if (entry.isIntersecting) {
          updates.push(strain);
        }
      }
    });
    
    // Only update if there are meaningful changes
    if (updates.length > 0) {
      setState(prev => ({
        ...prev,
        visibleStrains: updates.sort((a, b) => a.index - b.index)
      }));
    }
  }, [enabled]);

  // Mouse handling for scrollbar detection
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
      
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      
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

  // Update all strains when virtualized strains change
  useEffect(() => {
    setState(prev => ({ ...prev, allStrains: virtualizedStrains }));
  }, [virtualizedStrains]);

  // Performance monitoring
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(detectPerformanceLevel, 2000);
    return () => clearInterval(interval);
  }, [enabled, detectPerformanceLevel]);

  // Scrollbar width calculation
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

  // Main effect for setting up all event listeners and observers
  useEffect(() => {
    if (!containerElement || !enabled) {
      // Cleanup when disabled
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      // Clear caches
      cachedElements.current.clear();
      elementQueryCache.current = { elements: [], lastUpdate: 0, containerHash: '' };
      
      return;
    }

    // Setup event listeners
    containerElement.addEventListener('scroll', handleScroll, { passive: true });
    containerElement.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    
    // Setup optimized intersection observer
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(updateVisibility, {
      root: containerElement,
      rootMargin,
      threshold: intersectionThreshold
    });
    
    // Observe elements with optimized querying
    const elements = getCachedElements();
    const observer = observerRef.current;
    
    // Observe fewer elements in low performance mode but ensure coverage
    let elementsToObserve = elements;
    
    if (state.performanceLevel === 'low' && elements.length > 100) {
      // In low performance, observe every 3rd element to maintain coverage while reducing load
      elementsToObserve = elements.filter((_, index) => index % 3 === 0);
    } else if (state.performanceLevel === 'medium' && elements.length > 200) {
      // In medium performance, observe every 2nd element
      elementsToObserve = elements.filter((_, index) => index % 2 === 0);
    }
    
    elementsToObserve.forEach(element => {
      observer.observe(element);
    });
    
    // Initial scroll calculation
    handleScroll();

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
      containerElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    containerElement,
    enabled,
    handleScroll,
    handleMouseDown,
    handleMouseUp,
    updateVisibility,
    rootMargin,
    intersectionThreshold,
    getCachedElements,
    state.performanceLevel
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
      performanceLevel: 'high',
      frameSkipCount: 0,
      currentFPS: 60,
      avgFrameTime: 16.67,
      totalStrains: 0,
      memoryUsage: 0,
      dropFrameRate: 0,
      showOverlay: false
    };
  }

  return state;
};