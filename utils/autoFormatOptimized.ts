import { PreviewSettings } from '../types';
import { AutoFormatResult, AutoFormatState, AutoFormatOptions } from './autoFormat';

// Configuration constants - extracted for maintainability
export const AUTO_FORMAT_CONFIG = {
  fontSizeRange: { 
    min: 8, 
    max: 48, 
    default: 14,
    tolerance: 0.5 // Allow 0.5px precision
  },
  lineHeightRange: { 
    min: 0.1, 
    max: 1.0, 
    default: 0.3,
    tolerance: 0.01 // Allow 0.01 precision
  },
  // Column adjustment removed - respecting user's choice
  densityThresholds: {
    low: 5,        // < 5 items per column
    medium: 15,    // 5-15 items per column  
    high: 25,      // 15-25 items per column
    veryHigh: 35   // > 35 items per column
  },
  performance: {
    maxIterations: 20,
    binarySearchPrecision: 0.5,
    overflowTolerance: 5, // Consider 5px overflow as "close enough"
    measurementCacheTTL: 100, // Cache measurements for 100ms
    debounceDelay: 16 // 60fps frame time
  }
};

// Cache for measurement results to avoid repeated DOM checks
interface MeasurementCache {
  settings: PreviewSettings;
  hasOverflow: boolean;
  timestamp: number;
}

let measurementCache: MeasurementCache | null = null;

/**
 * Calculate content density score for intelligent increment calculation
 */
export const calculateContentDensity = (
  itemCount: number,
  columns: number,
  shelfCount: number
): number => {
  const itemsPerColumn = itemCount / columns;
  const shelfOverhead = shelfCount * 1.5; // Each shelf adds ~1.5 items worth of space
  return (itemsPerColumn + shelfOverhead / columns);
};

/**
 * Calculate dynamic increment based on content density
 * Higher density = smaller increments for finer control
 */
export const calculateDynamicIncrement = (
  density: number,
  type: 'font-size' | 'line-height'
): number => {
  const { densityThresholds } = AUTO_FORMAT_CONFIG;
  
  if (type === 'font-size') {
    if (density < densityThresholds.low) return 4;      // Large increments for sparse content
    if (density < densityThresholds.medium) return 2;   // Medium increments
    if (density < densityThresholds.high) return 1;     // Small increments
    return 0.5;                                          // Fine increments for dense content
  } else {
    // Line height needs finer control
    if (density < densityThresholds.low) return 0.2;
    if (density < densityThresholds.medium) return 0.1;
    if (density < densityThresholds.high) return 0.05;
    return 0.02;
  }
};

/**
 * Binary search optimization for finding optimal value
 * Much faster than linear search - O(log n) vs O(n)
 */
export const binarySearchOptimalValue = (
  min: number,
  max: number,
  tolerance: number,
  testFunction: (value: number) => boolean,
  findMaximum: boolean = true
): number => {
  let low = min;
  let high = max;
  let bestValue = findMaximum ? min : max;
  let iterations = 0;
  const maxIterations = Math.ceil(Math.log2((max - min) / tolerance));
  
  while (low <= high && iterations < maxIterations) {
    const mid = (low + high) / 2;
    const fitsWithMid = testFunction(mid);
    
    if (fitsWithMid) {
      if (findMaximum) {
        // Looking for maximum value that still fits
        bestValue = mid;
        low = mid + tolerance;
      } else {
        // Looking for minimum value that fits
        bestValue = mid;
        high = mid - tolerance;
      }
    } else {
      if (findMaximum) {
        high = mid - tolerance;
      } else {
        low = mid + tolerance;
      }
    }
    
    iterations++;
  }
  
  return Math.round(bestValue / tolerance) * tolerance; // Round to tolerance
};

/**
 * Check if settings would result in overflow with caching
 */
export const checkOverflowWithCache = (
  settings: PreviewSettings,
  measurementFunction: () => boolean
): boolean => {
  const now = Date.now();
  
  // Check if we have a valid cached measurement
  if (measurementCache && 
      JSON.stringify(measurementCache.settings) === JSON.stringify(settings) &&
      now - measurementCache.timestamp < AUTO_FORMAT_CONFIG.performance.measurementCacheTTL) {
    return measurementCache.hasOverflow;
  }
  
  // Perform actual measurement and cache result
  const hasOverflow = measurementFunction();
  measurementCache = {
    settings,
    hasOverflow,
    timestamp: now
  };
  
  return hasOverflow;
};

/**
 * Smart overflow detection with tolerance
 * Considers small overflows as acceptable to avoid over-optimization
 */
export const isOverflowSignificant = (
  scrollHeight: number,
  clientHeight: number,
  tolerance: number = AUTO_FORMAT_CONFIG.performance.overflowTolerance
): boolean => {
  return scrollHeight > clientHeight + tolerance;
};

/**
 * Optimized font size adjustment using binary search
 */
export const optimizeFontSizeWithBinarySearch = (
  currentSettings: PreviewSettings,
  testOverflow: (settings: PreviewSettings) => boolean,
  hasCurrentOverflow: boolean
): AutoFormatResult => {
  const { fontSizeRange } = AUTO_FORMAT_CONFIG;
  
  if (hasCurrentOverflow) {
    // Need to reduce font size - find maximum that fits
    const optimalSize = binarySearchOptimalValue(
      fontSizeRange.min,
      currentSettings.baseFontSizePx,
      fontSizeRange.tolerance,
      (size) => !testOverflow({ ...currentSettings, baseFontSizePx: size }),
      true
    );
    
    if (optimalSize < currentSettings.baseFontSizePx) {
      return {
        success: true,
        settings: { baseFontSizePx: optimalSize },
        message: `Optimized font size to ${optimalSize}px using binary search`,
        shouldContinue: false,
        optimizationPhase: 'font-size'
      };
    }
  } else {
    // Can potentially increase font size - find maximum that still fits
    const optimalSize = binarySearchOptimalValue(
      currentSettings.baseFontSizePx,
      fontSizeRange.max,
      fontSizeRange.tolerance,
      (size) => !testOverflow({ ...currentSettings, baseFontSizePx: size }),
      true
    );
    
    if (optimalSize > currentSettings.baseFontSizePx) {
      return {
        success: true,
        settings: { baseFontSizePx: optimalSize },
        message: `Increased font size to ${optimalSize}px for better readability`,
        shouldContinue: false,
        optimizationPhase: 'font-size'
      };
    }
  }
  
  return {
    success: false,
    message: 'Font size is already optimal',
    shouldContinue: true,
    optimizationPhase: 'line-height'
  };
};

/**
 * Optimized line height adjustment using binary search
 */
export const optimizeLineHeightWithBinarySearch = (
  currentSettings: PreviewSettings,
  testOverflow: (settings: PreviewSettings) => boolean,
  hasCurrentOverflow: boolean
): AutoFormatResult => {
  const { lineHeightRange } = AUTO_FORMAT_CONFIG;
  
  if (hasCurrentOverflow) {
    // Need to reduce line height - find minimum that fits
    const optimalHeight = binarySearchOptimalValue(
      lineHeightRange.min,
      currentSettings.linePaddingMultiplier,
      lineHeightRange.tolerance,
      (height) => !testOverflow({ ...currentSettings, linePaddingMultiplier: height }),
      true
    );
    
    if (optimalHeight < currentSettings.linePaddingMultiplier) {
      return {
        success: true,
        settings: { linePaddingMultiplier: optimalHeight },
        message: `Optimized line spacing to ${optimalHeight.toFixed(2)} using binary search`,
        shouldContinue: false,
        optimizationPhase: 'line-height'
      };
    }
  } else {
    // Can potentially increase line height - find maximum that still fits
    const optimalHeight = binarySearchOptimalValue(
      currentSettings.linePaddingMultiplier,
      lineHeightRange.max,
      lineHeightRange.tolerance,
      (height) => !testOverflow({ ...currentSettings, linePaddingMultiplier: height }),
      true
    );
    
    if (optimalHeight > currentSettings.linePaddingMultiplier) {
      return {
        success: true,
        settings: { linePaddingMultiplier: optimalHeight },
        message: `Increased line spacing to ${optimalHeight.toFixed(2)} for better readability`,
        shouldContinue: false,
        optimizationPhase: 'line-height'
      };
    }
  }
  
  return {
    success: false,
    message: 'Line height is already optimal',
    shouldContinue: false,
    optimizationPhase: 'complete'
  };
};

/**
 * Main optimized auto-format entry point
 * Uses binary search and smart caching for much faster optimization
 */
export const autoFormatOptimized = (
  currentSettings: PreviewSettings,
  contentData: { shelfCount: number; totalItems: number; menuMode: 'bulk' | 'prepackaged' },
  testOverflow: (settings: PreviewSettings) => boolean,
  hasCurrentOverflow: boolean,
  state?: AutoFormatState
): AutoFormatResult => {
  // Early exit if no overflow and not in expansion mode
  if (!hasCurrentOverflow && (!state || state.mode !== 'expansion')) {
    return {
      success: true,
      message: 'Content fits perfectly! No optimization needed.',
      shouldContinue: false,
      optimizationPhase: 'complete'
    };
  }
  
  // Calculate content density for intelligent optimization
  const density = calculateContentDensity(
    contentData.totalItems,
    currentSettings.columns,
    contentData.shelfCount
  );
  
  // Phase 1: Font size optimization with binary search
  // Note: We respect user's column choice and only adjust font size and line height
  if (!state || state.phase === 'font-size') {
    const fontResult = optimizeFontSizeWithBinarySearch(
      currentSettings,
      testOverflow,
      hasCurrentOverflow
    );
    
    if (fontResult.success && fontResult.settings) {
      return fontResult;
    }
    
    // Move to line height if font size is optimal
    if (fontResult.shouldContinue) {
      return {
        ...fontResult,
        shouldContinue: true,
        optimizationPhase: 'line-height'
      };
    }
  }
  
  // Phase 2: Line height optimization with binary search
  if (!state || state.phase === 'line-height') {
    const lineResult = optimizeLineHeightWithBinarySearch(
      currentSettings,
      testOverflow,
      hasCurrentOverflow
    );
    
    return lineResult;
  }
  
  return {
    success: false,
    message: 'Optimization complete',
    shouldContinue: false,
    optimizationPhase: 'complete'
  };
};

/**
 * Request Animation Frame wrapper for batched DOM measurements
 * Prevents layout thrashing by batching multiple measurements
 */
export const batchedMeasurement = (() => {
  let pendingMeasurements: Array<() => void> = [];
  let rafId: number | null = null;
  
  const processMeasurements = () => {
    const measurements = [...pendingMeasurements];
    pendingMeasurements = [];
    rafId = null;
    
    measurements.forEach(measure => measure());
  };
  
  return (measurementFn: () => void) => {
    pendingMeasurements.push(measurementFn);
    
    if (!rafId) {
      rafId = requestAnimationFrame(processMeasurements);
    }
  };
})();

/**
 * Clear the measurement cache
 * Should be called when content changes
 */
export const clearMeasurementCache = () => {
  measurementCache = null;
};