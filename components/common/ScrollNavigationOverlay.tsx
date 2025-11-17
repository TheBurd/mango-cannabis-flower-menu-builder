import React, { useMemo } from 'react';
import { Theme } from '../../types';

interface StrainInfo {
  shelfId: string;
  strainId: string;
  strainName: string;
  shelfName: string;
  shelfColor: string;
  index: number;
  isShelfHeader?: boolean;
  shelfType?: string;
}

interface ScrollNavigationOverlayProps {
  isVisible: boolean;
  strains: StrainInfo[];
  centerStrainIndex: number;
  containerElement: HTMLElement | null;
  theme: Theme;
  onStrainClick?: (strainId: string, shelfId: string) => void;
}

// Pre-calculated style lookup for instant access
const DISTANCE_STYLES = [
  { fontSize: 16, opacity: 1, fontWeight: 700 },     // distance 0 (current)
  { fontSize: 14, opacity: 0.85, fontWeight: 500 },  // distance 1
  { fontSize: 12, opacity: 0.7, fontWeight: 400 },   // distance 2
  { fontSize: 11, opacity: 0.55, fontWeight: 400 },  // distance 3-4
  { fontSize: 11, opacity: 0.55, fontWeight: 400 },  // distance 3-4
  { fontSize: 10, opacity: 0.35, fontWeight: 400 },  // distance 5+
];

const getStyleForDistance = (distance: number) => {
  if (distance >= DISTANCE_STYLES.length) {
    return DISTANCE_STYLES[DISTANCE_STYLES.length - 1];
  }
  return DISTANCE_STYLES[distance];
};

export const ScrollNavigationOverlay: React.FC<ScrollNavigationOverlayProps> = React.memo(({
  isVisible,
  strains,
  centerStrainIndex,
  containerElement,
  theme
}) => {

  const [overlayPosition, setOverlayPosition] = React.useState<{ left: number; top: number | '50%' }>({
    left: 10,
    top: '50%',
  });

  React.useLayoutEffect(() => {
    const updatePosition = () => {
      if (!containerElement) {
        setOverlayPosition({ left: 10, top: '50%' });
        return;
      }
      const rect = containerElement.getBoundingClientRect();
      setOverlayPosition({
        left: rect.right + 10,
        top: rect.top + rect.height / 2,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window && containerElement) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(containerElement);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      if (resizeObserver && containerElement) {
        resizeObserver.unobserve(containerElement);
        resizeObserver.disconnect();
      }
    };
  }, [containerElement]);

  // Calculate which strains to show and their magnification
  const visibleStrains = useMemo(() => {
    if (strains.length === 0) return [];
    
    // Adaptive window size based on total strain count for better performance
    const baseWindowSize = 25;
    const windowSize = strains.length > 500 ? 
      Math.min(baseWindowSize, 15) : // Smaller window for very large lists
      strains.length > 200 ? 
      Math.min(baseWindowSize, 20) : 
      baseWindowSize;
    
    const halfWindow = Math.floor(windowSize / 2);
    
    // Ensure we don't go out of bounds
    const centerIdx = Math.max(0, Math.min(centerStrainIndex, strains.length - 1));
    const startIdx = Math.max(0, centerIdx - halfWindow);
    const endIdx = Math.min(strains.length - 1, centerIdx + halfWindow);
    
    return strains.slice(startIdx, endIdx + 1).map(strain => {
      const distance = Math.abs(strain.index - centerIdx);
      const style = getStyleForDistance(distance);
      
      return {
        ...strain,
        ...style
      };
    });
  }, [strains, centerStrainIndex])

  // Always render but control visibility with opacity for smooth animations
  if (visibleStrains.length === 0) return null;

  return (
    <div
      className={`fixed pointer-events-none transition-opacity ${
        isVisible ? 'opacity-100 duration-150' : 'opacity-0 duration-1000'
      }`}
      style={{
        left: overlayPosition.left,
        top: overlayPosition.top,
        transform: 'translateY(-50%)',
        zIndex: 100,
        maxHeight: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Semi-transparent background for readability */}
      <div 
        className={`
          rounded-lg p-2 transition-all
          ${theme === 'dark' 
            ? 'bg-gray-900/70 backdrop-blur-sm' 
            : 'bg-white/70 backdrop-blur-sm'}
          ${isVisible ? 'scale-100 duration-150' : 'scale-95 duration-1000'}
        `}
        style={{
          minWidth: '140px',
          maxWidth: '200px'
        }}
      >
        {visibleStrains.map((strain, idx) => {
          const isHeader = strain.isShelfHeader;
          const isCurrent = strain.index === centerStrainIndex;
          
          // Show divider before shelf headers (except first)
          return (
            <React.Fragment key={strain.strainId}>
              {isHeader && idx > 0 && (
                <div 
                  className="my-1 border-t opacity-30"
                  style={{
                    borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                    marginTop: '4px',
                    marginBottom: '4px'
                  }}
                />
              )}
              <div
                className="transition-all duration-150 ease-out whitespace-nowrap overflow-hidden"
                style={{
                  fontSize: isHeader 
                    ? `${Math.min(strain.fontSize + 1, 17)}px` 
                    : `${strain.fontSize}px`,
                  opacity: strain.opacity,
                  fontWeight: isHeader ? 600 : strain.fontWeight,
                  lineHeight: 1.3,
                  paddingTop: isHeader ? '3px' : '1px',
                  paddingBottom: isHeader ? '3px' : '1px',
                  paddingLeft: isHeader ? '0px' : '8px',
                  color: isHeader
                    ? strain.shelfColor // Use shelf color for headers
                    : isCurrent 
                      ? (theme === 'dark' ? '#fb923c' : '#ea580c') // Orange for current strain
                      : (theme === 'dark' ? '#e5e7eb' : '#374151'), // Gray for other strains
                  textShadow: isCurrent && !isHeader
                    ? `0 0 8px ${theme === 'dark' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(234, 88, 12, 0.2)'}` 
                    : isHeader
                      ? `0 0 6px ${strain.shelfColor}40` // Subtle glow for headers
                      : 'none',
                  textTransform: isHeader ? 'uppercase' : 'none',
                  letterSpacing: isHeader ? '0.5px' : 'normal'
                }}
              >
                {isHeader ? (
                  <span className="flex items-center gap-1">
                    <span style={{ color: strain.shelfColor }}>▸</span>
                    {strain.strainName}
                  </span>
                ) : (
                  strain.strainName || 'Unnamed'
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance - check what actually matters for rendering
  if (prevProps.isVisible !== nextProps.isVisible ||
      prevProps.centerStrainIndex !== nextProps.centerStrainIndex ||
      prevProps.theme !== nextProps.theme ||
      prevProps.strains.length !== nextProps.strains.length) {
    return false;
  }
  
  // Deep comparison of strain data within the visible window only
  const windowSize = 25;
  const halfWindow = Math.floor(windowSize / 2);
  const startIdx = Math.max(0, nextProps.centerStrainIndex - halfWindow);
  const endIdx = Math.min(nextProps.strains.length - 1, nextProps.centerStrainIndex + halfWindow);
  
  // Check if the visible window strains have changed
  for (let i = startIdx; i <= endIdx && i < Math.min(prevProps.strains.length, nextProps.strains.length); i++) {
    const prevStrain = prevProps.strains[i];
    const nextStrain = nextProps.strains[i];
    
    if (!prevStrain || !nextStrain ||
        prevStrain.strainId !== nextStrain.strainId ||
        prevStrain.strainName !== nextStrain.strainName ||
        prevStrain.shelfColor !== nextStrain.shelfColor ||
        prevStrain.isShelfHeader !== nextStrain.isShelfHeader) {
      return false;
    }
  }
  
  return true;
});