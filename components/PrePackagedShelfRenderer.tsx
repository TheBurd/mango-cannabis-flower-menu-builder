import React, { useMemo } from 'react';
import { PrePackagedShelf, PrePackagedProduct, SupportedStates } from '../types';
import { StrainTypeIndicator } from './common/StrainTypeIndicator';

interface PrePackagedShelfRendererProps {
  shelf: PrePackagedShelf;
  productsToRender: PrePackagedProduct[];
  baseFontSizePx: number;
  linePaddingMultiplier: number;
  marginBottomStyle: string;
  applyAvoidBreakStyle: boolean;
  showOverflowWarning: boolean;
  currentState: SupportedStates;
  showTerpenes: boolean;
  showInventoryStatus: boolean;
  showNetWeight: boolean;
}

const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
};

const extractBracketColor = (val: string, prefix: 'bg' | 'text'): string | null => {
  const match = val?.match(new RegExp(`^${prefix}-\\[(.+)\\]$`));
  return match?.[1] || null;
};

export const PrePackagedShelfRenderer: React.FC<PrePackagedShelfRendererProps> = ({
  shelf,
  productsToRender,
  baseFontSizePx,
  linePaddingMultiplier,
  marginBottomStyle,
  applyAvoidBreakStyle,
  showOverflowWarning,
  currentState,
  showTerpenes,
  showInventoryStatus,
  showNetWeight,
}) => {
  const bgBracket = extractBracketColor(shelf.color, 'bg');
  const textBracket = extractBracketColor(shelf.textColor, 'text');
  const isBgClass = shelf.color.startsWith('bg-') && !bgBracket;
  const isTextClass = shelf.textColor.startsWith('text-') && !textBracket;
  const resolvedBackground = !isBgClass ? (bgBracket || shelf.color) : undefined;
  const resolvedTextColor = !isTextClass ? (textBracket || shelf.textColor) : undefined;
  const shelfHeaderStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 1.6}px`,
    fontWeight: 'bold',
    textAlign: 'center' as const,
    padding: `${Math.max(3, baseFontSizePx * 0.5)}px ${Math.max(5, baseFontSizePx * 0.8)}px`,
    marginBottom: `${Math.max(3, baseFontSizePx * 0.6)}px`,
    borderRadius: '6px',
    color: resolvedTextColor || 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    lineHeight: Math.max(1.1, 1.3 + linePaddingMultiplier * 0.2), // Responsive header line height
    backgroundColor: resolvedBackground,
  }), [baseFontSizePx, linePaddingMultiplier, resolvedBackground, resolvedTextColor]);

  const tableStyle: React.CSSProperties = useMemo(() => ({
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: `${baseFontSizePx * 0.9}px`,
    marginBottom: marginBottomStyle,
    ...(applyAvoidBreakStyle && {
      breakInside: 'avoid-column' as const,
    }),
  }), [baseFontSizePx, marginBottomStyle, applyAvoidBreakStyle]);

  const tableHeaderStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    padding: `${Math.max(2, baseFontSizePx * 0.4)}px ${Math.max(2, baseFontSizePx * 0.3)}px`,
    fontSize: `${baseFontSizePx * 0.8}px`,
    border: '1px solid #dee2e6',
    textAlign: 'left' as const,
    lineHeight: Math.max(1.0, 1.1 + linePaddingMultiplier * 0.2), // Responsive header line height
  }), [baseFontSizePx, linePaddingMultiplier]);

  const tableCellStyle: React.CSSProperties = useMemo(() => ({
    padding: `${Math.max(1, baseFontSizePx * linePaddingMultiplier * 0.6)}px ${Math.max(2, baseFontSizePx * 0.3)}px`,
    border: '1px solid #dee2e6',
    fontSize: `${baseFontSizePx * 0.85}px`,
    verticalAlign: 'top' as const,
    lineHeight: Math.max(1.0, 1.2 + linePaddingMultiplier * 0.3), // Responsive line height
  }), [baseFontSizePx, linePaddingMultiplier]);

  const brandCellStyle: React.CSSProperties = useMemo(() => ({
    ...tableCellStyle,
    fontWeight: shelf.brandEmphasis ? 'bold' : 'normal',
    fontSize: shelf.brandEmphasis ? `${baseFontSizePx * 0.9}px` : tableCellStyle.fontSize,
  }), [tableCellStyle, shelf.brandEmphasis, baseFontSizePx]);

  const priceStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: 'bold',
    color: '#2d5016',
  }), []);

  const overflowWarningStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    color: '#856404',
    padding: `${baseFontSizePx * 0.3}px ${baseFontSizePx * 0.5}px`,
    fontSize: `${baseFontSizePx * 0.7}px`,
    borderRadius: '3px',
    marginBottom: `${baseFontSizePx * 0.4}px`,
    textAlign: 'center' as const,
  }), [baseFontSizePx]);

  // Determine which columns to show based on settings
  const columns = [
    'strain',
    'brand',
    'thc',
    ...(showTerpenes ? ['terpenes'] : []),
    'type',
    'weight',
    ...(showNetWeight ? ['netWeight'] : []),
    ...(showInventoryStatus ? ['inventory'] : []),
    'price'
  ];

  if (productsToRender.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: marginBottomStyle }}>
      {showOverflowWarning && (
        <div style={overflowWarningStyle}>
          ⚠ This shelf may be too tall for the current layout
        </div>
      )}
      
      <div
        className={`${isBgClass ? shelf.color : ''} ${isTextClass ? shelf.textColor : ''}`.trim()}
        style={shelfHeaderStyle}
      >
        {shelf.name}
      </div>
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, width: '25%' }}>Strain</th>
            <th style={{ ...tableHeaderStyle, width: '20%' }}>Brand</th>
            <th style={{ ...tableHeaderStyle, width: '8%' }}>THC%</th>
            {showTerpenes && (
              <th style={{ ...tableHeaderStyle, width: '8%' }}>Terp%</th>
            )}
            <th style={{ ...tableHeaderStyle, width: '8%' }}>Type</th>
            <th style={{ ...tableHeaderStyle, width: '8%' }}>Size</th>
            {showNetWeight && (
              <th style={{ ...tableHeaderStyle, width: '10%' }}>Net Wt.</th>
            )}
            {showInventoryStatus && (
              <th style={{ ...tableHeaderStyle, width: '13%' }}>Status</th>
            )}
            <th style={{ ...tableHeaderStyle, width: '10%', textAlign: 'right' as const }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {productsToRender.map((product) => (
            <tr key={product.id}>
              <td style={tableCellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${baseFontSizePx * 0.3}px` }}>
                  <span>{product.name}</span>
                  {product.notes && (
                    <span style={{ 
                      fontSize: `${baseFontSizePx * 0.7}px`, 
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      ({product.notes})
                    </span>
                  )}
                </div>
              </td>
              <td style={brandCellStyle}>{product.brand}</td>
              <td style={tableCellStyle}>{formatPercentage(product.thc)}</td>
              {showTerpenes && (
                <td style={tableCellStyle}>{formatPercentage(product.terpenes)}</td>
              )}
              <td style={tableCellStyle}>
                <StrainTypeIndicator 
                  type={product.type} 
                  baseFontSizePx={baseFontSizePx * 0.7}
                />
              </td>
              <td style={tableCellStyle}>{product.weight}</td>
              {showNetWeight && (
                <td style={tableCellStyle}>{product.netWeight || ''}</td>
              )}
              {showInventoryStatus && (
                <td style={{
                  ...tableCellStyle,
                  fontSize: `${baseFontSizePx * 0.75}px`,
                  color: product.inventoryStatus?.toLowerCase().includes('last') ? '#dc3545' : tableCellStyle.color
                }}>
                  {product.inventoryStatus || ''}
                </td>
              )}
              <td style={{ 
                ...tableCellStyle, 
                textAlign: 'right' as const,
                ...(!shelf.hidePricing && priceStyle)
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
