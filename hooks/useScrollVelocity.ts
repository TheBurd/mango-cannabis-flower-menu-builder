import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollVelocityState {
  velocity: number;
  isScrolling: boolean;
  isScrollbarDragging: boolean;
  scrollDirection: 'up' | 'down' | null;
}

interface UseScrollVelocityOptions {
  threshold?: number; // Velocity threshold to trigger overlay (pixels per 100ms)
  hideDelay?: number; // Delay before hiding overlay after scrolling stops (ms)
  element?: HTMLElement | null; // Element to track scrolling on
}

export const useScrollVelocity = ({
  threshold = 20,
  hideDelay = 2000,
  element
}: UseScrollVelocityOptions = {}): ScrollVelocityState => {
  const [state, setState] = useState<ScrollVelocityState>({
    velocity: 0,
    isScrolling: false,
    isScrollbarDragging: false,
    scrollDirection: null
  });
  
  const velocityRef = useRef<number>(0);
  const directionRef = useRef<'up' | 'down' | null>(null);

  const lastScrollTop = useRef<number>(0);
  const lastScrollTime = useRef<number>(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();
  const isMouseDown = useRef<boolean>(false);
  const scrollbarWidth = useRef<number>(0);

  // Calculate scrollbar width
  useEffect(() => {
    if (!element) return;
    
    const calculateScrollbarWidth = () => {
      const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
      if (hasVerticalScrollbar) {
        scrollbarWidth.current = element.offsetWidth - element.clientWidth;
      }
    };
    
    calculateScrollbarWidth();
    
    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateScrollbarWidth);
    resizeObserver.observe(element);
    
    return () => resizeObserver.disconnect();
  }, [element]);

  // Handle scroll events without throttling for instant updates
  const handleScroll = useCallback(() => {
    if (!element) return;

    // Process immediately without RAF for instant response
    const processScroll = () => {
      const currentScrollTop = element.scrollTop;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastScrollTime.current || 1; // Prevent division by zero
      const scrollDelta = currentScrollTop - lastScrollTop.current;
      
      // Calculate velocity (pixels per 100ms)
      const velocity = Math.abs(scrollDelta / timeDelta * 100);
      velocityRef.current = velocity;
      
      // Determine scroll direction
      const scrollDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : null;
      directionRef.current = scrollDirection;
      
      // Only update state if there's a meaningful change
      const shouldShow = velocity > threshold || isMouseDown.current;
      
      setState(prev => {
        // Only update if scrolling state actually changes
        if (prev.isScrolling === shouldShow && 
            prev.isScrollbarDragging === isMouseDown.current) {
          return prev;
        }
        
        return {
          velocity: velocityRef.current,
          isScrolling: shouldShow,
          isScrollbarDragging: isMouseDown.current,
          scrollDirection: directionRef.current
        };
      });
      
      // Store current values for next calculation
      lastScrollTop.current = currentScrollTop;
      lastScrollTime.current = currentTime;
      
      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Set new timeout to hide overlay with longer delay
      if (shouldShow) {
        hideTimeoutRef.current = setTimeout(() => {
          setState({
            velocity: 0,
            isScrolling: false,
            isScrollbarDragging: false,
            scrollDirection: null
          });
        }, hideDelay);
      }
    };
    
    processScroll();
  }, [element, threshold, hideDelay]);

  // Detect scrollbar dragging
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!element) return;
    
    // Check if click is on or near scrollbar
    const rect = element.getBoundingClientRect();
    const isNearScrollbar = e.clientX >= rect.right - scrollbarWidth.current - 5;
    
    if (isNearScrollbar) {
      isMouseDown.current = true;
      setState(prev => ({
        ...prev,
        isScrollbarDragging: true,
        isScrolling: true
      }));
    }
  }, [element]);

  const handleMouseUp = useCallback(() => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      
      // Keep overlay visible for a moment after releasing scrollbar
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setState({
          velocity: 0,
          isScrolling: false,
          isScrollbarDragging: false,
          scrollDirection: null
        });
      }, hideDelay);
    }
  }, [hideDelay]);

  // Detect mouse movement while dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMouseDown.current) {
      handleScroll();
    }
  }, [handleScroll]);

  // Setup event listeners
  useEffect(() => {
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true, capture: false });
    element.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [element, handleScroll, handleMouseDown, handleMouseUp, handleMouseMove]);

  return state;
};