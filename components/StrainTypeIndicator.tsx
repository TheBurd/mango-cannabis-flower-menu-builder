
import React from 'react';
import { StrainType } from '../types';
import { STRAIN_TYPE_VISUALS } from '../constants';

interface StrainTypeIndicatorProps {
  type: StrainType;
  baseFontSizePx: number;
}

export const StrainTypeIndicator: React.FC<StrainTypeIndicatorProps> = ({ type, baseFontSizePx }) => {
  const visual = STRAIN_TYPE_VISUALS[type];
  
  const paddingVertical = Math.max(1, Math.round(baseFontSizePx * 0.18)); // Fine-tuned
  const paddingHorizontal = Math.max(3, Math.round(baseFontSizePx * 0.38)); // Fine-tuned
  const acronymFontSize = Math.max(7, Math.round(baseFontSizePx * 0.72)); 
  const minIndicatorWidth = Math.max(10, Math.round(baseFontSizePx * 1.25)); // Adjusted for potentially wider acronyms like SH/IH
  const borderRadius = Math.max(2, Math.round(baseFontSizePx * 0.25));


  const style: React.CSSProperties = {
    background: visual.gradient || visual.primaryColor,
    paddingTop: `${paddingVertical}px`,
    paddingBottom: `${paddingVertical}px`,
    paddingLeft: `${paddingHorizontal}px`,
    paddingRight: `${paddingHorizontal}px`,
    borderRadius: `${borderRadius}px`,
    fontSize: `${acronymFontSize}px`,
    lineHeight: '1', // Critical for consistent vertical centering
    display: 'inline-flex', 
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: `${minIndicatorWidth}px`,
    fontWeight: 500, 
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)', // Softer shadow
    letterSpacing: '0.01em', 
    boxSizing: 'border-box', // Explicit box-sizing
    verticalAlign: 'middle', // Helps align with surrounding text if any
  };

  return (
    <div style={style} className={visual.textColorClass}>
      {visual.acronym}
    </div>
  );
};
