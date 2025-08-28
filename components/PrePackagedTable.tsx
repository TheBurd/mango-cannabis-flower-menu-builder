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

// Function to get CSS Grid column configuration based on settings
const getGridColumns = (showTerpenes: boolean, showNetWeight: boolean): string => {
  const columns: string[] = [];
  
  columns.push('25%'); // Strain
  columns.push('18%'); // Brand
  columns.push('8%');  // THC%
  
  if (showTerpenes) {
    columns.push('8%'); // Terp%
  }
  
  columns.push('10%'); // Type
  
  if (showNetWeight) {
    columns.push('10%'); // Net Weight
  }
  
  columns.push('10%'); // Price
  
  // Calculate remaining space and adjust if needed
  const totalPercent = columns.reduce((sum, col) => sum + parseFloat(col), 0);
  if (totalPercent < 100) {
    const remaining = 100 - totalPercent;
    // Distribute remaining space to strain column
    columns[0] = `${25 + remaining}%`;
  }
  
  return columns.join(' ');
};

// Function to render as CSS Grid rows when shelf splitting is enabled
const renderAsGridRows = (
  shelf: PrePackagedShelf,
  productsToRender: PrePackagedProduct[],
  baseFontSizePx: number,
  linePaddingMultiplier: number,
  marginBottomStyle: string,
  applyAvoidBreakStyle: boolean,
  showOverflowWarning: boolean,
  showTerpenes: boolean,
  showNetWeight: boolean
) => {
  // Extract shelf color hex for styling
  const getShelfColorHex = (colorClass: string): string => {
    if (colorClass.includes('bg-[') && colorClass.includes(']')) {
      const match = colorClass.match(/bg-\[(.+)\]/);
      return match ? match[1] : '#6B7280';
    }
    return '#6B7280'; // Default gray if can't parse
  };

  const shelfColorHex = getShelfColorHex(shelf.color);
  
  // Grid configuration
  const gridColumns = getGridColumns(showTerpenes, showNetWeight);
  const columnHeaders = getColumnHeaders(showTerpenes, showNetWeight);
  
  // Professional shelf header styling
  const shelfHeaderStyle: React.CSSProperties = {
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
    breakInside: 'avoid-column' as const,
  };

  // Grid header row styling
  const gridHeaderStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridColumns,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb',
    borderTop: '2px solid #e5e7eb',
    borderLeft: '2px solid #e5e7eb',
    borderRight: '2px solid #e5e7eb',
    fontWeight: '600',
    fontSize: `${baseFontSizePx * 0.85}px`,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: `${baseFontSizePx * 0.5}px 0`,
    borderRadius: '6px 6px 0 0',
    breakInside: 'avoid-column' as const,
  };

  // Grid header cell styling
  const gridHeaderCellStyle: React.CSSProperties = {
    padding: `0 ${baseFontSizePx * 0.4}px`,
    display: 'flex',
    alignItems: 'center',
  };

  // Grid product row styling
  const getGridRowStyle = (product: PrePackagedProduct, index: number, isLastRow: boolean): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: gridColumns,
    alignItems: 'center',
    backgroundColor: product.isSoldOut ? '#fef2f2' : product.isLowStock ? `${shelfColorHex}20` : (index % 2 === 0 ? 'white' : '#fafbfc'),
    borderLeft: product.isSoldOut ? '4px solid #ef4444' : product.isLowStock ? `4px solid ${shelfColorHex}` : '2px solid #e5e7eb',
    borderRight: '2px solid #e5e7eb',
    borderBottom: isLastRow ? '2px solid #e5e7eb' : '1px solid #f3f4f6',
    padding: `${baseFontSizePx * linePaddingMultiplier * 0.7}px 0`,
    fontSize: `${baseFontSizePx * 0.9}px`,
    lineHeight: '1.4',
    borderRadius: isLastRow ? '0 0 6px 6px' : '0',
    breakInside: 'auto' as const,
  });

  // Grid cell styling
  const gridCellStyle: React.CSSProperties = {
    padding: `0 ${baseFontSizePx * 0.4}px`,
    display: 'flex',
    alignItems: 'center',
  };

  // Enhanced brand cell styling with emphasis support
  const brandGridCellStyle: React.CSSProperties = {
    ...gridCellStyle,
    fontWeight: shelf.brandEmphasis ? '600' : '500',
    fontSize: shelf.brandEmphasis ? `${baseFontSizePx * 0.95}px` : `${baseFontSizePx * 0.9}px`,
    color: shelf.brandEmphasis ? '#1f2937' : '#374151',
  };

  // Professional strain name styling
  const strainNameStyle: React.CSSProperties = {
    fontWeight: '500',
    color: '#111827',
    lineHeight: '1.3',
  };

  // Enhanced price styling
  const priceStyle: React.CSSProperties = {
    fontWeight: '700',
    color: '#059669',
    fontSize: `${baseFontSizePx * 0.92}px`,
  };

  // Notes styling for additional product information
  const notesStyle: React.CSSProperties = {
    fontSize: `${baseFontSizePx * 0.75}px`,
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: `${baseFontSizePx * 0.3}px`,
  };

  const elements: React.ReactElement[] = [];

  // Shelf header
  elements.push(
    <div
      key={`${shelf.id}-header`}
      className={shelf.color}
      style={shelfHeaderStyle}
    >
      {shelf.name}
    </div>
  );

  // Grid header row
  elements.push(
    <div
      key={`${shelf.id}-grid-header`}
      style={gridHeaderStyle}
    >
      {columnHeaders.map((header) => (
        <div
          key={header.key}
          style={{
            ...gridHeaderCellStyle,
            justifyContent: header.key === 'price' ? 'flex-end' : 
                          header.key === 'type' || header.key === 'thc' || header.key === 'terpenes' ? 'center' : 'flex-start',
          }}
        >
          {header.label}
        </div>
      ))}
    </div>
  );

  // Product rows
  productsToRender.forEach((product, index) => {
    const isLastRow = index === productsToRender.length - 1;
    
    elements.push(
      <div
        key={product.id}
        style={getGridRowStyle(product, index, isLastRow)}
      >
        {/* Strain name column */}
        <div style={gridCellStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${baseFontSizePx * 0.4}px`, width: '100%' }}>
            {/* Sold Out Icon */}
            {product.isSoldOut && (
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
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
            {/* Low Stock Icon */}
            {product.isLowStock && !product.isSoldOut && (
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
            <span style={{ 
              ...strainNameStyle, 
              textDecoration: product.isSoldOut ? 'line-through' : 'none', 
              color: product.isSoldOut ? '#9ca3af' : strainNameStyle.color 
            }}>{product.name}</span>
            {product.notes && (
              <span style={notesStyle}>
                ({product.notes})
              </span>
            )}
          </div>
        </div>
        
        {/* Brand column */}
        <div style={brandGridCellStyle}>
          {product.brand}
        </div>
        
        {/* THC percentage column */}
        <div style={{ ...gridCellStyle, justifyContent: 'center' }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            {formatPercentage(product.thc)}
          </span>
        </div>
        
        {/* Conditional terpenes column */}
        {showTerpenes && (
          <div style={{ ...gridCellStyle, justifyContent: 'center' }}>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>
              {formatPercentage(product.terpenes)}
            </span>
          </div>
        )}
        
        {/* Type indicator column */}
        <div style={{ ...gridCellStyle, justifyContent: 'center' }}>
          <StrainTypeIndicator 
            type={product.type} 
            baseFontSizePx={baseFontSizePx * 0.75}
          />
        </div>
        
        {/* Conditional net weight column */}
        {showNetWeight && (
          <div style={{ ...gridCellStyle, justifyContent: 'center' }}>
            <span style={{ fontSize: `${baseFontSizePx * 0.85}px`, color: '#6b7280' }}>
              {product.netWeight || ''}
            </span>
          </div>
        )}
        
        {/* Price column */}
        <div style={{ ...gridCellStyle, justifyContent: 'flex-end' }}>
          <span style={shelf.hidePricing ? {} : priceStyle}>
            {shelf.hidePricing ? '' : formatPrice(product.price)}
          </span>
        </div>
      </div>
    );
  });

  // Handle empty shelf
  if (productsToRender.length === 0) {
    elements.push(
      <div
        key={`${shelf.id}-empty`}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          padding: `${baseFontSizePx * linePaddingMultiplier}px`,
          fontSize: `${baseFontSizePx * 0.85}px`,
          color: '#9ca3af',
          fontStyle: 'italic',
          textAlign: 'center' as const,
          breakInside: 'auto' as const,
          minHeight: `${baseFontSizePx * 2}px`,
        }}
      >
        No products on this shelf yet.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: marginBottomStyle }}>
      {showOverflowWarning && (
        <div style={{
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
        }}>
          ⚠ This shelf may be too tall for the current layout
        </div>
      )}
      
      {elements}
    </div>
  );
};

// Helper function to get column headers based on settings
const getColumnHeaders = (showTerpenes: boolean, showNetWeight: boolean) => {
  const headers = [
    { key: 'strain', label: 'Strain' },
    { key: 'brand', label: 'Brand' },
    { key: 'thc', label: 'THC%' },
  ];

  if (showTerpenes) {
    headers.push({ key: 'terpenes', label: 'Terp%' });
  }

  headers.push({ key: 'type', label: 'Type' });

  if (showNetWeight) {
    headers.push({ key: 'netWeight', label: 'Net Wt.' });
  }

  headers.push({ key: 'price', label: 'Price' });

  return headers;
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
  // When shelf splitting is enabled (applyAvoidBreakStyle = false), render as CSS Grid rows
  // When shelf splitting is disabled (applyAvoidBreakStyle = true), render as HTML table
  if (!applyAvoidBreakStyle) {
    return renderAsGridRows(
      shelf,
      productsToRender,
      baseFontSizePx,
      linePaddingMultiplier,
      marginBottomStyle,
      applyAvoidBreakStyle,
      showOverflowWarning,
      showTerpenes,
      showNetWeight
    );
  }

  // Continue with original HTML table implementation below when shelf splitting is disabled
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
      breakInside: 'avoid-column' as const,
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

  // Column configuration based on settings for HTML table
  const getTableColumnHeaders = () => {
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

  const columnHeaders = getTableColumnHeaders();

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
                backgroundColor: product.isSoldOut ? '#fef2f2' : product.isLowStock ? `${shelfColorHex}20` : (index % 2 === 0 ? 'white' : '#fafbfc'),
                transition: 'background-color 0.15s ease',
                borderLeft: product.isSoldOut ? '4px solid #ef4444' : product.isLowStock ? `4px solid ${shelfColorHex}` : 'none',
              }}
            >
              {/* Strain name column with enhanced styling */}
              <td style={{ ...tableCellStyle, borderRight: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${baseFontSizePx * 0.4}px` }}>
                  {/* Sold Out Icon */}
                  {product.isSoldOut && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
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
                  {/* Low Stock Icon */}
                  {product.isLowStock && !product.isSoldOut && (
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
                  <span style={{ 
                    ...strainNameStyle, 
                    textDecoration: product.isSoldOut ? 'line-through' : 'none', 
                    color: product.isSoldOut ? '#9ca3af' : strainNameStyle.color 
                  }}>{product.name}</span>
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

// Export the renderAsGridRows function for backwards compatibility
export { renderAsGridRows };