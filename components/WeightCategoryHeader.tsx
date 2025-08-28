import React, { useMemo } from 'react';
import { PrePackagedWeight } from '../types';

interface WeightCategoryHeaderProps {
  weight: PrePackagedWeight;
  productCount: number;
  baseFontSizePx: number;
  showProductCount?: boolean;
  marginBottomStyle?: string;
}

const getWeightDisplayInfo = (weight: PrePackagedWeight) => {
  switch (weight) {
    case PrePackagedWeight.EIGHTH:
      return {
        title: '3.5g Eighths',
        subtitle: 'Premium flower eighths',
        color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        textColor: 'text-white'
      };
    case PrePackagedWeight.QUARTER:
      return {
        title: '7g Quarters',
        subtitle: 'Quarter ounce packages',
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-white'
      };
    case PrePackagedWeight.HALF:
      return {
        title: '14g Half Ounces',
        subtitle: 'Half ounce packages',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textColor: 'text-white'
      };
    case PrePackagedWeight.OUNCE:
      return {
        title: '28g Ounces',
        subtitle: 'Full ounce packages',
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        textColor: 'text-white'
      };
    default:
      return {
        title: 'Mixed Weights',
        subtitle: 'Various sizes',
        color: 'bg-gray-500',
        textColor: 'text-white'
      };
  }
};

export const WeightCategoryHeader: React.FC<WeightCategoryHeaderProps> = ({
  weight,
  productCount,
  baseFontSizePx,
  showProductCount = true,
  marginBottomStyle = '16px'
}) => {
  const displayInfo = getWeightDisplayInfo(weight);

  const headerStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 2}px`,
    fontWeight: 'bold',
    textAlign: 'center' as const,
    padding: `${baseFontSizePx * 0.8}px ${baseFontSizePx * 1.2}px`,
    marginBottom: marginBottomStyle,
    borderRadius: '8px',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    position: 'relative',
    overflow: 'hidden',
  }), [baseFontSizePx, marginBottomStyle]);

  const subtitleStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 0.9}px`,
    fontWeight: 'normal',
    opacity: 0.9,
    marginTop: `${baseFontSizePx * 0.2}px`,
  }), [baseFontSizePx]);

  const countBadgeStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    top: `${baseFontSizePx * 0.4}px`,
    right: `${baseFontSizePx * 0.8}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: `${baseFontSizePx * 0.2}px ${baseFontSizePx * 0.4}px`,
    fontSize: `${baseFontSizePx * 0.7}px`,
    fontWeight: 'bold',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  }), [baseFontSizePx]);

  if (productCount === 0) {
    return null;
  }

  return (
    <div 
      className={displayInfo.color}
      style={headerStyle}
    >
      <div>{displayInfo.title}</div>
      <div style={subtitleStyle}>{displayInfo.subtitle}</div>
      {showProductCount && (
        <div style={countBadgeStyle}>
          {productCount} {productCount === 1 ? 'item' : 'items'}
        </div>
      )}
      
      {/* Decorative corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderTop: `${baseFontSizePx * 1.5}px solid rgba(255, 255, 255, 0.1)`,
          borderRight: `${baseFontSizePx * 1.5}px solid transparent`,
        }}
      />
    </div>
  );
};