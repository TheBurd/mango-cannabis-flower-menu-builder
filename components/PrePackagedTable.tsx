import React, { useMemo } from 'react';
import { PrePackagedShelf, PrePackagedProduct, SupportedStates } from '../types';
import { StrainTypeIndicator } from './common/StrainTypeIndicator';

interface PrePackagedTableProps {
  shelf: PrePackagedShelf;
  productsToRender: PrePackagedProduct[];
  baseFontSizePx: number;
  linePaddingMultiplier: number;
  marginBottomStyle: string;
  applyAvoidBreakStyle: boolean;
  showOverflowWarning: boolean;
  currentState: SupportedStates;
  showTerpenes: boolean;
  showLowStock: boolean; // Renamed from showInventoryStatus
  showNetWeight: boolean;
}

const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
};

export const PrePackagedTable: React.FC<PrePackagedTableProps> = ({
  shelf,
  productsToRender,
  baseFontSizePx,
  linePaddingMultiplier,
  marginBottomStyle,
  applyAvoidBreakStyle,
  showOverflowWarning,
  currentState,
  showTerpenes,
  showLowStock, // Renamed from showInventoryStatus
  showNetWeight,
}) => {
  // Shelf header styling - professional and prominent
  const shelfHeaderStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 1.8}px`,
    fontWeight: 'bold',
    textAlign: 'center' as const,
    padding: `${baseFontSizePx * 0.6}px ${baseFontSizePx * 1.0}px`,
    marginBottom: `${baseFontSizePx * 0.6}px`,
    borderRadius: '8px',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    background: shelf.color.includes('gradient') ? shelf.color : `${shelf.color} linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))`,
    border: '1px solid rgba(255,255,255,0.1)',
  }), [baseFontSizePx, shelf.color]);

  // Table container styling
  const tableContainerStyle: React.CSSProperties = useMemo(() => ({
    marginBottom: marginBottomStyle,
    ...(applyAvoidBreakStyle && {
      breakInside: 'avoid' as const,
    }),
  }), [marginBottomStyle, applyAvoidBreakStyle]);

  // Professional table styling
  const tableStyle: React.CSSProperties = useMemo(() => ({
    width: '100%',
    borderCollapse: 'separate' as const,
    borderSpacing: '0',
    fontSize: `${baseFontSizePx * 0.9}px`,
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  }), [baseFontSizePx]);

  // Professional table header styling
  const tableHeaderStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    padding: `${baseFontSizePx * 0.5}px ${baseFontSizePx * 0.4}px`,
    fontSize: `${baseFontSizePx * 0.85}px`,
    textAlign: 'left' as const,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  }), [baseFontSizePx]);

  // Professional table cell styling
  const tableCellStyle: React.CSSProperties = useMemo(() => ({
    padding: `${baseFontSizePx * linePaddingMultiplier * 0.7}px ${baseFontSizePx * 0.4}px`,
    borderBottom: '1px solid #f3f4f6',
    fontSize: `${baseFontSizePx * 0.9}px`,
    verticalAlign: 'middle' as const,
    lineHeight: '1.4',
  }), [baseFontSizePx, linePaddingMultiplier]);

  // Enhanced brand cell styling with emphasis support
  const brandCellStyle: React.CSSProperties = useMemo(() => ({
    ...tableCellStyle,
    fontWeight: shelf.brandEmphasis ? '600' : '500',
    fontSize: shelf.brandEmphasis ? `${baseFontSizePx * 0.95}px` : tableCellStyle.fontSize,
    color: shelf.brandEmphasis ? '#1f2937' : '#374151',
  }), [tableCellStyle, shelf.brandEmphasis, baseFontSizePx]);

  // Professional strain name styling
  const strainNameStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: '500',
    color: '#111827',
    lineHeight: '1.3',
  }), []);

  // Enhanced price styling
  const priceStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: '700',
    color: '#059669',
    fontSize: `${baseFontSizePx * 0.92}px`,
  }), [baseFontSizePx]);

  // Professional overflow warning styling
  const overflowWarningStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e',
    padding: `${baseFontSizePx * 0.4}px ${baseFontSizePx * 0.6}px`,
    fontSize: `${baseFontSizePx * 0.75}px`,
    borderRadius: '4px',
    marginBottom: `${baseFontSizePx * 0.5}px`,
    textAlign: 'center' as const,
    fontWeight: '500',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }), [baseFontSizePx]);

  // Notes styling for additional product information
  const notesStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 0.75}px`, 
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: `${baseFontSizePx * 0.3}px`,
  }), [baseFontSizePx]);

  // Extract shelf color hex for low stock highlighting
  const getShelfColorHex = (colorClass: string): string => {
    if (colorClass.includes('bg-[') && colorClass.includes(']')) {
      const match = colorClass.match(/bg-\[(.+)\]/);
      return match ? match[1] : '#6B7280';
    }
    return '#6B7280'; // Default gray if can't parse
  };

  const shelfColorHex = getShelfColorHex(shelf.color);

  // Low stock styling with shelf-specific coloring
  const getLowStockStyle = (isLowStock: boolean): React.CSSProperties => ({
    ...tableCellStyle,
    fontSize: `${baseFontSizePx * 0.8}px`,
    fontWeight: isLowStock ? '600' : '400',
    color: isLowStock ? shelfColorHex : '#6b7280',
  });

  // Column configuration based on settings
  const getColumnHeaders = () => {
    const headers = [
      { key: 'strain', label: 'Strain', width: '25%' },
      { key: 'brand', label: 'Brand', width: '18%' },
      { key: 'thc', label: 'THC%', width: '8%' },
    ];

    if (showTerpenes) {
      headers.push({ key: 'terpenes', label: 'Terp%', width: '8%' });
    }

    headers.push(
      { key: 'type', label: 'Type', width: '10%' } // Increased width since weight column is removed
    );

    if (showNetWeight) {
      headers.push({ key: 'netWeight', label: 'Net Wt.', width: '10%' });
    }

    // Low stock is now indicated by highlighting and icon only - no column needed

    headers.push({ key: 'price', label: 'Price', width: '10%' });

    return headers;
  };

  const columnHeaders = getColumnHeaders();

  if (productsToRender.length === 0) {
    return null;
  }

  return (
    <div style={tableContainerStyle}>
      {showOverflowWarning && (
        <div style={overflowWarningStyle} className="shelf-overflow-warning">
          ⚠ This shelf may be too tall for the current layout
        </div>
      )}
      
      {/* Professional shelf header */}
      <div
        className={shelf.color}
        style={shelfHeaderStyle}
      >
        {shelf.name}
      </div>
      
      {/* Professional product table */}
      <table style={tableStyle}>
        {/* Column group for consistent sizing */}
        <colgroup>
          {columnHeaders.map((header) => (
            <col key={header.key} style={{ width: header.width }} />
          ))}
        </colgroup>
        
        {/* Enhanced table header */}
        <thead>
          <tr>
            {columnHeaders.map((header, index) => (
              <th 
                key={header.key}
                style={{
                  ...tableHeaderStyle,
                  textAlign: header.key === 'price' ? 'right' as const : 'left' as const,
                  borderRight: index < columnHeaders.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Professional product rows */}
        <tbody>
          {productsToRender.map((product, index) => (
            <tr 
              key={product.id}
              style={{
                backgroundColor: product.isLowStock ? `${shelfColorHex}20` : (index % 2 === 0 ? 'white' : '#fafbfc'),
                transition: 'background-color 0.15s ease',
                borderLeft: product.isLowStock ? `4px solid ${shelfColorHex}` : 'none',
              }}
            >
              {/* Strain name column with enhanced styling */}
              <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${baseFontSizePx * 0.4}px` }}>
                  {/* Low Stock Icon */}
                  {product.isLowStock && (
                    <svg 
                      width={`${baseFontSizePx * 0.9}px`} 
                      height={`${baseFontSizePx * 0.9}px`} 
                      viewBox="0 0 100 90" 
                      fill="none" 
                      style={{ flexShrink: 0 }}
                    >
                      <path 
                        fill="#dc2626" 
                        d="M44.104 4.04c2.757-4.423 9.285-4.352 11.92.214l43.034 74.535c2.677 4.638-.67 10.435-6.025 10.435H6.967c-5.355 0-8.702-5.797-6.025-10.435L43.975 4.254l.129-.214Zm8.478 2.201c-1.148-1.987-4.017-1.987-5.164 0L4.385 80.777c-1.112 1.925.2 4.317 2.37 4.465l.212.007h86.066l.213-.007c2.1-.143 3.395-2.388 2.47-4.277l-.1-.188L52.581 6.24Z" 
                      />
                      <path 
                        fill="#dc2626" 
                        d="M40.85 27.152h17.756l-1.51 34H42.361l-1.511-34Zm-.377 44.805c0-5.289 3.778-8.235 9.293-8.235 5.44 0 9.218 2.946 9.218 8.235 0 5.29-3.778 8.16-9.218 8.16-5.515 0-9.293-2.87-9.293-8.16Z" 
                      />
                    </svg>
                  )}
                  <span style={strainNameStyle}>{product.name}</span>
                  {product.notes && (
                    <span style={notesStyle}>
                      ({product.notes})
                    </span>
                  )}
                </div>
              </td>
              
              {/* Brand column with conditional emphasis */}
              <td style={{ ...brandCellStyle, borderRight: '1px solid #f3f4f6' }}>
                {product.brand}
              </td>
              
              {/* THC percentage column */}
              <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6', textAlign: 'left' as const }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>
                  {formatPercentage(product.thc)}
                </span>
              </td>
              
              {/* Conditional terpenes column */}
              {showTerpenes && (
                <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6', textAlign: 'left' as const }}>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>
                    {formatPercentage(product.terpenes)}
                  </span>
                </td>
              )}
              
              {/* Type indicator column */}
              <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6', textAlign: 'left' as const }}>
                <StrainTypeIndicator 
                  type={product.type} 
                  baseFontSizePx={baseFontSizePx * 0.75}
                />
              </td>
              
              {/* Weight/size column removed - now handled at shelf level */}
              
              {/* Conditional net weight column */}
              {showNetWeight && (
                <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6', textAlign: 'left' as const }}>
                  <span style={{ fontSize: `${baseFontSizePx * 0.85}px`, color: '#6b7280' }}>
                    {product.netWeight || ''}
                  </span>
                </td>
              )}
              
              {/* Low stock is now indicated by highlighting and icon only - column removed */}
              
              {/* Price column with enhanced styling */}
              <td style={{ 
                ...tableCellStyle, 
                textAlign: 'right' as const,
                ...(shelf.hidePricing ? {} : priceStyle)
              }}>
                {shelf.hidePricing ? '' : formatPrice(product.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};