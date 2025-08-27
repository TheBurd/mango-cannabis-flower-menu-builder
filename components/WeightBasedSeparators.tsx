import React, { useMemo } from 'react';
import { PrePackagedWeight } from '../types';

interface WeightSeparatorProps {
  baseFontSizePx: number;
  type?: 'weight-change' | 'price-tier' | 'brand-group' | 'section-break';
  thickness?: 'thin' | 'medium' | 'thick';
  style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  color?: string;
  marginTop?: number;
  marginBottom?: number;
}

export const WeightSeparator: React.FC<WeightSeparatorProps> = ({
  baseFontSizePx,
  type = 'section-break',
  thickness = 'medium',
  style = 'solid',
  color,
  marginTop,
  marginBottom
}) => {
  const separatorStyle: React.CSSProperties = useMemo(() => {
    const getThickness = () => {
      switch (thickness) {
        case 'thin': return '1px';
        case 'medium': return '2px';
        case 'thick': return '4px';
        default: return '2px';
      }
    };

    const getColor = () => {
      if (color) return color;
      
      switch (type) {
        case 'weight-change': return '#6B7280'; // gray-500
        case 'price-tier': return '#D1D5DB'; // gray-300
        case 'brand-group': return '#E5E7EB'; // gray-200
        case 'section-break': return '#9CA3AF'; // gray-400
        default: return '#E5E7EB';
      }
    };

    const getMarginTop = () => {
      if (marginTop !== undefined) return `${marginTop}px`;
      return `${baseFontSizePx * (type === 'weight-change' ? 1.5 : 0.8)}px`;
    };

    const getMarginBottom = () => {
      if (marginBottom !== undefined) return `${marginBottom}px`;
      return `${baseFontSizePx * (type === 'weight-change' ? 1.2 : 0.6)}px`;
    };

    const baseStyle = {
      width: '100%',
      height: getThickness(),
      marginTop: getMarginTop(),
      marginBottom: getMarginBottom(),
      border: 'none',
    };

    if (style === 'gradient') {
      return {
        ...baseStyle,
        background: `linear-gradient(to right, transparent, ${getColor()}, transparent)`,
      };
    }

    return {
      ...baseStyle,
      borderTop: `${getThickness()} ${style} ${getColor()}`,
      backgroundColor: 'transparent',
    };
  }, [baseFontSizePx, type, thickness, style, color, marginTop, marginBottom]);

  return <hr style={separatorStyle} />;
};

interface WeightSpacingProps {
  baseFontSizePx: number;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'vertical' | 'horizontal';
}

export const WeightSpacing: React.FC<WeightSpacingProps> = ({
  baseFontSizePx,
  size,
  type = 'vertical'
}) => {
  const spacingStyle: React.CSSProperties = useMemo(() => {
    const getSize = () => {
      switch (size) {
        case 'xs': return baseFontSizePx * 0.25;
        case 'sm': return baseFontSizePx * 0.5;
        case 'md': return baseFontSizePx * 1;
        case 'lg': return baseFontSizePx * 1.5;
        case 'xl': return baseFontSizePx * 2;
        default: return baseFontSizePx * 1;
      }
    };

    if (type === 'horizontal') {
      return {
        display: 'inline-block',
        width: `${getSize()}px`,
        height: '1px',
      };
    }

    return {
      width: '100%',
      height: `${getSize()}px`,
    };
  }, [baseFontSizePx, size, type]);

  return <div style={spacingStyle} />;
};

interface WeightCategoryDividerProps {
  fromWeight?: PrePackagedWeight;
  toWeight?: PrePackagedWeight;
  baseFontSizePx: number;
  showWeightLabels?: boolean;
}

export const WeightCategoryDivider: React.FC<WeightCategoryDividerProps> = ({
  fromWeight,
  toWeight,
  baseFontSizePx,
  showWeightLabels = false
}) => {
  const dividerStyle: React.CSSProperties = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    margin: `${baseFontSizePx * 1.5}px 0`,
    position: 'relative',
  }), [baseFontSizePx]);

  const lineStyle: React.CSSProperties = useMemo(() => ({
    flex: 1,
    height: '2px',
    background: 'linear-gradient(to right, #E5E7EB, #9CA3AF, #E5E7EB)',
  }), []);

  const labelStyle: React.CSSProperties = useMemo(() => ({
    padding: `0 ${baseFontSizePx * 0.8}px`,
    fontSize: `${baseFontSizePx * 0.9}px`,
    fontWeight: 'bold',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    whiteSpace: 'nowrap' as const,
  }), [baseFontSizePx]);

  if (!showWeightLabels || (!fromWeight && !toWeight)) {
    return <WeightSeparator baseFontSizePx={baseFontSizePx} type="weight-change" style="gradient" />;
  }

  return (
    <div style={dividerStyle}>
      <div style={lineStyle} />
      {(fromWeight || toWeight) && (
        <div style={labelStyle}>
          {fromWeight && toWeight 
            ? `${fromWeight} → ${toWeight}`
            : toWeight 
              ? `${toWeight} Products`
              : `From ${fromWeight}`
          }
        </div>
      )}
      <div style={lineStyle} />
    </div>
  );
};

interface ResponsiveColumnBreakProps {
  baseFontSizePx: number;
  forceBreak?: boolean;
  avoidBreak?: boolean;
  columns: number;
}

export const ResponsiveColumnBreak: React.FC<ResponsiveColumnBreakProps> = ({
  baseFontSizePx,
  forceBreak = false,
  avoidBreak = false,
  columns
}) => {
  const breakStyle: React.CSSProperties = useMemo(() => {
    const baseStyle = {
      width: '100%',
      height: `${baseFontSizePx * 0.1}px`,
    };

    if (forceBreak) {
      return {
        ...baseStyle,
        breakAfter: 'column' as const,
      };
    }

    if (avoidBreak) {
      return {
        ...baseStyle,
        breakInside: 'avoid' as const,
      };
    }

    // Responsive break behavior based on column count
    if (columns >= 3) {
      return {
        ...baseStyle,
        breakInside: 'avoid-column' as const,
      };
    }

    return baseStyle;
  }, [baseFontSizePx, forceBreak, avoidBreak, columns]);

  return <div style={breakStyle} />;
};