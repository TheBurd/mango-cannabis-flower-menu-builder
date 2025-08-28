import React, { useMemo } from 'react';
import { PrePackagedProduct, SupportedStates } from '../types';
import { StrainTypeIndicator } from './common/StrainTypeIndicator';

export interface ProductGroup {
  id: string;
  title: string;
  products: PrePackagedProduct[];
  priority: number; // For sorting groups (lower = higher priority)
  color?: string;
  textColor?: string;
}

interface ProductGroupRendererProps {
  group: ProductGroup;
  baseFontSizePx: number;
  linePaddingMultiplier: number;
  currentState: SupportedStates;
  showTerpenes: boolean;
  showInventoryStatus: boolean;
  showNetWeight: boolean;
  showPricing: boolean;
  brandEmphasis?: boolean;
  groupByBrand?: boolean;
  sortByPrice?: boolean;
}

const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
};

// Group products by brand within a product group
const groupProductsByBrand = (products: PrePackagedProduct[]): Map<string, PrePackagedProduct[]> => {
  const brandGroups = new Map<string, PrePackagedProduct[]>();
  
  products.forEach(product => {
    const brand = product.brand || 'Unknown Brand';
    if (!brandGroups.has(brand)) {
      brandGroups.set(brand, []);
    }
    brandGroups.get(brand)!.push(product);
  });
  
  return brandGroups;
};

// Sort products by price within a group
const sortProductsByPrice = (products: PrePackagedProduct[]): PrePackagedProduct[] => {
  return [...products].sort((a, b) => b.price - a.price); // Higher price first
};

export const ProductGroupRenderer: React.FC<ProductGroupRendererProps> = ({
  group,
  baseFontSizePx,
  linePaddingMultiplier,
  currentState,
  showTerpenes,
  showInventoryStatus,
  showNetWeight,
  showPricing,
  brandEmphasis = true,
  groupByBrand = false,
  sortByPrice = true
}) => {
  const groupHeaderStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 1.3}px`,
    fontWeight: 'bold',
    textAlign: 'left' as const,
    padding: `${baseFontSizePx * 0.4}px ${baseFontSizePx * 0.6}px`,
    marginBottom: `${baseFontSizePx * 0.4}px`,
    marginTop: `${baseFontSizePx * 0.8}px`,
    borderRadius: '4px',
    backgroundColor: group.color || '#f8f9fa',
    color: group.textColor || '#333',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  }), [baseFontSizePx, group.color, group.textColor]);

  const tableStyle: React.CSSProperties = useMemo(() => ({
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: `${baseFontSizePx * 0.9}px`,
    marginBottom: `${baseFontSizePx * 1}px`,
  }), [baseFontSizePx]);

  const tableHeaderStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    padding: `${baseFontSizePx * 0.4}px ${baseFontSizePx * 0.3}px`,
    fontSize: `${baseFontSizePx * 0.8}px`,
    border: '1px solid #dee2e6',
    textAlign: 'left' as const,
  }), [baseFontSizePx]);

  const tableCellStyle: React.CSSProperties = useMemo(() => ({
    padding: `${baseFontSizePx * linePaddingMultiplier * 0.6}px ${baseFontSizePx * 0.3}px`,
    border: '1px solid #dee2e6',
    fontSize: `${baseFontSizePx * 0.85}px`,
    verticalAlign: 'top' as const,
  }), [baseFontSizePx, linePaddingMultiplier]);

  const brandCellStyle: React.CSSProperties = useMemo(() => ({
    ...tableCellStyle,
    fontWeight: brandEmphasis ? 'bold' : 'normal',
    fontSize: brandEmphasis ? `${baseFontSizePx * 0.9}px` : tableCellStyle.fontSize,
  }), [tableCellStyle, brandEmphasis, baseFontSizePx]);

  const brandHeaderStyle: React.CSSProperties = useMemo(() => ({
    fontSize: `${baseFontSizePx * 1.1}px`,
    fontWeight: 'bold',
    color: '#666',
    padding: `${baseFontSizePx * 0.5}px 0`,
    borderBottom: '2px solid #e0e0e0',
    marginTop: `${baseFontSizePx * 0.8}px`,
    marginBottom: `${baseFontSizePx * 0.4}px`,
  }), [baseFontSizePx]);

  const priceStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: 'bold',
    color: '#2d5016',
  }), []);

  // Organize products based on settings
  const organizedProducts = useMemo(() => {
    let products = group.products;
    
    if (sortByPrice) {
      products = sortProductsByPrice(products);
    }
    
    if (groupByBrand) {
      return groupProductsByBrand(products);
    }
    
    return new Map([['all', products]]);
  }, [group.products, sortByPrice, groupByBrand]);

  // Determine which columns to show
  const columns = [
    'strain',
    'brand',
    'thc',
    ...(showTerpenes ? ['terpenes'] : []),
    'type',
    'weight',
    ...(showNetWeight ? ['netWeight'] : []),
    ...(showInventoryStatus ? ['inventory'] : []),
    ...(showPricing ? ['price'] : [])
  ];

  if (group.products.length === 0) {
    return null;
  }

  const renderProductTable = (products: PrePackagedProduct[], showHeader: boolean = true) => (
    <table style={tableStyle}>
      {showHeader && (
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
            {showPricing && (
              <th style={{ ...tableHeaderStyle, width: '10%', textAlign: 'right' as const }}>Price</th>
            )}
          </tr>
        </thead>
      )}
      <tbody>
        {products.map((product) => (
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
            {showPricing && (
              <td style={{ 
                ...tableCellStyle, 
                textAlign: 'right' as const,
                ...priceStyle
              }}>
                {formatPrice(product.price)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div style={groupHeaderStyle}>
        {group.title}
      </div>
      
      {groupByBrand ? (
        Array.from(organizedProducts.entries()).map(([brand, products], index) => (
          <div key={brand}>
            {brand !== 'all' && (
              <div style={brandHeaderStyle}>
                {brand}
              </div>
            )}
            {renderProductTable(products, index === 0)}
          </div>
        ))
      ) : (
        renderProductTable(Array.from(organizedProducts.values())[0])
      )}
    </div>
  );
};