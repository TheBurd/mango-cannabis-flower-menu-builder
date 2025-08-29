import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '../../types';

interface ScrollOverlayFooterProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  theme: Theme;
  performanceLevel?: 'high' | 'medium' | 'low';
  frameSkipCount?: number;
  // Enhanced performance metrics
  currentFPS?: number;
  avgFrameTime?: number;
  totalStrains?: number;
  memoryUsage?: number;
  dropFrameRate?: number;
}

// Tooltip portal component for rendering outside of constrained containers
const TooltipPortal: React.FC<{
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  visible: boolean;
}> = ({ children, anchorRef, visible }) => {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 16rem = 256px
      const padding = 8; // mb-2 equivalent
      
      // Position tooltip above the anchor, aligned to the right edge
      setTooltipStyle({
        position: 'fixed',
        top: rect.top - padding,
        right: window.innerWidth - rect.right,
        transform: 'translateY(-100%)',
        zIndex: 9999,
        width: `${tooltipWidth}px`
      });
    }
  }, [visible, anchorRef]);

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div style={tooltipStyle}>
      {children}
    </div>,
    document.body
  );
};

export const ScrollOverlayFooter: React.FC<ScrollOverlayFooterProps> = ({
  enabled,
  onToggle,
  theme,
  performanceLevel = 'high',
  frameSkipCount = 0,
  currentFPS = 60,
  avgFrameTime = 16.67,
  totalStrains = 0,
  memoryUsage = 0,
  dropFrameRate = 0
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  
  const handleToggle = () => {
    onToggle(!enabled);
  };

  return (
    <div 
      className={`
        sticky bottom-0 left-0 right-0 z-10 
        border-t shadow-lg px-3 py-2 
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span 
            className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Scroll Overlay
          </span>
          
          <button
            onClick={handleToggle}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0
              transition-colors duration-200 ease-in-out focus:outline-none
              focus:ring-2 focus:ring-offset-2
              ${enabled
                ? theme === 'dark' 
                  ? 'bg-orange-600 focus:ring-orange-500' 
                  : 'bg-orange-500 focus:ring-orange-400'
                : theme === 'dark'
                  ? 'bg-gray-600 focus:ring-gray-500'
                  : 'bg-gray-300 focus:ring-gray-400'
              }
              ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
            `}
            role="switch"
            aria-checked={enabled}
            aria-labelledby="scroll-overlay-label"
            aria-describedby="scroll-overlay-description"
          >
            <span
              className={`
                inline-block h-3 w-3 rounded-full bg-white shadow-lg
                transform transition-transform duration-200 ease-in-out
                ${enabled ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            ref={statusRef}
            className={`text-xs relative ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {enabled ? (
              <span className="flex items-center gap-1 cursor-help">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  performanceLevel === 'high' ? 'bg-green-500' :
                  performanceLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                <span className="hidden sm:inline">
                  {performanceLevel === 'high' ? 'High' :
                   performanceLevel === 'medium' ? 'Med' : 'Low'}
                </span>
                <span className="sm:hidden">On</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                Off
              </span>
            )}
          </div>
        </div>
        
        {/* Enhanced tooltip portal - shows for all performance levels with metrics */}
        {enabled && (
          <TooltipPortal anchorRef={statusRef} visible={showTooltip}>
            <div className={`
              px-3 py-2 text-xs rounded-lg shadow-lg
              ${theme === 'dark' 
                ? 'bg-gray-900 text-gray-200 border border-gray-700' 
                : 'bg-white text-gray-700 border border-gray-200'
              }
            `}>
              {performanceLevel === 'high' ? (
                <>
                  <div className="font-medium mb-2 text-green-500">Optimal Performance</div>
                  <div className="mb-2">Running smoothly with all features enabled.</div>
                </>
              ) : performanceLevel === 'medium' ? (
                <>
                  <div className="font-medium mb-2 text-yellow-500">Balanced Performance</div>
                  <div className="mb-2">Some optimizations active to maintain smooth scrolling.</div>
                </>
              ) : (
                <>
                  <div className="font-medium mb-2 text-red-500">Performance Mode</div>
                  <div className="mb-2">Heavy optimizations active. Consider disabling for better app performance.</div>
                </>
              )}
              
              {/* Real-time metrics */}
              <div className="text-left border-t pt-2 mt-2 space-y-1" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <span className={`font-mono ${currentFPS >= 50 ? 'text-green-500' : currentFPS >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {currentFPS}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Time:</span>
                  <span className="font-mono">{avgFrameTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Strains:</span>
                  <span className="font-mono">{totalStrains.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-mono">{memoryUsage}MB</span>
                </div>
                {dropFrameRate > 0 && (
                  <div className="flex justify-between">
                    <span>Drops:</span>
                    <span className={`font-mono ${dropFrameRate > 10 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {dropFrameRate}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Tooltip arrow */}
              <div className={`
                absolute top-full border-4 border-transparent
                ${theme === 'dark' ? 'border-t-gray-900' : 'border-t-white'}
              `}
              style={{ 
                right: '24px',
                transform: 'none' 
              }}></div>
            </div>
          </TooltipPortal>
        )}
      </div>
      
      {/* Screen reader descriptions */}
      <div className="sr-only">
        <span id="scroll-overlay-label">
          Scroll Overlay
        </span>
        <span id="scroll-overlay-description">
          {enabled 
            ? 'Shows strain names while scrolling. Currently active.'
            : 'Shows strain names while scrolling. Currently disabled for better performance.'
          }
        </span>
      </div>
    </div>
  );
};

// Optional: Export a more minimal version for compact layouts
export const CompactScrollOverlayFooter: React.FC<ScrollOverlayFooterProps> = ({
  enabled,
  onToggle,
  theme
}) => {
  return (
    <div 
      className={`
        sticky bottom-0 left-0 right-0 z-10 
        border-t px-2 py-1.5
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <span 
          className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Nav
        </span>
        
        <button
          onClick={() => onToggle(!enabled)}
          className={`
            relative inline-flex h-4 w-7 items-center rounded-full
            transition-colors duration-200 ease-in-out focus:outline-none
            focus:ring-1 focus:ring-offset-1
            ${enabled
              ? theme === 'dark' 
                ? 'bg-orange-600 focus:ring-orange-500' 
                : 'bg-orange-500 focus:ring-orange-400'
              : theme === 'dark'
                ? 'bg-gray-600 focus:ring-gray-500'
                : 'bg-gray-300 focus:ring-gray-400'
            }
            ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
          `}
          role="switch"
          aria-checked={enabled}
          aria-label={`Scroll navigation overlay ${enabled ? 'enabled' : 'disabled'}`}
        >
          <span
            className={`
              inline-block h-2.5 w-2.5 rounded-full bg-white shadow
              transform transition-transform duration-200 ease-in-out
              ${enabled ? 'translate-x-3' : 'translate-x-0.5'}
            `}
          />
        </button>
        
        <div 
          className={`w-2 h-2 rounded-full ${
            enabled ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};