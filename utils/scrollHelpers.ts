/**
 * Scroll helper utilities for smooth navigation and position calculations
 */

/**
 * Smoothly scroll to a specific element within a container
 */
export const scrollToElement = (
  container: HTMLElement,
  targetSelector: string,
  options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number; // Additional offset from top
  } = {}
): void => {
  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0
  } = options;

  const targetElement = container.querySelector(targetSelector);
  
  if (targetElement) {
    if (offset !== 0) {
      // Manual scroll with offset
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const targetTop = targetRect.top - containerRect.top + scrollTop - offset;
      
      if (behavior === 'smooth') {
        smoothScrollTo(container, targetTop, 300);
      } else {
        container.scrollTop = targetTop;
      }
    } else {
      // Use native scrollIntoView
      targetElement.scrollIntoView({ behavior, block, inline });
    }
  }
};

/**
 * Smooth scroll animation using requestAnimationFrame
 */
export const smoothScrollTo = (
  element: HTMLElement,
  targetPosition: number,
  duration: number = 300
): Promise<void> => {
  return new Promise((resolve) => {
    const startPosition = element.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easeInOutQuad = (t: number) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };
      
      element.scrollTop = startPosition + distance * easeInOutQuad(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animation);
  });
};

/**
 * Calculate the magnification factor for strain names based on distance from center
 */
export const calculateMagnification = (
  itemIndex: number,
  centerIndex: number,
  maxDistance: number = 5
): {
  scale: number;
  opacity: number;
  fontSize: number;
} => {
  const distance = Math.abs(itemIndex - centerIndex);
  
  if (distance === 0) {
    // Center item - maximum magnification
    return { scale: 1.3, opacity: 1, fontSize: 15 };
  } else if (distance === 1) {
    // Adjacent items
    return { scale: 1.15, opacity: 0.9, fontSize: 13 };
  } else if (distance === 2) {
    // Near items
    return { scale: 1.05, opacity: 0.75, fontSize: 12 };
  } else if (distance <= maxDistance) {
    // Visible range
    return { scale: 1, opacity: 0.6, fontSize: 11 };
  } else {
    // Outside visible range
    return { scale: 0.95, opacity: 0.4, fontSize: 10 };
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
};

/**
 * Throttle function for limiting execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Calculate virtual scrolling window
 */
export const calculateVirtualWindow = (
  totalItems: number,
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan: number = 3
): {
  startIndex: number;
  endIndex: number;
  offsetY: number;
} => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  const offsetY = startIndex * itemHeight;
  
  return { startIndex, endIndex, offsetY };
};

/**
 * Get color with opacity
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert Tailwind color class to rgba
  // This is a simplified version - in production, you'd want a more robust solution
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  
  // Map common Tailwind colors to hex values
  const colorMap: Record<string, string> = {
    'bg-purple-600': '#9333ea',
    'bg-blue-600': '#2563eb',
    'bg-green-600': '#16a34a',
    'bg-yellow-600': '#ca8a04',
    'bg-red-600': '#dc2626',
    'bg-orange-600': '#ea580c',
    'bg-pink-600': '#db2777',
    'bg-indigo-600': '#4f46e5',
    // Add more as needed
  };
  
  const hexColor = colorMap[color] || '#6b7280'; // Default to gray if not found
  return `${hexColor}${opacityHex}`;
};