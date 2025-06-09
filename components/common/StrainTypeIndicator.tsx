import React from 'react';
import { StrainType } from '../../types';
import { STRAIN_TYPE_VISUALS } from '../../constants';

interface StrainTypeIndicatorProps {
  type: StrainType;
  baseFontSizePx: number;
}

export const StrainTypeIndicator: React.FC<StrainTypeIndicatorProps> = ({ type, baseFontSizePx }) => {
  const visual = STRAIN_TYPE_VISUALS[type];
  
  const paddingVertical = Math.max(1, Math.round(baseFontSizePx * 0.18)); 
  const paddingHorizontal = Math.max(3, Math.round(baseFontSizePx * 0.38)); 
  const acronymFontSize = Math.max(7, Math.round(baseFontSizePx * 0.72)); 
  const minIndicatorWidth = Math.max(10, Math.round(baseFontSizePx * 1.25)); 
  const borderRadius = Math.max(2, Math.round(baseFontSizePx * 0.25));


  // Calculate automatic height based on text content
  const calculatedHeight = (paddingVertical * 2) + (acronymFontSize * 1.2);

  const style: React.CSSProperties = {
    // Use gradient if available, fallback to primary color for broader compatibility
    background: visual.gradient || visual.primaryColor,
    backgroundColor: visual.primaryColor, // Fallback for browsers that don't support gradients
    paddingTop: `${paddingVertical}px`,
    paddingBottom: `${paddingVertical}px`,
    paddingLeft: `${paddingHorizontal}px`,
    paddingRight: `${paddingHorizontal}px`,
    borderRadius: `${borderRadius}px`,
    fontSize: `${acronymFontSize}px`,
    lineHeight: '1.2',
    display: 'inline-flex', // Use inline-flex for better centering
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: `${minIndicatorWidth}px`,
    height: `${calculatedHeight}px`, // Set calculated height
    fontWeight: 500, 
    letterSpacing: '0.01em', 
    boxSizing: 'border-box', 
    verticalAlign: 'middle',
    transformOrigin: 'center center', // Ensure transform origin is at center
    position: 'relative', // Provide positioning context
  };

  return (
    <div style={style} className={`${visual.textColorClass} strain-type-indicator`}>
      {visual.acronym}
    </div>
  );
};