import React from 'react';
import { Shelf, Strain, SupportedStates } from '../types'; 
import { StrainTypeIndicator } from './common/StrainTypeIndicator';
import { THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE, getShelfPricingByName } from '../constants';
import { getPatternPath } from '../utils/assets';

interface MenuTableProps {
  shelf: Shelf;
  strainsToRender: Strain[]; 
  baseFontSizePx: number;
  linePaddingMultiplier: number; // Controls the top/bottom padding of line items
  marginBottomStyle?: string;
  // headerText?: string; // Removed: No longer passing "(cont.)" text
  applyAvoidBreakStyle?: boolean;
  showOverflowWarning?: boolean; // Show subtle overlay warning for shelves that might overflow
  currentState?: SupportedStates; // Current app state for pricing calculations
}

const getScaledFontSize = (base: number, multiplier: number, min: number = 7): string =>
  `${Math.max(min, base * multiplier)}px`;

const getScaledValue = (base: number, multiplier: number, min: number = 0): number =>
    Math.max(min, base * multiplier);

// Function to render shelves as flowing rows when tighten shelves is enabled
const renderAsFlowingRows = (shelf: Shelf, strainsToRender: Strain[], baseFontSizePx: number, linePaddingMultiplier: number, marginBottomStyle?: string, applyAvoidBreakStyle?: boolean, showOverflowWarning?: boolean, currentState?: SupportedStates) => {
  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
  
  // Add CSS for infused pattern
  const infusedPatternCSS = `
    .infused-pattern::before, .infused-header::before, .infused-column-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("${getPatternPath('sick-ass-pattern.svg')}");
      background-size: 300px 300px;
      background-repeat: repeat;
      background-position: 0 0;
      filter: hue-rotate(30deg) saturate(0.4) brightness(1.5) opacity(0.06);
      pointer-events: none;
      z-index: 0;
    }
    .infused-pattern > *, .infused-header > *, .infused-column-header > * {
      position: relative;
      z-index: 1;
    }
    .infused-header::before, .infused-column-header::before {
      filter: hue-rotate(30deg) saturate(0.4) brightness(1.8) opacity(0.08);
    }
  `;
  
  // Map shelf colors to actual hex values for borders
  const getShelfBorderColor = (shelfColor: string): string => {
    const colorMap: Record<string, string> = {
      'bg-purple-600': '#9333ea',
      'bg-amber-500': '#f59e0b',
      'bg-sky-500': '#0ea5e9',
      'bg-slate-700': '#334155',
      'bg-rose-500': '#f43f5e',
      'bg-emerald-500': '#10b981',
      'bg-indigo-500': '#6366f1',
      'bg-gray-500': '#6b7280',
      'bg-lime-600': '#65a30d',
      'bg-teal-600': '#0d9488',
      'bg-violet-500': '#8b5cf6',
      'bg-mango-gradient': '#fe9426', // Use the primary mango color for gradient borders
      'bg-gradient-to-r from-red-500 to-orange-500': '#ef4444', // 50% OFF shelf - red-500
      'bg-gradient-to-r from-rose-600 to-pink-600': '#e11d48', // Exotic Live Resin Infused - rose-600
      'bg-gradient-to-r from-emerald-600 to-teal-600': '#059669', // Premium Distillate Infused - emerald-600
      'bg-gradient-to-r from-gray-600 to-slate-600': '#4b5563', // Value Distillate Infused - gray-600
    };
    return colorMap[shelfColor] || '#6b7280'; // Default to gray if color not found
  };
  
  const shelfBorderColor = getShelfBorderColor(shelf.color);
  
  // IMPROVED: More compact header styles
  const headerPaddingVertical = getScaledValue(baseFontSizePx, 0.35, 3); // Reduced from 0.4
  const titleFontSize = Math.max(11, baseFontSizePx * 1.3); // Reduced from 1.4
  const pricingFontSize = Math.max(7, baseFontSizePx * 0.7); // Reduced from 0.75
  const titleLineHeight = 1.0; // Reduced from 1.1
  const pricingLineHeight = 1.0; // Reduced from 1.1
  const spaceBetween = getScaledValue(baseFontSizePx, 0.03, 1); // Reduced spacing
  
  const calculatedHeaderHeight = 
    (headerPaddingVertical * 2) + 
    (titleFontSize * titleLineHeight) + 
    spaceBetween + 
    (pricingFontSize * pricingLineHeight) + 
    getScaledValue(baseFontSizePx, 0.1, 1); // Reduced extra space

  // IMPROVED: More compact row styles for flowing layout
  const rowHeight = getScaledValue(baseFontSizePx, 1.8, 18); // Reduced from 2.2
  
  const elements: React.ReactElement[] = [];
  
  // Add CSS for infused pattern if needed
  if (shelf.isInfused) {
    elements.push(
      <style key={`${shelf.id}-infused-css`} dangerouslySetInnerHTML={{ __html: infusedPatternCSS }} />
    );
  }
  
  // Add header element
  elements.push(
    <div
      key={`${shelf.id}-header`}
      className={`${shelf.color} ${shelf.textColor} shadow-md ${shelf.isInfused ? 'infused-header' : ''}`}
      style={{
        marginBottom: '0',
        padding: `${headerPaddingVertical}px ${getScaledValue(baseFontSizePx, 0.5, 5)}px`, // Reduced padding
        breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
        breakAfter: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
        position: 'relative',
        height: `${calculatedHeaderHeight}px`,
        minHeight: `${calculatedHeaderHeight}px`,
        border: `2px solid ${shelfBorderColor}`,
        borderRadius: '4px 4px 0 0', // Standard radius
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Reduced shadow
      }}
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        transform: 'translateY(-50%)',
        paddingLeft: getScaledValue(baseFontSizePx, 0.5, 5),
        paddingRight: getScaledValue(baseFontSizePx, 0.5, 5)
      }}>
        <h3 style={{
          fontSize: getScaledFontSize(baseFontSizePx, 1.3, 11), // Reduced font size
          fontWeight: 700,
          marginBottom: `${spaceBetween}px`,
          lineHeight: titleLineHeight,
        }}>{shelf.name}</h3>
        {!shelf.hidePricing && (
          <p style={{
            fontSize: getScaledFontSize(baseFontSizePx, 0.7, 7), // Reduced font size
            opacity: 0.9,
            lineHeight: pricingLineHeight,
          }}>
            {shelf.isInfused && shelf.pricing.fiveG ? 
              `${formatPrice(shelf.pricing.g)}/g | ${formatPrice(shelf.pricing.fiveG)}/5g` :
              `${formatPrice(shelf.pricing.g)}/g | ${formatPrice(shelf.pricing.eighth)}/8th | ${formatPrice(shelf.pricing.quarter)}/Qtr | ${formatPrice(shelf.pricing.half)}/Half | ${formatPrice(shelf.pricing.oz)}/Oz`
            }
          </p>
        )}
      </div>
    </div>
  );

  // IMPROVED: More compact column headers
  const isFiftyPercentOff = shelf.name === "50% OFF STRAINS";
  const gridColumns = isFiftyPercentOff ? '25% 20% 28% 12% 15%' : '35% 30% 15% 20%';
  
  elements.push(
    <div
      key={`${shelf.id}-column-headers`}
      className={`${shelf.color} ${shelf.textColor} ${shelf.isInfused ? 'infused-column-header' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        alignItems: 'center',
        minHeight: `${getScaledValue(baseFontSizePx, 1.6, 16)}px`, // Reduced from 2.0
        padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`, // Reduced padding
        borderLeft: `2px solid ${shelfBorderColor}`,
        borderRight: `2px solid ${shelfBorderColor}`,
        borderBottom: `1px solid rgba(255,255,255,0.15)`,
        marginBottom: '0',
        fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8), // Reduced from 0.8
        fontWeight: 600,
        breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
        breakAfter: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>Strain</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>Grower/Brand</div>
      {isFiftyPercentOff && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>50% OFF Price</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Type</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>THC %</div>
    </div>
  );
  
  // IMPROVED: More compact individual strain rows
  strainsToRender.forEach((strain, index) => {
    const isLastRow = index === strainsToRender.length - 1;
    
    // Calculate pricing for 50% OFF shelf
    let originalPrice = 0;
    let halfOffPrice = 0;
    if (isFiftyPercentOff && strain.originalShelf && currentState) {
      const originalShelfPricing = getShelfPricingByName(strain.originalShelf, currentState);
      if (originalShelfPricing) {
        originalPrice = originalShelfPricing.g;
        halfOffPrice = originalPrice / 2;
      }
    }
    
    elements.push(
      <div
        key={strain.id}
        className={`bg-white ${strain.isLastJar ? 'last-jar-row' : ''} ${strain.isSoldOut ? 'sold-out-row' : ''} ${shelf.isInfused ? 'infused-pattern' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          alignItems: 'center',
          minHeight: `${rowHeight}px`,
          padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`, // Reduced padding
          borderLeft: strain.isSoldOut ? `4px solid #ef4444` : strain.isLastJar ? `4px solid ${MANGO_MAIN_ORANGE}` : `2px solid ${shelfBorderColor}`,
          borderRight: `2px solid ${shelfBorderColor}`,
          borderBottom: isLastRow ? `2px solid ${shelfBorderColor}` : '1px solid #e5e7eb',
          backgroundColor: strain.isSoldOut ? '#fef2f2' : strain.isLastJar ? '#fff7ed' : '#ffffff',
          opacity: strain.isSoldOut ? 0.6 : 1,
          position: 'relative',
          marginBottom: '0',
          fontSize: getScaledFontSize(baseFontSizePx, 0.85, 9), // Reduced from 0.9
          breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
          boxSizing: 'border-box',
          color: strain.isSoldOut ? '#9ca3af' : '#374151',
          fontFamily: "'Inter', sans-serif",
          borderRadius: isLastRow ? '0 0 4px 4px' : '0', // Smaller border radius
          lineHeight: '1.3', // Reduced from 1.5
          textDecoration: strain.isSoldOut ? 'line-through' : 'none',
        }}
      >
        {/* Strain Name */}
        <div style={{
          lineHeight: '1.3', // Reduced line height
          display: 'flex',
          alignItems: 'center',
          color: strain.isSoldOut ? '#9ca3af' : '#374151',
          gap: '6px',
        }}>
          {strain.isSoldOut && (
            <span style={{
              padding: '2px 6px',
              fontSize: '10px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '3px',
              fontWeight: 'bold',
              textDecoration: 'none',
              flexShrink: 0,
            }}>
              SOLD OUT
            </span>
          )}
          <span style={{ textDecoration: strain.isSoldOut ? 'line-through' : 'none' }}>{strain.name || "Unnamed Strain"}</span>
        </div>
        
        {/* Grower */}
        <div style={{
          lineHeight: '1.3', // Reduced line height
          display: 'flex',
          alignItems: 'center',
          fontStyle: 'italic',
          opacity: 0.85,
          color: '#374151',
        }}>
          {strain.grower || '-'}
        </div>
        
        {/* 50% OFF Pricing */}
        {isFiftyPercentOff && (
          <div style={{
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            color: '#374151',
          }}>
            {strain.originalShelf && originalPrice > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  textDecoration: 'line-through',
                  color: '#ef4444',
                  fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8),
                  fontWeight: 400,
                }}>
                  {formatPrice(originalPrice)}/g
                </span>
                <span style={{
                  color: '#16a34a',
                  fontSize: getScaledFontSize(baseFontSizePx, 0.9, 9),
                  fontWeight: 700,
                }}>
                  {formatPrice(halfOffPrice)}/g
                </span>
              </div>
            ) : (
              <span style={{
                color: '#9ca3af',
                fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8),
                fontStyle: 'italic',
              }}>
                Select shelf
              </span>
            )}
          </div>
        )}
        
        {/* Type */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <StrainTypeIndicator type={strain.type} baseFontSizePx={baseFontSizePx} />
        </div>
        
        {/* THC */}
        <div style={{
          lineHeight: '1.3', // Reduced line height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          whiteSpace: 'nowrap',
          fontWeight: 500, // Slightly bolder for better readability
          color: '#374151',
        }}>
          {strain.thc !== null ? `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%` : '-'}
        </div>
      </div>
    );
  });

  if (strainsToRender.length === 0) {
    elements.push(
      <div
        key={`${shelf.id}-empty`}
        className="bg-white"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'center',
          minHeight: `${rowHeight * 1.5}px`,
          padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`,
          borderLeft: `2px solid ${shelfBorderColor}`,
          borderRight: `2px solid ${shelfBorderColor}`,
          borderBottom: `2px solid ${shelfBorderColor}`,
          backgroundColor: '#ffffff',
          marginBottom: '0',
          fontSize: getScaledFontSize(baseFontSizePx, 0.85, 9),
          breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
          boxSizing: 'border-box',
          color: '#9ca3af',
          fontFamily: "'Inter', sans-serif",
          borderRadius: '0 0 4px 4px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        No strains on this shelf yet.
      </div>
    );
  }

  return (
    <div
      className="MenuTable-flowing"
      style={{
        marginBottom: marginBottomStyle || '16px',
        breakInside: (applyAvoidBreakStyle ? 'avoid-column' : 'auto') as any,
        position: 'relative',
      }}
    >
      {elements}
      {/* Subtle overflow warning overlay - hidden during export */}
      {showOverflowWarning && (
        <div 
          className="shelf-overflow-warning absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
            border: '2px dashed rgba(251, 191, 36, 0.3)',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          <div 
            className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium shadow-sm"
            style={{ fontSize: '10px' }}
          >
            ⚠️ Long shelf - consider enabling "Allow Shelf Splitting"
          </div>
        </div>
      )}
    </div>
  );
};

export const MenuTable: React.FC<MenuTableProps> = ({
  shelf,
  strainsToRender,
  baseFontSizePx,
  linePaddingMultiplier,
  marginBottomStyle,
  applyAvoidBreakStyle,
  showOverflowWarning = false,
  currentState,
}) => {

  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;

  // When tighten shelves is ON (applyAvoidBreakStyle = false), render as flowing divs
  // When tighten shelves is OFF (applyAvoidBreakStyle = true), render as table
  if (!applyAvoidBreakStyle) {
    return renderAsFlowingRows(shelf, strainsToRender, baseFontSizePx, linePaddingMultiplier, marginBottomStyle, applyAvoidBreakStyle, showOverflowWarning, currentState);
  }

  // IMPROVED: More compact table styles
  const outerDivStyle: React.CSSProperties = {
    marginBottom: marginBottomStyle || '16px',
    // When shelf splitting is disabled, ensure the entire shelf stays together
    breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
    // Force break before shelf if needed to keep it together
    ...(applyAvoidBreakStyle && { breakBefore: 'auto' as any }),
    position: 'relative',
  };

  const tableStylesBase: React.CSSProperties = {
    width: '100%',
    borderSpacing: '0',
    borderCollapse: 'collapse' as const,
    fontFamily: "'Inter', sans-serif",
    tableLayout: 'fixed' as const,
    // Control table breaking based on shelf splitting setting
    breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
  };

  // IMPROVED: More compact header calculations
  const headerPaddingVertical = getScaledValue(baseFontSizePx, 0.35, 3); // Reduced from 0.4
  const titleFontSize = Math.max(11, baseFontSizePx * 1.3); // Reduced from 1.4
  const pricingFontSize = Math.max(7, baseFontSizePx * 0.7); // Reduced from 0.75
  const titleLineHeight = 1.0; // Reduced from 1.1
  const pricingLineHeight = 1.0; // Reduced from 1.1
  const spaceBetween = getScaledValue(baseFontSizePx, 0.03, 1); // Reduced spacing

  const calculatedHeaderHeight = 
    (headerPaddingVertical * 2) + 
    (titleFontSize * titleLineHeight) + 
    spaceBetween + 
    (pricingFontSize * pricingLineHeight) + 
    getScaledValue(baseFontSizePx, 0.1, 1); // Reduced extra space

  const shelfActualHeaderStyle: React.CSSProperties = {
    position: 'relative',
    height: `${calculatedHeaderHeight}px`,
    minHeight: `${calculatedHeaderHeight}px`,
    marginBottom: '0',
    // When shelf splitting is disabled, keep header with its table
    breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
    breakAfter: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
  };

  const shelfNameStyle: React.CSSProperties = {
    fontSize: getScaledFontSize(baseFontSizePx, 1.3, 11), // Reduced font size
    fontWeight: 700,
    marginBottom: `${spaceBetween}px`,
    lineHeight: titleLineHeight,
  };

  const pricingStyle: React.CSSProperties = {
    fontSize: getScaledFontSize(baseFontSizePx, 0.7, 7), // Reduced font size
    opacity: 0.9,
    lineHeight: pricingLineHeight,
  };

  const tableHeaderStyles: React.CSSProperties = {
    display: 'table-header-group',
    // Keep table headers together with their content when shelf splitting is disabled
    breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
    breakAfter: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
  };

  const thStyles: React.CSSProperties = {
    textAlign: 'left',
    borderBottom: `1px solid rgba(255,255,255,0.15)`,
    fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8), // Reduced from 0.8
    fontWeight: 600,
    whiteSpace: 'nowrap',
    verticalAlign: 'top',
    minHeight: `${getScaledValue(baseFontSizePx, 1.6, 16)}px`, // Reduced from 2.0
    position: 'relative',
  };

  // IMPROVED: More compact cell styles
  const getTdStyles = (isLastJar: boolean): React.CSSProperties => ({
    padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`, // Reduced padding
    borderBottom: `1px solid #e5e7eb`,
    verticalAlign: 'top',
    color: '#374151',
    fontSize: getScaledFontSize(baseFontSizePx, 0.85, 9), // Reduced from 0.9
    lineHeight: '1.3', // Reduced from 1.5
    backgroundColor: isLastJar ? '#fff7ed' : '#ffffff',
    background: isLastJar ? '#fff7ed' : '#ffffff',
    minHeight: `${getScaledValue(baseFontSizePx, 1.8, 18)}px`, // Reduced from 2.2
    position: 'relative',
    boxSizing: 'border-box',
  });

  const strainNameTextStyles: React.CSSProperties = {
     lineHeight: '1.2', // Slightly tighter
  };

  // Handle border color for gradient backgrounds
  const getBorderColorClass = (shelfColor: string): string => {
    if (shelfColor === 'bg-mango-gradient') {
      return '';
    }
    if (shelfColor === 'bg-gradient-to-r from-red-500 to-orange-500') {
      return 'border-red-500';
    }
    return shelfColor.replace(/^bg-/, 'border-');
  };

  const getBorderStyle = (shelfColor: string): React.CSSProperties => {
    if (shelfColor === 'bg-mango-gradient') {
      return {
        borderColor: '#fe9426',
        borderWidth: '1px',
        borderStyle: 'solid',
      };
    }
    if (shelfColor === 'bg-gradient-to-r from-red-500 to-orange-500') {
      return {
        borderColor: '#ef4444', // Tailwind red-500
        borderWidth: '1px',
        borderStyle: 'solid',
      };
    }
    return {};
  };

  const borderColorClass = getBorderColorClass(shelf.color);
  const borderStyle = getBorderStyle(shelf.color);

  const tableWrapperStyle: React.CSSProperties = {
     ...borderStyle,
  };

  const displayName = shelf.name;

  return (
    <div
      className="MenuTable-root rounded-md shadow-md bg-white"
      style={outerDivStyle}
    >
      {/* IMPROVED: More compact shelf header */}
      <div
        className={`${shelf.color} ${shelf.textColor} rounded-t-md`}
        style={shelfActualHeaderStyle} 
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          transform: 'translateY(-50%)',
          paddingLeft: getScaledValue(baseFontSizePx, 0.5, 5), // Reduced padding
          paddingRight: getScaledValue(baseFontSizePx, 0.5, 5)
        }}>
                  <h3 style={shelfNameStyle}>{displayName}</h3>
        {!shelf.hidePricing && (
          <p style={pricingStyle}>
            {shelf.isInfused && shelf.pricing.fiveG ? 
              `${formatPrice(shelf.pricing.g)}/g | ${formatPrice(shelf.pricing.fiveG)}/5g` :
              `${formatPrice(shelf.pricing.g)}/g | ${formatPrice(shelf.pricing.eighth)}/8th | ${formatPrice(shelf.pricing.quarter)}/Qtr | ${formatPrice(shelf.pricing.half)}/Half | ${formatPrice(shelf.pricing.oz)}/Oz`
            }
          </p>
        )}
        </div>
      </div>

      {/* IMPROVED: More compact table container */}
      <div
        className={`rounded-b-md border-l border-r border-b border-t-0 ${borderColorClass}`.trim()}
        style={{
          ...tableWrapperStyle,
          backgroundColor: '#ffffff',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 4px 4px' // Smaller border radius
        }}
      >
        <table style={tableStylesBase}>
          <colgroup>
            <col style={{ width: '35%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead className={`${shelf.color} ${shelf.textColor}`} style={tableHeaderStyles}>
            <tr>
              <th style={{...thStyles, padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 'inherit'
                }}>
                  Strain
                </div>
              </th>
              <th style={{...thStyles, padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 'inherit'
                }}>
                  Grower/Brand
                </div>
              </th>
              <th style={{ ...thStyles, textAlign: 'center', padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px` }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'inherit'
                }}>
                  Type
                </div>
              </th>
              <th style={{ ...thStyles, textAlign: 'right', padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px` }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  minHeight: 'inherit'
                }}>
                  THC %
                </div>
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
            {strainsToRender.map((strain, index) => (
              <tr key={strain.id} 
                  className={strain.isLastJar ? 'last-jar-row' : ''}
                  style={{ 
                    backgroundColor: strain.isLastJar ? '#fff7ed' : '#ffffff',
                    background: strain.isLastJar ? '#fff7ed' : '#ffffff',
                    // Allow individual strain rows to break across columns when shelf splitting is enabled
                    breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
                  }}
              >
                <td style={{
                  ...getTdStyles(strain.isLastJar), 
                  ...(index === strainsToRender.length - 1 && { 
                    borderBottom: 'none',
                    borderBottomLeftRadius: '4px' // Smaller border radius
                  })
                }}>
                  <div style={{
                    lineHeight: '1.3', // Reduced line height
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 'inherit',
                    gap: '6px',
                  }}>
                    {strain.isSoldOut && (
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}>
                        SOLD OUT
                      </span>
                    )}
                    <span style={{
                      ...strainNameTextStyles, 
                      lineHeight: '1.2',
                      textDecoration: strain.isSoldOut ? 'line-through' : 'none',
                      color: strain.isSoldOut ? '#9ca3af' : 'inherit'
                    }}>{strain.name || "Unnamed Strain"}</span>
                  </div>
                </td>
                <td style={{
                  ...getTdStyles(strain.isLastJar), 
                  fontStyle: 'italic', 
                  opacity: 0.85, 
                  ...(index === strainsToRender.length - 1 && { borderBottom: 'none' }) 
                }}>
                  <div style={{
                    lineHeight: '1.2', // Reduced line height
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 'inherit'
                  }}>
                    {strain.grower || '-'}
                  </div>
                </td>
                <td 
                  style={{ 
                    ...getTdStyles(strain.isLastJar), 
                    textAlign: 'center',
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    ...(index === strainsToRender.length - 1 && { borderBottom: 'none' }) 
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%'
                  }}>
                    <StrainTypeIndicator type={strain.type} baseFontSizePx={baseFontSizePx} />
                  </div>
                </td>
                <td style={{ 
                  ...getTdStyles(strain.isLastJar), 
                  textAlign: 'right', 
                  whiteSpace: 'nowrap', 
                  fontWeight: 500, // Slightly bolder for better readability
                  ...(index === strainsToRender.length - 1 && { 
                    borderBottom: 'none',
                    borderBottomRightRadius: '4px' // Smaller border radius
                  }) 
                }}>
                  <div style={{
                    lineHeight: '1.2', // Reduced line height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: 'inherit'
                  }}>
                    {strain.thc !== null ? `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%` : '-'}
                  </div>
                </td>
              </tr>
            ))}
             {strainsToRender.length === 0 && (
              <tr>
                <td colSpan={4} style={{
                  ...getTdStyles(false), 
                  textAlign: 'center', 
                  color: '#9ca3af', 
                  fontStyle: 'italic', 
                  borderBottom: 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'inherit'
                  }}>
                    No strains on this shelf yet.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Subtle overflow warning overlay - hidden during export */}
      {showOverflowWarning && (
        <div 
          className="shelf-overflow-warning absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
            border: '2px dashed rgba(251, 191, 36, 0.3)',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          <div 
            className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium shadow-sm"
            style={{ fontSize: '10px' }}
          >
            ⚠️ Long shelf - consider enabling "Allow Shelf Splitting"
          </div>
        </div>
      )}
    </div>
  );
};

// Export the renderAsFlowingRows function for backwards compatibility
export { renderAsFlowingRows };
