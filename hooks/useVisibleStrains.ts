import { useEffect, useState, useRef, useCallback } from 'react';
import { Shelf } from '../types';

interface StrainVisibility {
  shelfId: string;
  strainId: string;
  strainName: string;
  shelfName: string;
  shelfColor: string;
  isVisible: boolean;
  visibilityRatio: number; // 0-1, how much of the strain is visible
  index: number; // Global index across all strains
  isShelfHeader?: boolean; // True if this represents a shelf header
  shelfType?: string; // Type of shelf (flower, shake, etc.)
}

interface UseVisibleStrainsOptions {
  shelves: Shelf[];
  containerElement: HTMLElement | null;
  rootMargin?: string; // Margin around viewport for detecting "near" items
  threshold?: number[]; // Intersection ratios to observe
}

export const useVisibleStrains = ({
  shelves,
  containerElement,
  rootMargin = '-10% 0px -10% 0px', // Only consider fully visible strains
  threshold = [0, 0.25, 0.5, 0.75, 1.0]
}: UseVisibleStrainsOptions): {
  visibleStrains: StrainVisibility[];
  allStrains: StrainVisibility[];
  centerStrainIndex: number;
} => {
  const [visibleStrains, setVisibleStrains] = useState<StrainVisibility[]>([]);
  const [allStrains, setAllStrains] = useState<StrainVisibility[]>([]);
  const [centerStrainIndex, setCenterStrainIndex] = useState<number>(0);
  const prevCenterStrainIndex = useRef<number>(0);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const strainElementsMap = useRef<Map<string, Element>>(new Map());
  const visibilityMap = useRef<Map<string, StrainVisibility>>(new Map());

  // Build the complete strains list from shelves with headers
  useEffect(() => {
    const strainsInventory: StrainVisibility[] = [];
    let globalIndex = 0;
    
    shelves.forEach((shelf, shelfIndex) => {
      // Add shelf header as first item
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
    
    setAllStrains(strainsInventory);
  }, [shelves]);

  // Update visibility based on intersection (only for visual tracking, not center calculation)
  const updateVisibility = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const strainId = entry.target.getAttribute('data-strain-id') || entry.target.getAttribute('data-product-id');
      if (strainId && visibilityMap.current.has(strainId)) {
        const strain = visibilityMap.current.get(strainId)!;
        strain.isVisible = entry.isIntersecting;
        strain.visibilityRatio = entry.intersectionRatio;
      }
    });
    
    // Get all visible strains
    const visible = Array.from(visibilityMap.current.values())
      .filter(s => s.isVisible)
      .sort((a, b) => a.index - b.index);
    
    setVisibleStrains(visible);
    // Don't calculate center here - let scroll handler do it for instant updates
  }, []);

  // Add instant scroll-based position tracker
  useEffect(() => {
    if (!containerElement || allStrains.length === 0) return;

    const handleScroll = () => {
      const scrollTop = containerElement.scrollTop;
      const scrollHeight = containerElement.scrollHeight - containerElement.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      // Calculate which strain index is at the center based on scroll progress
      const estimatedIndex = Math.round(progress * (allStrains.length - 1));
      const clampedIndex = Math.max(0, Math.min(allStrains.length - 1, estimatedIndex));
      
      // Only update if actually changed to prevent re-renders
      if (clampedIndex !== prevCenterStrainIndex.current) {
        setCenterStrainIndex(clampedIndex);
        prevCenterStrainIndex.current = clampedIndex;
      }
    };

    // Direct scroll handling for instant updates
    containerElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
    };
  }, [containerElement, allStrains.length]);

  // Setup IntersectionObserver for visibility tracking only
  useEffect(() => {
    if (!containerElement) return;
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      updateVisibility,
      {
        root: containerElement,
        rootMargin,
        threshold
      }
    );
    
    // Observe all strain elements
    const observer = observerRef.current;
    strainElementsMap.current.clear();
    
    // Find and observe all strain/product input rows (both bulk and pre-packaged)
    const strainElements = containerElement.querySelectorAll('[data-strain-id], [data-product-id]');
    strainElements.forEach(element => {
      const strainId = element.getAttribute('data-strain-id') || element.getAttribute('data-product-id');
      if (strainId) {
        strainElementsMap.current.set(strainId, element);
        observer.observe(element);
      }
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [containerElement, rootMargin, threshold, updateVisibility, allStrains.length]);

  return {
    visibleStrains,
    allStrains,
    centerStrainIndex
  };
};