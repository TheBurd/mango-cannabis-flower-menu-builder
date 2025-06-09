import React from 'react';
import { Shelf, Strain } from '../types'; 
import { StrainTypeIndicator } from './common/StrainTypeIndicator';
import { THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE } from '../constants';

interface MenuTableProps {
  shelf: Shelf;
  strainsToRender: Strain[]; 
  baseFontSizePx: number;
  linePaddingMultiplier: number; // Controls the top/bottom padding of line items
  marginBottomStyle?: string;
  // headerText?: string; // Removed: No longer passing "(cont.)" text
  applyAvoidBreakStyle?: boolean; 
}

const getScaledFontSize = (base: number, multiplier: number, min: number = 7): string =>
  `${Math.max(min, base * multiplier)}px`;

const getScaledValue = (base: number, multiplier: number, min: number = 0): number =>
    Math.max(min, base * multiplier);

// Function to render shelves as flowing rows when tighten shelves is enabled
const renderAsFlowingRows = (shelf: Shelf, strainsToRender: Strain[], baseFontSizePx: number, linePaddingMultiplier: number, marginBottomStyle?: string) => {
  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
  
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
    };
    return colorMap[shelfColor] || '#6b7280'; // Default to gray if color not found
  };
  
  const shelfBorderColor = getShelfBorderColor(shelf.color);
  
  // Header styles
  const headerPaddingVertical = getScaledValue(baseFontSizePx, 0.4, 4);
  const titleFontSize = Math.max(12, baseFontSizePx * 1.4);
  const pricingFontSize = Math.max(8, baseFontSizePx * 0.75);
  const titleLineHeight = 1.1;
  const pricingLineHeight = 1.1;
  const spaceBetween = getScaledValue(baseFontSizePx, 0.05, 1);
  
  const calculatedHeaderHeight = 
    (headerPaddingVertical * 2) + 
    (titleFontSize * titleLineHeight) + 
    spaceBetween + 
    (pricingFontSize * pricingLineHeight) + 
    getScaledValue(baseFontSizePx, 0.15, 2);

  // Row styles for flowing layout
  const rowHeight = getScaledValue(baseFontSizePx, 2.2, 22);
  
  const elements: React.ReactElement[] = [];
  
  // Add header element
  elements.push(
    <div
      key={`${shelf.id}-header`}
      className={`${shelf.color} ${shelf.textColor} shadow-md`}
      style={{
        marginBottom: '0', // Remove gap to connect with column headers
        padding: `${headerPaddingVertical}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`,
        breakInside: 'avoid-column',
        position: 'relative',
        height: `${calculatedHeaderHeight}px`,
        minHeight: `${calculatedHeaderHeight}px`,
        border: `2px solid ${shelfBorderColor}`,
        borderRadius: '6px 6px 0 0', // Remove bottom corners to connect with table
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        transform: 'translateY(-50%)',
        paddingLeft: getScaledValue(baseFontSizePx, 0.6, 6),
        paddingRight: getScaledValue(baseFontSizePx, 0.6, 6)
      }}>
        <h3 style={{
          fontSize: getScaledFontSize(baseFontSizePx, 1.4, 12),
          fontWeight: 700,
          marginBottom: `${spaceBetween}px`,
          lineHeight: titleLineHeight,
        }}>{shelf.name}</h3>
        <p style={{
          fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8),
          opacity: 0.9,
          lineHeight: pricingLineHeight,
        }}>
          {formatPrice(shelf.pricing.g)}/g | {formatPrice(shelf.pricing.eighth)}/8th | {formatPrice(shelf.pricing.quarter)}/Qtr | {formatPrice(shelf.pricing.half)}/Half | {formatPrice(shelf.pricing.oz)}/Oz
        </p>
      </div>
    </div>
  );

  // Add column headers
  elements.push(
    <div
      key={`${shelf.id}-column-headers`}
      className={`${shelf.color} ${shelf.textColor}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '35% 30% 15% 20%',
        alignItems: 'center',
        minHeight: `${getScaledValue(baseFontSizePx, 2.0, 20)}px`,
        padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px`,
        borderLeft: `2px solid ${shelfBorderColor}`,
        borderRight: `2px solid ${shelfBorderColor}`,
        borderBottom: `1px solid rgba(255,255,255,0.15)`,
        marginBottom: '0',
        fontSize: getScaledFontSize(baseFontSizePx, 0.8, 9),
        fontWeight: 600,
        breakInside: 'avoid-column',
        breakAfter: 'avoid-column',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>Strain</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>Grower/Brand</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Type</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>THC %</div>
    </div>
  );
  
  // Add individual strain rows as flowing divs
  strainsToRender.forEach((strain, index) => {
    const isLastRow = index === strainsToRender.length - 1;
    
    elements.push(
      <div
        key={strain.id}
        className={`bg-white ${strain.isLastJar ? 'last-jar-row' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '35% 30% 15% 20%',
          alignItems: 'center',
          minHeight: `${rowHeight}px`,
          padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px`, // Match table padding
          borderLeft: strain.isLastJar ? `4px solid ${MANGO_MAIN_ORANGE}` : `2px solid ${shelfBorderColor}`,
          borderRight: `2px solid ${shelfBorderColor}`,
          borderBottom: isLastRow ? `2px solid ${shelfBorderColor}` : '1px solid #e5e7eb', // Shelf border on last row, grey divider otherwise
          backgroundColor: strain.isLastJar ? '#fff7ed' : '#ffffff',
          marginBottom: '0',
          fontSize: getScaledFontSize(baseFontSizePx, 0.9, 10),
          breakInside: 'avoid-column',
          boxSizing: 'border-box',
          color: '#374151',
          fontFamily: "'Inter', sans-serif",
          borderRadius: isLastRow ? '0 0 6px 6px' : '0', // Only round bottom corners on last row
          lineHeight: '1.5', // Match table line height
        }}
      >
        {/* Strain Name */}
        <div style={{
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          color: '#374151',
        }}>
          {strain.name || "Unnamed Strain"}
        </div>
        
        {/* Grower */}
        <div style={{
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          fontStyle: 'italic',
          opacity: 0.85,
          color: '#374151',
        }}>
          {strain.grower || '-'}
        </div>
        
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
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          whiteSpace: 'nowrap',
          color: '#374151',
        }}>
          {strain.thc !== null ? `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%` : '-'}
        </div>
      </div>
    );
  });
  
  // Wrap in container with bottom margin
  return (
    <div style={{ marginBottom: marginBottomStyle || 0 }}>
      {elements}
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
}) => {
  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;

  // When tighten shelves is ON (applyAvoidBreakStyle = false), render as flowing divs
  // When tighten shelves is OFF (applyAvoidBreakStyle = true), render as table
  if (!applyAvoidBreakStyle) {
    return renderAsFlowingRows(shelf, strainsToRender, baseFontSizePx, linePaddingMultiplier, marginBottomStyle);
  }

  // Original table rendering for when tighten shelves is OFF
  const outerDivStyle: React.CSSProperties = {
    marginBottom: marginBottomStyle || 0,
    display: 'block', 
    width: '100%',
    breakInside: 'avoid-column',
  };

  // Calculate tighter header height for more vertical space
  const headerPaddingVertical = getScaledValue(baseFontSizePx, 0.4, 4); // Reduced padding
  const titleFontSize = Math.max(12, baseFontSizePx * 1.4);
  const pricingFontSize = Math.max(8, baseFontSizePx * 0.75);
  const titleLineHeight = 1.1; // Tighter line height
  const pricingLineHeight = 1.1; // Tighter line height
  const spaceBetween = getScaledValue(baseFontSizePx, 0.05, 1); // Minimal spacing
  
  const calculatedHeaderHeight = 
    (headerPaddingVertical * 2) + 
    (titleFontSize * titleLineHeight) + 
    spaceBetween + 
    (pricingFontSize * pricingLineHeight) + 
    getScaledValue(baseFontSizePx, 0.15, 2); // Reduced extra space

  const shelfActualHeaderStyle: React.CSSProperties = {
    padding: `${headerPaddingVertical}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`, // Consistent padding
    breakInside: 'avoid-column', // Keep shelf name and pricing block together
    breakAfter: 'avoid-column',  // Try to avoid a column break immediately after this header
    position: 'relative', // For positioning content
    height: `${calculatedHeaderHeight}px`, // Set calculated height
    minHeight: `${calculatedHeaderHeight}px`, // Ensure minimum height
  };

  const shelfNameStyle: React.CSSProperties = {
    fontSize: getScaledFontSize(baseFontSizePx, 1.4, 12),
    fontWeight: 700,
    marginBottom: `${spaceBetween}px`, // Use calculated spacing
    lineHeight: titleLineHeight, // Use calculated line height
  };

  const pricingStyle: React.CSSProperties = {
    fontSize: getScaledFontSize(baseFontSizePx, 0.75, 8),
    opacity: 0.9,
    lineHeight: pricingLineHeight, // Use calculated line height
  };

  const tableStylesBase: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    borderCollapse: 'collapse', // Standard table border collapse
    fontSize: getScaledFontSize(baseFontSizePx, 0.9, 10),
    lineHeight: '1.2',
    backgroundColor: '#ffffff', // Use hex instead of 'white !important'
    background: '#ffffff', // Also set background property
    tableLayout: 'fixed', // Fixed table layout for more predictable rendering
    borderRadius: '0 0 6px 6px', // Match the container's bottom border radius
    overflow: 'hidden', // Ensure content respects border radius
    // Allow table to break when tighten shelves is enabled
    ...(applyAvoidBreakStyle ? {} : { breakInside: 'auto' })
  };
  
  const tableHeaderStyles: React.CSSProperties = {
    breakInside: 'avoid-column', // Try to keep the table header from splitting
    // `display: table-header-group;` is standard for thead and can influence print/paged media repetition
  };


  const thStyles: React.CSSProperties = {
    textAlign: 'left',
    borderBottom: `1px solid rgba(255,255,255,0.15)`,
    fontSize: getScaledFontSize(baseFontSizePx, 0.8, 9),
    fontWeight: 600,
    whiteSpace: 'nowrap',
    verticalAlign: 'top', // Changed to top for flexbox alignment
    minHeight: `${getScaledValue(baseFontSizePx, 2.0, 20)}px`, // Use minHeight for consistency
    position: 'relative', // For positioning context
  };

  const getTdStyles = (isLastJar: boolean): React.CSSProperties => ({
    padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px`, // Add vertical padding back for wrapping
    borderBottom: `1px solid #e5e7eb`,
    verticalAlign: 'top',
    color: '#374151',
    fontSize: getScaledFontSize(baseFontSizePx, 0.9, 10),
    lineHeight: '1.5',
    backgroundColor: isLastJar ? '#fff7ed' : '#ffffff', // Conditional background
    background: isLastJar ? '#fff7ed' : '#ffffff', // Conditional background
    minHeight: `${getScaledValue(baseFontSizePx, 2.2, 22)}px`, // Use minHeight instead of fixed height
    position: 'relative', // Provide positioning context for absolute children
    boxSizing: 'border-box',
  });

  const strainNameTextStyles: React.CSSProperties = {
     lineHeight: '1.2',
  };

  const borderColorClass = shelf.color.replace(/^bg-/, 'border-');

  const tableWrapperStyle: React.CSSProperties = {
     // Ensure overflow is not 'auto' or 'hidden' here if it was added previously,
     // as that would prevent internal table content from breaking with the parent column flow.
     // Default 'visible' is fine.
  };

  const displayName = shelf.name; // No more headerText for "(cont.)"

  return (
    <div
      className="MenuTable-root rounded-md shadow-md bg-white"
      style={outerDivStyle}
    >
      <style>{`
        /* CSS-based styling for Last Jar strains */
        /* Font weight handled via inline styles for better control */
      `}</style>
      {/* Shelf Actual Header (name, pricing) */}
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
          paddingLeft: getScaledValue(baseFontSizePx, 0.6, 6),
          paddingRight: getScaledValue(baseFontSizePx, 0.6, 6)
        }}>
          <h3 style={shelfNameStyle}>{displayName}</h3>
          <p style={pricingStyle}>
            {formatPrice(shelf.pricing.g)}/g | {formatPrice(shelf.pricing.eighth)}/8th | {formatPrice(shelf.pricing.quarter)}/Qtr | {formatPrice(shelf.pricing.half)}/Half | {formatPrice(shelf.pricing.oz)}/Oz
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div
        className={`rounded-b-md border-l border-r border-b border-t-0 ${borderColorClass}`}
        style={{
          ...tableWrapperStyle,
          backgroundColor: '#ffffff',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden', // Ensure rounded corners are respected
          borderRadius: '0 0 6px 6px' // Explicit border radius to match table
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
              <th style={{...thStyles, padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px`}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 'inherit'
                }}>
                  Strain
                </div>
              </th>
              <th style={{...thStyles, padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px`}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 'inherit'
                }}>
                  Grower/Brand
                </div>
              </th>
              <th style={{ ...thStyles, textAlign: 'center', padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px` }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'inherit'
                }}>
                  Type
                </div>
              </th>
              <th style={{ ...thStyles, textAlign: 'right', padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier, 3)}px ${getScaledValue(baseFontSizePx, 0.8, 8)}px` }}>
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
                    backgroundColor: strain.isLastJar ? '#fff7ed' : '#ffffff', // Light orange background for last jar
                    background: strain.isLastJar ? '#fff7ed' : '#ffffff',
                  }}
              >
                <td style={{
                  ...getTdStyles(strain.isLastJar), 
                  ...(index === strainsToRender.length - 1 && { 
                    borderBottom: 'none',
                    borderBottomLeftRadius: '6px' // Round bottom-left corner for first cell in last row
                  })
                }}>
                  <div style={{
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 'inherit' // Match the cell's minimum height
                  }}>
                    <span style={{
                      ...strainNameTextStyles, 
                      lineHeight: '1.4' // Slightly tighter for better wrapping
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
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 'inherit' // Match the cell's minimum height
                  }}>
                    {strain.grower || '-'}
                  </div>
                </td>
                <td 
                  style={{ 
                    ...getTdStyles(strain.isLastJar), 
                    textAlign: 'center',
                    display: 'table-cell', // Ensure table cell display 
                    verticalAlign: 'middle', // Center vertically in table cell
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
                  ...(index === strainsToRender.length - 1 && { 
                    borderBottom: 'none',
                    borderBottomRightRadius: '6px' // Round bottom-right corner for last cell in last row
                  }) 
                }}>
                  <div style={{
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: 'inherit' // Match the cell's minimum height
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
                    No strains on this shelf.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
