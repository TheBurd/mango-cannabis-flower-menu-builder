import { PreviewSettings } from '../types';

export interface AutoFormatResult {
  success: boolean;
  settings?: Partial<PreviewSettings>;
  message: string;
  shouldContinue?: boolean; // Flag to indicate if optimization should continue
  optimizationPhase?: 'columns' | 'font-size' | 'line-height' | 'complete';
  hitFontSizeCeiling?: boolean; // Return if we hit the font size ceiling
  hitLineHeightCeiling?: boolean; // Return if we hit the line height ceiling
}

export interface AutoFormatState {
  phase: 'font-size' | 'line-height' | 'complete';
  mode: 'expansion' | 'reduction'; // Track whether we're expanding or reducing sizes
  lastWorkingFontSize?: number;
  lastWorkingLineHeight?: number;
  isOptimizing: boolean;
  hitFontSizeCeiling?: boolean; // Track if we've hit overflow during font size increases
  hitLineHeightCeiling?: boolean; // Track if we've hit overflow during line height increases
}

export interface AutoFormatOptions {
  currentSettings: PreviewSettings;
  hasOverflow: boolean;
  maxIterations?: number;
}

/**
 * Auto-format menu by trying different combinations of settings
 * Priority order: columns -> shelf splitting -> font size -> line height
 */
export const autoFormatMenu = (options: AutoFormatOptions): AutoFormatResult => {
  const { currentSettings, hasOverflow, maxIterations = 50 } = options;
  
  // If no overflow, no need to auto-format
  if (!hasOverflow) {
    return {
      success: true,
      message: 'Menu already fits perfectly! No adjustments needed.'
    };
  }

  let bestSettings = { ...currentSettings };
  let iterations = 0;
  
  // Define ranges for each setting
  const columnRange = [1, 2, 3, 4, 5, 6] as const;
  const shelfSplitOptions = [false, true]; // false = allow splitting, true = force fit
  const fontSizeRange = { min: 8, max: 48, step: 0.5 };
  const lineHeightRange = { min: 0.1, max: 1.0, step: 0.05 };
  
  // Priority 1: Try increasing columns
  for (const columns of columnRange) {
    if (columns <= currentSettings.columns) continue; // Only try higher column counts
    
    const testSettings = { ...bestSettings, columns };
    
    // We can't test overflow here without actually rendering, so we'll return the first logical improvement
    // The calling code will need to test and iterate if needed
    return {
      success: true,
      settings: testSettings,
      message: `Increased columns to ${columns} to better distribute content.`
    };
  }
  
  // Priority 2: Try enabling shelf splitting if not already enabled
  if (currentSettings.forceShelfFit) {
    return {
      success: true,
      settings: { ...bestSettings, forceShelfFit: false },
      message: 'Enabled shelf splitting to allow content to flow across columns.'
    };
  }
  
  // Priority 3: Try reducing font size
  const minFontSize = Math.max(fontSizeRange.min, currentSettings.baseFontSizePx - 8);
  if (currentSettings.baseFontSizePx > minFontSize) {
    const newFontSize = Math.max(minFontSize, currentSettings.baseFontSizePx - 1);
    return {
      success: true,
      settings: { ...bestSettings, baseFontSizePx: newFontSize },
      message: `Reduced font size to ${newFontSize}px to fit more content.`
    };
  }
  
  // Priority 4: Try reducing line height
  const minLineHeight = Math.max(lineHeightRange.min, currentSettings.linePaddingMultiplier - 0.1);
  if (currentSettings.linePaddingMultiplier > minLineHeight) {
    const newLineHeight = Math.max(minLineHeight, currentSettings.linePaddingMultiplier - 0.05);
    return {
      success: true,
      settings: { ...bestSettings, linePaddingMultiplier: parseFloat(newLineHeight.toFixed(2)) },
      message: `Reduced line spacing to ${newLineHeight.toFixed(2)} to fit more content.`
    };
  }
  
  // If we've exhausted all options
  return {
    success: false,
    message: 'Unable to auto-fit content. Try removing some strains or manually adjusting settings.'
  };
};

/**
 * Generate the next logical auto-format adjustment
 * This is a simplified version that makes one adjustment at a time
 */
export const getNextAutoFormatAdjustment = (currentSettings: PreviewSettings): AutoFormatResult => {
  // Step 1: Try increasing columns (if not at max)
  if (currentSettings.columns < 6) {
    return {
      success: true,
      settings: { columns: (currentSettings.columns + 1) as PreviewSettings['columns'] },
      message: `Increased columns to ${currentSettings.columns + 1} to better distribute content.`
    };
  }
  
  // Step 2: Try enabling shelf splitting
  if (currentSettings.forceShelfFit) {
    return {
      success: true,
      settings: { forceShelfFit: false },
      message: 'Enabled shelf splitting to allow content to flow across columns.'
    };
  }
  
  // Step 3: Try reducing font size
  if (currentSettings.baseFontSizePx > 8) {
    const newFontSize = Math.max(8, currentSettings.baseFontSizePx - 1);
    return {
      success: true,
      settings: { baseFontSizePx: newFontSize },
      message: `Reduced font size to ${newFontSize}px to fit more content.`
    };
  }
  
  // Step 4: Try reducing line height
  if (currentSettings.linePaddingMultiplier > 0.1) {
    const newLineHeight = Math.max(0.1, currentSettings.linePaddingMultiplier - 0.05);
    return {
      success: true,
      settings: { linePaddingMultiplier: parseFloat(newLineHeight.toFixed(2)) },
      message: `Reduced line spacing to ${newLineHeight.toFixed(2)} to fit more content.`
    };
  }
  
  return {
    success: false,
    message: 'Unable to auto-fit content. Try removing some strains or manually adjusting settings.'
  };
};

/**
 * Smart auto-format that makes incremental adjustments based on content density
 * This provides a more intelligent approach that considers space utilization
 */
export const getSmartAutoFormat = (currentSettings: PreviewSettings): AutoFormatResult => {
  const optimizedSettings: Partial<PreviewSettings> = {};
  const changes: string[] = [];
  
  // Step 1: Increase columns incrementally (better space utilization)
  if (currentSettings.columns < 3) {
    // For single column, try 2 first
    optimizedSettings.columns = 2;
    changes.push(`increased columns to 2`);
  } else if (currentSettings.columns < 4) {
    // For 2-3 columns, try 4
    optimizedSettings.columns = 4;
    changes.push(`increased columns to 4`);
  } else if (currentSettings.columns < 6) {
    // For 4-5 columns, try 6
    optimizedSettings.columns = 6;
    changes.push(`increased columns to 6`);
  }
  
  // Step 2: Enable shelf splitting if not already enabled (better flow)
  if (currentSettings.forceShelfFit) {
    optimizedSettings.forceShelfFit = false;
    changes.push('enabled shelf splitting');
  }
  
  // Step 3: Slightly reduce font size if it's on the larger side
  if (currentSettings.baseFontSizePx > 10) {
    optimizedSettings.baseFontSizePx = Math.max(9, currentSettings.baseFontSizePx - 1);
    changes.push(`reduced font size to ${optimizedSettings.baseFontSizePx}px`);
  }
  
  // Step 4: Slightly reduce line height if it's spacious
  if (currentSettings.linePaddingMultiplier > 0.25) {
    optimizedSettings.linePaddingMultiplier = parseFloat(Math.max(0.2, currentSettings.linePaddingMultiplier - 0.05).toFixed(2));
    changes.push(`reduced line spacing to ${optimizedSettings.linePaddingMultiplier.toFixed(2)}`);
  }
  
  if (changes.length === 0) {
    return {
      success: false,
      message: 'Menu layout is already optimized. Try manually adjusting settings or removing content.'
    };
  }
  
  return {
    success: true,
    settings: optimizedSettings,
    message: `Smart auto-format: ${changes.join(', ')}.`
  };
};

/**
 * Iterative auto-format that uses overflow detection feedback to find optimal settings
 * This tests incremental changes and uses real overflow detection as feedback
 * Only optimizes font size and line height for the current column layout
 */
export const getIterativeAutoFormat = (
  currentSettings: PreviewSettings, 
  contentData?: { shelfCount: number; totalStrains: number; hasContentOverflow: boolean },
  state?: AutoFormatState
): AutoFormatResult => {
  if (!contentData) {
    return getSmartAutoFormat(currentSettings);
  }
  
  const { shelfCount, totalStrains, hasContentOverflow } = contentData;
  
  // Initialize optimization state if not provided
  const optimizationState = state || {
    phase: 'font-size',
    mode: 'expansion',
    isOptimizing: true,
    hitFontSizeCeiling: false,
    hitLineHeightCeiling: false
  };
  
  // REVERSE FLOW: If we start with overflow, switch to reduction mode
  if (!state && hasContentOverflow) {
    return getOverflowReductionFormat(currentSettings, contentData);
  }
  
  const optimizedSettings: Partial<PreviewSettings> = {};
  let message = '';
  let shouldContinue = false;
  
  // Phase 1: Optimize font size with aggressive increments when there's lots of space
  if (optimizationState.phase === 'font-size') {
    const maxFontSize = 48; // Match slider maximum
    const minFontSize = 8;
    
    if (hasContentOverflow) {
      // We hit overflow! This means we've found the ceiling
      if (!optimizationState.hitFontSizeCeiling && !state?.hitFontSizeCeiling) {
        // First time hitting overflow during increases - back off and move to line height
        
        // Calculate what the last increment was and back off
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let lastIncrement = 0.5;
        if (contentDensityScore < 5) {
          lastIncrement = 4;
        } else if (contentDensityScore < 10) {
          lastIncrement = 2;
        } else if (contentDensityScore < 15) {
          lastIncrement = 1;
        } else if (contentDensityScore < 20) {
          lastIncrement = 0.5;
        }
        
        // Back off to the last working font size
        const safeFont = Math.max(minFontSize, currentSettings.baseFontSizePx - lastIncrement);
        optimizedSettings.baseFontSizePx = parseFloat(safeFont.toFixed(1));
        message = `Found optimal font size: ${optimizedSettings.baseFontSizePx}px (backing off from overflow)`;
        shouldContinue = true;
        
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: true
        };
      } else {
        // We've already hit the ceiling - immediately move to line height phase
        return {
          success: true,
          settings: {},
          message: `Font size already optimized at ${currentSettings.baseFontSizePx}px, moving to line spacing...`,
          shouldContinue: true,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: true
        };
      }
    } else {
      // No overflow - continue increasing if we haven't hit the ceiling
      if (!(optimizationState.hitFontSizeCeiling || state?.hitFontSizeCeiling) && currentSettings.baseFontSizePx < maxFontSize) {
        // Calculate increment based on content density using CURRENT column count
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let increment = 0.5;
        if (contentDensityScore < 5) {
          increment = 4;
        } else if (contentDensityScore < 10) {
          increment = 2;
        } else if (contentDensityScore < 15) {
          increment = 1;
        } else if (contentDensityScore < 20) {
          increment = 0.5;
        }
        
        const newFontSize = Math.min(maxFontSize, currentSettings.baseFontSizePx + increment);
        optimizedSettings.baseFontSizePx = parseFloat(newFontSize.toFixed(1));
        message = `Increasing font size to ${optimizedSettings.baseFontSizePx}px (testing fit...)`;
        shouldContinue = true;
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue,
          optimizationPhase: 'font-size',
          hitFontSizeCeiling: state?.hitFontSizeCeiling || false
        };
      } else {
        // Hit maximum font size or ceiling, move to line height optimization
        message = `Font size optimized at ${currentSettings.baseFontSizePx}px, now optimizing line spacing...`;
        shouldContinue = true;
        return {
          success: true,
          settings: {},
          message,
          shouldContinue,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: state?.hitFontSizeCeiling || false
        };
      }
    }
  }
  
  // Phase 2: Optimize line height with aggressive increments when there's space
  if (optimizationState.phase === 'line-height') {
    const maxSpacing = 1.0; // Match slider maximum
    const minSpacing = 0.1;
    
    if (hasContentOverflow) {
      // We hit overflow during line height increases!
      if (!optimizationState.hitLineHeightCeiling && !state?.hitLineHeightCeiling) {
        // First time hitting overflow - back off and complete optimization
        
        // Calculate what the last increment was and back off
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let lastIncrement = 0.05;
        if (contentDensityScore < 8) {
          lastIncrement = 0.2;
        } else if (contentDensityScore < 15) {
          lastIncrement = 0.1;
        } else if (contentDensityScore < 25) {
          lastIncrement = 0.05;
        }
        
        // Back off to the last working line height
        const safeSpacing = Math.max(minSpacing, currentSettings.linePaddingMultiplier - lastIncrement);
        optimizedSettings.linePaddingMultiplier = parseFloat(safeSpacing.toFixed(2));
        message = `Optimization complete! Found optimal spacing: ${optimizedSettings.linePaddingMultiplier.toFixed(2)} for ${currentSettings.columns} columns.`;
        
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue: false,
          optimizationPhase: 'complete',
          hitLineHeightCeiling: true
        };
      } else {
        // Already backed off - complete optimization
        return {
          success: true,
          message: `Auto-format complete! Optimized for ${currentSettings.columns} columns.`,
          optimizationPhase: 'complete',
          hitLineHeightCeiling: true
        };
      }
    } else {
      // No overflow - continue increasing if we haven't hit the ceiling
      if (!(optimizationState.hitLineHeightCeiling || state?.hitLineHeightCeiling) && currentSettings.linePaddingMultiplier < maxSpacing) {
        // Calculate increment based on content density using CURRENT column count
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let increment = 0.05;
        if (contentDensityScore < 8) {
          increment = 0.2;
        } else if (contentDensityScore < 15) {
          increment = 0.1;
        } else if (contentDensityScore < 25) {
          increment = 0.05;
        }
        
        const newSpacing = Math.min(maxSpacing, currentSettings.linePaddingMultiplier + increment);
        optimizedSettings.linePaddingMultiplier = parseFloat(newSpacing.toFixed(2));
        message = `Increasing line spacing to ${optimizedSettings.linePaddingMultiplier.toFixed(2)} (testing fit...)`;
        shouldContinue = true;
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue,
          optimizationPhase: 'line-height',
          hitLineHeightCeiling: false
        };
      } else {
        // Hit maximum spacing or ceiling - optimization complete
        return {
          success: true,
          message: `Auto-format complete! Maximum readability achieved for ${currentSettings.columns} columns.`,
          optimizationPhase: 'complete',
          hitLineHeightCeiling: state?.hitLineHeightCeiling || false
        };
      }
    }
  }
  
  // Fallback - optimization complete
  return {
    success: true,
    message: `Optimization complete for ${currentSettings.columns} columns.`,
    optimizationPhase: 'complete',
    hitFontSizeCeiling: false,
    hitLineHeightCeiling: false
  };
};

/**
 * Overflow reduction format - used when Auto-Format is clicked while content is already overflowing
 * This reduces line height first (less impact), then font size (bigger impact) until overflow is resolved
 */
export const getOverflowReductionFormat = (
  currentSettings: PreviewSettings, 
  contentData: { shelfCount: number; totalStrains: number; hasContentOverflow: boolean },
  state?: AutoFormatState
): AutoFormatResult => {
  const { shelfCount, totalStrains, hasContentOverflow } = contentData;
  
  // Initialize reduction state if not provided - start with line height (less impactful)
  const reductionState = state || {
    phase: 'line-height',
    mode: 'reduction',
    isOptimizing: true,
    hitFontSizeCeiling: false,
    hitLineHeightCeiling: false
  };
  
  const optimizedSettings: Partial<PreviewSettings> = {};
  let message = '';
  let shouldContinue = false;
  
  // Phase 1: Reduce line height first (less impact on readability)
  if (reductionState.phase === 'line-height') {
    const minSpacing = 0.1; // Match slider minimum
    
    if (hasContentOverflow) {
      // Still overflowing - continue reducing line height
      if (currentSettings.linePaddingMultiplier > minSpacing) {
        // Calculate reduction based on content density
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let reduction = 0.05;
        if (contentDensityScore > 30) {
          reduction = 0.15; // Dense content - larger reductions
        } else if (contentDensityScore > 20) {
          reduction = 0.1;
        } else if (contentDensityScore > 15) {
          reduction = 0.05;
        }
        
        const newSpacing = Math.max(minSpacing, currentSettings.linePaddingMultiplier - reduction);
        optimizedSettings.linePaddingMultiplier = parseFloat(newSpacing.toFixed(2));
        message = `Reducing line spacing to ${optimizedSettings.linePaddingMultiplier.toFixed(2)} to eliminate overflow...`;
        shouldContinue = true;
        
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue,
          optimizationPhase: 'line-height',
          hitFontSizeCeiling: false,
          hitLineHeightCeiling: false
        };
      } else {
        // Hit minimum line height, move to font size reduction
        return {
          success: true,
          settings: {},
          message: `Line spacing at minimum (${minSpacing.toFixed(1)}), now reducing font size...`,
          shouldContinue: true,
          optimizationPhase: 'font-size',
          hitFontSizeCeiling: false,
          hitLineHeightCeiling: true
        };
      }
    } else {
      // Overflow resolved! Complete optimization
      return {
        success: true,
        message: `Overflow eliminated! Line spacing optimized at ${currentSettings.linePaddingMultiplier.toFixed(2)} for ${currentSettings.columns} columns.`,
        optimizationPhase: 'complete',
        hitFontSizeCeiling: false,
        hitLineHeightCeiling: false
      };
    }
  }
  
  // Phase 2: Reduce font size (bigger impact on readability)
  if (reductionState.phase === 'font-size') {
    const minFontSize = 8; // Match slider minimum
    
    if (hasContentOverflow) {
      // Still overflowing - continue reducing font size
      if (currentSettings.baseFontSizePx > minFontSize) {
        // Calculate reduction based on content density
        const currentColumns = currentSettings.columns;
        const contentDensityScore = totalStrains / currentColumns;
        
        let reduction = 0.5;
        if (contentDensityScore > 30) {
          reduction = 2; // Dense content - larger reductions
        } else if (contentDensityScore > 20) {
          reduction = 1;
        } else if (contentDensityScore > 15) {
          reduction = 0.5;
        }
        
        const newFontSize = Math.max(minFontSize, currentSettings.baseFontSizePx - reduction);
        optimizedSettings.baseFontSizePx = parseFloat(newFontSize.toFixed(1));
        message = `Reducing font size to ${optimizedSettings.baseFontSizePx}px to eliminate overflow...`;
        shouldContinue = true;
        
        return {
          success: true,
          settings: optimizedSettings,
          message,
          shouldContinue,
          optimizationPhase: 'font-size',
          hitFontSizeCeiling: false,
          hitLineHeightCeiling: true
        };
      } else {
        // Hit minimum font size - cannot reduce further
        return {
          success: false,
          message: `Cannot eliminate overflow: Font size and line spacing at minimum. Try increasing columns or reducing content.`,
          optimizationPhase: 'complete',
          hitFontSizeCeiling: true,
          hitLineHeightCeiling: true
        };
      }
    } else {
      // Overflow resolved! Complete optimization
      return {
        success: true,
        message: `Overflow eliminated! Font size optimized at ${currentSettings.baseFontSizePx}px for ${currentSettings.columns} columns.`,
        optimizationPhase: 'complete',
        hitFontSizeCeiling: false,
        hitLineHeightCeiling: true
      };
    }
  }
  
  // Fallback - should not reach here in normal operation
  return {
    success: false,
    message: `Unable to eliminate overflow with current settings. Try increasing columns or reducing content.`,
    optimizationPhase: 'complete',
    hitFontSizeCeiling: true,
    hitLineHeightCeiling: true
  };
};

/**
 * Overflow-driven auto-format that uses actual overflow detection as feedback
 * This finds the optimal settings by making incremental adjustments based on overflow
 */
export const getOverflowDrivenAutoFormat = (
  currentSettings: PreviewSettings, 
  contentData?: { shelfCount: number; totalStrains: number; hasContentOverflow: boolean },
  state?: AutoFormatState
): AutoFormatResult => {
  if (!contentData) {
    return getSmartAutoFormat(currentSettings);
  }
  
  // If we have state, we're in the middle of an optimization process
  if (state) {
    // Continue with the same mode we were in
    if (state.mode === 'reduction') {
      return getOverflowReductionFormat(currentSettings, contentData, state);
    } else {
      return getIterativeAutoFormat(currentSettings, contentData, state);
    }
  }
  
  // No state provided - determine initial mode based on overflow
  if (contentData.hasContentOverflow) {
    // Start with reduction mode
    return getOverflowReductionFormat(currentSettings, contentData);
  } else {
    // Start with expansion mode
    return getIterativeAutoFormat(currentSettings, contentData, state);
  }
};

/**
 * Get comprehensive auto-format settings that make multiple adjustments at once
 * This provides a more aggressive approach for heavily overflowing content
 */
export const getComprehensiveAutoFormat = (currentSettings: PreviewSettings): AutoFormatResult => {
  const optimizedSettings: Partial<PreviewSettings> = {};
  const changes: string[] = [];
  
  // Always try to maximize columns first
  if (currentSettings.columns < 6) {
    optimizedSettings.columns = 6;
    changes.push(`increased columns to 6`);
  }
  
  // Always enable shelf splitting for better flow
  if (currentSettings.forceShelfFit) {
    optimizedSettings.forceShelfFit = false;
    changes.push('enabled shelf splitting');
  }
  
  // Reduce font size if it's large
  if (currentSettings.baseFontSizePx > 9) {
    optimizedSettings.baseFontSizePx = Math.max(8, currentSettings.baseFontSizePx - 2);
    changes.push(`reduced font size to ${optimizedSettings.baseFontSizePx}px`);
  }
  
  // Reduce line height if it's high
  if (currentSettings.linePaddingMultiplier > 0.2) {
    optimizedSettings.linePaddingMultiplier = parseFloat(Math.max(0.1, currentSettings.linePaddingMultiplier - 0.1).toFixed(2));
    changes.push(`reduced line spacing to ${optimizedSettings.linePaddingMultiplier.toFixed(2)}`);
  }
  
  if (changes.length === 0) {
    return {
      success: false,
      message: 'Menu is already optimized or requires manual adjustment.'
    };
  }
  
  return {
    success: true,
    settings: optimizedSettings,
    message: `Auto-formatted menu: ${changes.join(', ')}.`
  };
}; 