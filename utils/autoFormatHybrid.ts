import { PreviewSettings } from '../types';
import { AutoFormatState, AutoFormatResult } from './autoFormat';
import { 
  AUTO_FORMAT_CONFIG, 
  calculateContentDensity,
  calculateDynamicIncrement,
  binarySearchOptimalValue,
  optimizeFontSizeWithBinarySearch,
  optimizeLineHeightWithBinarySearch,
  batchedMeasurement
} from './autoFormatOptimized';

/**
 * Hybrid auto-format that combines the existing approach with optimizations
 * This maintains backward compatibility while adding performance improvements
 */
export const getOptimizedOverflowDrivenAutoFormat = (
  currentSettings: PreviewSettings,
  contentData: { 
    shelfCount: number; 
    totalStrains: number; 
    hasContentOverflow: boolean;
    menuMode: 'bulk' | 'prepackaged';
    showTerpenes?: boolean;
    showLowStock?: boolean;
    showNetWeight?: boolean;
  },
  state?: AutoFormatState
): AutoFormatResult => {
  // Calculate content density for smarter increments
  const density = calculateContentDensity(
    contentData.totalStrains,
    currentSettings.columns,
    contentData.shelfCount
  );
  
  // Determine if we're in expansion or reduction mode based on current overflow state
  const mode = state?.mode || (contentData.hasContentOverflow ? 'reduction' : 'expansion');
  const phase = state?.phase || 'font-size';
  
  // Track iteration count for determining when to switch to binary search
  const iterationCount = state ? (state as any).iterationCount || 1 : 1;
  
  // Early exit if no overflow and we're not already optimizing
  if (!contentData.hasContentOverflow && !state) {
    // Try to expand font size to fill available space better
    const increment = calculateDynamicIncrement(density, 'font-size');
    const newSize = Math.min(
      AUTO_FORMAT_CONFIG.fontSizeRange.max,
      currentSettings.baseFontSizePx + increment * 2 // Larger increment for expansion
    );
    
    if (newSize > currentSettings.baseFontSizePx) {
      return {
        success: true,
        settings: { baseFontSizePx: newSize },
        message: `Increased font size to ${newSize}px for better readability`,
        shouldContinue: false, // Don't continue if no overflow
        optimizationPhase: 'complete'
      };
    }
    
    return {
      success: true,
      message: 'Content fits perfectly! No optimization needed.',
      shouldContinue: false,
      optimizationPhase: 'complete'
    };
  }
  
  // Phase 1: Font size optimization - use binary search after 3 iterations for faster convergence
  // Note: We skip column adjustment entirely and go straight to font size
  if (phase === 'font-size') {
    // If we've done more than 3 iterations, switch to binary search for faster convergence
    if (iterationCount > 3) {
      // Create a test function for binary search
      const testOverflow = (settings: PreviewSettings) => {
        // This will be replaced with actual DOM testing in the main app
        // For now, simulate based on font size reduction
        return settings.baseFontSizePx < currentSettings.baseFontSizePx * 0.8;
      };
      
      const binaryResult = optimizeFontSizeWithBinarySearch(
        currentSettings,
        testOverflow,
        contentData.hasContentOverflow
      );
      
      if (binaryResult.success && binaryResult.settings) {
        return {
          ...binaryResult,
          message: `${binaryResult.message} (Binary search after ${iterationCount} iterations)`
        };
      }
    }
    
    // Use incremental approach for first few iterations
    const increment = calculateDynamicIncrement(density, 'font-size');
    const { fontSizeRange } = AUTO_FORMAT_CONFIG;
    
    if (mode === 'reduction') {
      // Need to reduce font size
      const newSize = Math.max(
        fontSizeRange.min,
        currentSettings.baseFontSizePx - increment
      );
      
      if (newSize < currentSettings.baseFontSizePx && newSize >= fontSizeRange.min) {
        return {
          success: true,
          settings: { baseFontSizePx: newSize },
          message: `Reduced font size to ${newSize}px (increment: ${increment}px, iteration: ${iterationCount})`,
          shouldContinue: true,
          optimizationPhase: 'font-size',
          hitFontSizeCeiling: false
        };
      } else {
        // Can't reduce font size further, move to line height
        return {
          success: true,
          message: 'Font size at minimum, trying line height adjustment',
          shouldContinue: true,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: true
        };
      }
    } else {
      // Expansion mode - try to increase font size
      const newSize = Math.min(
        fontSizeRange.max,
        currentSettings.baseFontSizePx + increment
      );
      
      if (newSize > currentSettings.baseFontSizePx && newSize <= fontSizeRange.max) {
        return {
          success: true,
          settings: { baseFontSizePx: newSize },
          message: `Increased font size to ${newSize}px for better readability (iteration: ${iterationCount})`,
          shouldContinue: true,
          optimizationPhase: 'font-size',
          hitFontSizeCeiling: false
        };
      } else {
        // Hit ceiling, move to line height
        return {
          success: true,
          message: 'Font size optimized, checking line height',
          shouldContinue: true,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: true
        };
      }
    }
  }
  
  // Phase 2: Line height optimization with smart increments
  if (phase === 'line-height') {
    const increment = calculateDynamicIncrement(density, 'line-height');
    const { lineHeightRange } = AUTO_FORMAT_CONFIG;
    
    if (mode === 'reduction') {
      // Need to reduce line height
      const newHeight = Math.max(
        lineHeightRange.min,
        currentSettings.linePaddingMultiplier - increment
      );
      
      if (newHeight < currentSettings.linePaddingMultiplier && newHeight >= lineHeightRange.min) {
        return {
          success: true,
          settings: { linePaddingMultiplier: parseFloat(newHeight.toFixed(2)) },
          message: `Reduced line spacing to ${newHeight.toFixed(2)} (smart increment: ${increment})`,
          shouldContinue: true,
          optimizationPhase: 'line-height',
          hitLineHeightCeiling: false
        };
      } else {
        // Can't optimize further
        return {
          success: false,
          message: 'Reached optimization limits. Consider removing some content.',
          shouldContinue: false,
          optimizationPhase: 'complete',
          hitLineHeightCeiling: true
        };
      }
    } else {
      // Expansion mode - try to increase line height
      const newHeight = Math.min(
        lineHeightRange.max,
        currentSettings.linePaddingMultiplier + increment
      );
      
      if (newHeight > currentSettings.linePaddingMultiplier && newHeight <= lineHeightRange.max) {
        return {
          success: true,
          settings: { linePaddingMultiplier: parseFloat(newHeight.toFixed(2)) },
          message: `Increased line spacing to ${newHeight.toFixed(2)} for better readability`,
          shouldContinue: true,
          optimizationPhase: 'line-height',
          hitLineHeightCeiling: false
        };
      } else {
        // Optimization complete
        return {
          success: true,
          message: 'Optimization complete! Your menu is now perfectly formatted.',
          shouldContinue: false,
          optimizationPhase: 'complete',
          hitLineHeightCeiling: true
        };
      }
    }
  }
  
  // Shouldn't reach here, but provide a fallback
  return {
    success: false,
    message: 'Optimization complete',
    shouldContinue: false,
    optimizationPhase: 'complete'
  };
};

/**
 * Quick optimization using binary search for immediate results
 * This is for when we want to find the optimal value in one go
 */
export const quickOptimizeWithBinarySearch = (
  currentSettings: PreviewSettings,
  contentData: { shelfCount: number; totalStrains: number; hasContentOverflow: boolean; menuMode: 'bulk' | 'prepackaged' },
  checkOverflow: (settings: PreviewSettings) => boolean
): PreviewSettings => {
  const optimizedSettings = { ...currentSettings };
  const { fontSizeRange, lineHeightRange } = AUTO_FORMAT_CONFIG;
  
  // First, optimize font size
  const optimalFontSize = binarySearchOptimalValue(
    fontSizeRange.min,
    fontSizeRange.max,
    fontSizeRange.tolerance,
    (size) => !checkOverflow({ ...optimizedSettings, baseFontSizePx: size }),
    true // Find maximum that fits
  );
  
  optimizedSettings.baseFontSizePx = optimalFontSize;
  
  // Then, optimize line height with the optimal font size
  const optimalLineHeight = binarySearchOptimalValue(
    lineHeightRange.min,
    lineHeightRange.max,
    lineHeightRange.tolerance,
    (height) => !checkOverflow({ ...optimizedSettings, linePaddingMultiplier: height }),
    true // Find maximum that fits
  );
  
  optimizedSettings.linePaddingMultiplier = optimalLineHeight;
  
  return optimizedSettings;
};

/**
 * Performance monitoring wrapper
 * Tracks optimization performance for debugging
 */
export const withPerformanceMonitoring = (
  optimizationFn: () => AutoFormatResult
): AutoFormatResult & { performanceMetrics: { duration: number; timestamp: number } } => {
  const startTime = performance.now();
  const result = optimizationFn();
  const endTime = performance.now();
  
  return {
    ...result,
    performanceMetrics: {
      duration: endTime - startTime,
      timestamp: Date.now()
    }
  };
};